import axios, { type AxiosRequestConfig, type AxiosResponse } from 'axios';
import { offlineStore } from './offlineStore';
import { markOffline, markOnline, getIsOffline } from '../hooks/useOffline';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

// ─── Auth header ─────────────────────────────────────────────────────────────

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ─── Response: mark online / handle 401 ──────────────────────────────────────

api.interceptors.response.use(
  (response) => {
    markOnline();
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ─── Offline URL parser ───────────────────────────────────────────────────────

/**
 * Extract the path relative to /api from a full URL or path string.
 * Examples:
 *   "http://localhost:3000/api/candidates/abc123"  → "/api/candidates/abc123"
 *   "/api/candidates"                              → "/api/candidates"
 */
const parsePath = (config: AxiosRequestConfig): string => {
  const raw = (config.url ?? '').replace(API_BASE_URL, '');
  return raw.startsWith('/') ? raw : `/${raw}`;
};

// Matches /api/candidates/:id/validate
const RE_VALIDATE = /^\/api\/candidates\/([^/]+)\/validate$/;
// Matches /api/candidates/:id
const RE_CANDIDATE = /^\/api\/candidates\/([^/]+)$/;
// Matches /api/candidates
const RE_CANDIDATES = /^\/api\/candidates\/?$/;
// Matches /api/auth/login
const RE_LOGIN = /^\/api\/auth\/login$/;

/** Build a minimal axios-like response object from a plain value */
const fakeResponse = <T>(data: T, status = 200): AxiosResponse<T> =>
  ({ data, status, statusText: 'OK', headers: {}, config: {} as any });

/** Reject with a 404-style error */
const notFound = (msg = 'Not found') =>
  Promise.reject({
    isOfflineFallback: true,
    response: { status: 404, data: { message: msg } },
  });

/** Reject with a 400-style error */
const badRequest = (msg: string) =>
  Promise.reject({
    isOfflineFallback: true,
    response: { status: 400, data: { message: msg } },
  });

// ─── Offline request handler ──────────────────────────────────────────────────

async function handleOfflineRequest(config: AxiosRequestConfig): Promise<AxiosResponse> {
  const path = parsePath(config);
  const method = (config.method ?? 'get').toLowerCase();
  const body = config.data
    ? typeof config.data === 'string'
      ? JSON.parse(config.data)
      : config.data
    : {};

  // POST /api/auth/login  → accept any credentials in offline mode
  if (RE_LOGIN.test(path) && method === 'post') {
    const token = btoa(`offline:${body.email}:${Date.now()}`);
    return fakeResponse({ token });
  }

  // POST /api/candidates/:id/validate
  const validateMatch = path.match(RE_VALIDATE);
  if (validateMatch && method === 'post') {
    const id = validateMatch[1]!;
    const result = offlineStore.validate(id);
    if (!result) return badRequest('Ce candidat est déjà validé ou introuvable');
    return fakeResponse({ message: 'Validation en cours...', status: 'pending' });
  }

  // /api/candidates/:id  (GET, PUT, DELETE)
  const candidateMatch = path.match(RE_CANDIDATE);
  if (candidateMatch) {
    const id = candidateMatch[1]!;

    if (method === 'get') {
      const c = offlineStore.getById(id);
      if (!c) return notFound('Candidat non trouvé');
      return fakeResponse(c);
    }

    if (method === 'put') {
      const skills = Array.isArray(body.skills)
        ? body.skills
        : (body.skills ?? '').split(',').map((s: string) => s.trim()).filter(Boolean);
      const updated = offlineStore.update(id, { ...body, skills });
      if (!updated) return notFound('Candidat non trouvé');
      return fakeResponse(updated);
    }

    if (method === 'delete') {
      const ok = offlineStore.remove(id);
      if (!ok) return notFound('Candidat non trouvé');
      return fakeResponse({ message: 'Candidat supprimé avec succès' });
    }
  }

  // /api/candidates  (GET, POST)
  if (RE_CANDIDATES.test(path)) {
    if (method === 'get') {
      return fakeResponse(offlineStore.list());
    }

    if (method === 'post') {
      const skills = Array.isArray(body.skills)
        ? body.skills
        : (body.skills ?? '').split(',').map((s: string) => s.trim()).filter(Boolean);

      if (!body.name) return badRequest('Le nom est requis');
      if (!body.email) return badRequest("L'email est requis");

      const created = offlineStore.create({ ...body, skills });
      return fakeResponse(created, 201);
    }
  }

  // Fallback: unhandled route
  return Promise.reject({
    isOfflineFallback: true,
    response: { status: 404, data: { message: 'Route non disponible hors-ligne' } },
  });
}

// ─── Wrap api.request to intercept at call time ───────────────────────────────

const originalRequest = api.request.bind(api);

api.request = async function <T = any>(config: AxiosRequestConfig): Promise<AxiosResponse<T>> {
  if (getIsOffline()) {
    return handleOfflineRequest(config) as Promise<AxiosResponse<T>>;
  }

  try {
    const response = await originalRequest<T>(config);
    return response;
  } catch (error: any) {
    // Network error (no response) → switch to offline mode and retry locally
    if (!error.response) {
      markOffline();
      return handleOfflineRequest(config) as Promise<AxiosResponse<T>>;
    }
    throw error;
  }
};

// Proxy the convenience methods through api.request so the override applies
const makeMethod =
  (method: string) =>
  <T = any>(url: string, dataOrConfig?: any, config?: AxiosRequestConfig) => {
    const isDataMethod = ['post', 'put', 'patch'].includes(method);
    return api.request<T>({
      url,
      method,
      ...(isDataMethod ? { data: dataOrConfig, ...config } : { ...dataOrConfig }),
    });
  };

api.get = makeMethod('get') as typeof api.get;
api.post = makeMethod('post') as typeof api.post;
api.put = makeMethod('put') as typeof api.put;
api.delete = makeMethod('delete') as typeof api.delete;
api.patch = makeMethod('patch') as typeof api.patch;

export default api;
