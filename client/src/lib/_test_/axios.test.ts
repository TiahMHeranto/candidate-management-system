import { describe, it, expect, beforeEach, vi } from "vitest";
import api from "./axios";

describe("Axios instance", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("should add Authorization header if token exists", async () => {
    localStorage.setItem("authToken", "test-token");

    const requestInterceptor = (api.interceptors.request as any).handlers[0];

    const config = await requestInterceptor.fulfilled({
      headers: {},
    });

    expect(config.headers.Authorization).toBe("Bearer test-token");
  });

  it("should not add Authorization header if no token", async () => {
    const requestInterceptor = (api.interceptors.request as any).handlers[0];

    const config = await requestInterceptor.fulfilled({
      headers: {},
    });

    expect(config.headers.Authorization).toBeUndefined();
  });

  it("should handle 401 response", () => {
    const responseInterceptor = (api.interceptors.response as any).handlers[0];

    const mockError = {
      response: { status: 401 },
      config: {}
    };

    // Espionner localStorage.removeItem
    const removeItemSpy = vi.spyOn(localStorage, 'removeItem');
    
    // Appeler l'intercepteur et vérifier qu'il rejette
    const result = responseInterceptor.rejected(mockError);
    
    // Vérifier que c'est une promesse rejetée
    expect(result).rejects.toEqual(mockError);
    
    // Vérifier que localStorage.removeItem a été appelé
    expect(removeItemSpy).toHaveBeenCalledWith("authToken");
    
    // Restaurer l'espion
    removeItemSpy.mockRestore();
  });
});