/**
 * In-memory offline store.
 *
 * When the backend is unreachable every API call is transparently redirected
 * here. All mutations work exactly like the real API but nothing is persisted
 * to a database, so changes are lost on page reload.
 */

import type { Candidate } from '../types';

// ─── Unique-id helper ────────────────────────────────────────────────────────

let _seq = 0;
const uid = () => `offline-${Date.now()}-${++_seq}`;

// ─── Seed data ───────────────────────────────────────────────────────────────

const now = new Date().toISOString();

const SEED: Candidate[] = [
  {
    _id: 'offline-seed-1',
    name: 'Alice Martin',
    email: 'alice.martin@example.com',
    phone: '+33612345678',
    position: 'Développeuse Frontend',
    experience: 4,
    skills: ['React', 'TypeScript', 'Tailwind'],
    status: 'pending',
    isDeleted: false,
    createdAt: now,
    updatedAt: now,
  },
  {
    _id: 'offline-seed-2',
    name: 'Bob Dupont',
    email: 'bob.dupont@example.com',
    phone: '+33687654321',
    position: 'Développeur Backend',
    experience: 6,
    skills: ['Node.js', 'Express', 'MongoDB'],
    status: 'validated',
    isDeleted: false,
    createdAt: now,
    updatedAt: now,
  },
  {
    _id: 'offline-seed-3',
    name: 'Clara Nguyen',
    email: 'clara.nguyen@example.com',
    phone: '+33698765432',
    position: 'Full Stack Engineer',
    experience: 3,
    skills: ['Vue.js', 'Laravel', 'PostgreSQL'],
    status: 'pending',
    isDeleted: false,
    createdAt: now,
    updatedAt: now,
  },
  {
    _id: 'offline-seed-4',
    name: 'David Lefevre',
    email: 'david.lefevre@example.com',
    phone: '+33611223344',
    position: 'DevOps Engineer',
    experience: 8,
    skills: ['Docker', 'Kubernetes', 'CI/CD', 'AWS'],
    status: 'validated',
    isDeleted: false,
    createdAt: now,
    updatedAt: now,
  },
  {
    _id: 'offline-seed-5',
    name: 'Emma Bernard',
    email: 'emma.bernard@example.com',
    phone: '+33644556677',
    position: 'UI/UX Designer',
    experience: 2,
    skills: ['Figma', 'Adobe XD', 'CSS'],
    status: 'pending',
    isDeleted: false,
    createdAt: now,
    updatedAt: now,
  },
];

// ─── Mutable store ───────────────────────────────────────────────────────────

let _candidates: Candidate[] = [...SEED];

// ─── CRUD operations ─────────────────────────────────────────────────────────

export const offlineStore = {
  /** List all non-deleted candidates (mirrors GET /api/candidates) */
  list(): { count: number; candidates: Candidate[] } {
    const candidates = _candidates.filter((c) => !c.isDeleted);
    return { count: candidates.length, candidates };
  },

  /** Get one candidate by id (mirrors GET /api/candidates/:id) */
  getById(id: string): Candidate | null {
    return _candidates.find((c) => c._id === id && !c.isDeleted) ?? null;
  },

  /** Create a candidate (mirrors POST /api/candidates) */
  create(data: Omit<Candidate, '_id' | 'isDeleted' | 'deletedAt' | 'createdAt' | 'updatedAt' | 'status'>): Candidate {
    const ts = new Date().toISOString();
    const candidate: Candidate = {
      ...data,
      _id: uid(),
      status: 'pending',
      isDeleted: false,
      createdAt: ts,
      updatedAt: ts,
    };
    _candidates = [candidate, ..._candidates];
    return candidate;
  },

  /** Update a candidate (mirrors PUT /api/candidates/:id) */
  update(id: string, data: Partial<Candidate>): Candidate | null {
    const idx = _candidates.findIndex((c) => c._id === id && !c.isDeleted);
    if (idx === -1) return null;
    const updated: Candidate = {
      ..._candidates[idx]!,
      ...data,
      _id: id,
      updatedAt: new Date().toISOString(),
    };
    _candidates = [
      ..._candidates.slice(0, idx),
      updated,
      ..._candidates.slice(idx + 1),
    ];
    return updated;
  },

  /** Soft-delete (mirrors DELETE /api/candidates/:id) */
  remove(id: string): boolean {
    const idx = _candidates.findIndex((c) => c._id === id && !c.isDeleted);
    if (idx === -1) return false;
    _candidates = _candidates.map((c) =>
      c._id === id ? { ...c, isDeleted: true, deletedAt: new Date() } : c
    );
    return true;
  },

  /**
   * Validate (mirrors POST /api/candidates/:id/validate).
   * Immediately sets status to "validated" (no async delay in offline mode).
   */
  validate(id: string): { status: 'pending' } | null {
    const c = _candidates.find((c) => c._id === id && !c.isDeleted);
    if (!c) return null;
    if (c.status === 'validated') return null; // already validated
    offlineStore.update(id, { status: 'validated' });
    return { status: 'pending' };
  },

  /** Reset to seed data (useful for tests) */
  reset() {
    _candidates = [...SEED];
  },
};
