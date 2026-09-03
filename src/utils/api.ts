/**
 * Safe API Utilities for e-Yantra LNJPIT
 * Protects against unexpected HTML responses during server restarts or proxy drops
 */

export async function safeFetchJson<T = any>(url: string, options?: RequestInit): Promise<T | null> {
  try {
    const res = await fetch(url, options);
    if (!res.ok) return null;
    
    const text = await res.text();
    if (!text || text.trim().startsWith('<') || text.trim().startsWith('<!DOCTYPE') || text.trim().startsWith('<!doctype')) {
      return null;
    }
    
    return JSON.parse(text) as T;
  } catch {
    return null;
  }
}

export async function safeParseResponse<T = any>(res: Response): Promise<{ data: T | null; error: string | null }> {
  try {
    const text = await res.text();
    if (!text || text.trim().startsWith('<') || text.trim().startsWith('<!DOCTYPE') || text.trim().startsWith('<!doctype')) {
      return { data: null, error: res.ok ? null : `Server returned non-JSON response (${res.status})` };
    }
    const data = JSON.parse(text);
    return { data, error: null };
  } catch (err: any) {
    return { data: null, error: err?.message || 'Invalid JSON response' };
  }
}
