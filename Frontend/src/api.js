/**
 * Optional hosted API — set VITE_API_URL (or VITE_REMOTE_API_URL) in .env when needed.
 * No default remote URL is bundled.
 */
function remoteApiBase() {
  const raw =
    import.meta.env.VITE_API_URL ?? import.meta.env.VITE_REMOTE_API_URL ?? "";
  return String(raw).trim().replace(/\/$/, "");
}

/**
 * Dev: "" → same-origin /api → Vite proxy → backend (default VITE_PROXY_TARGET :3000).
 * Prod: only VITE_API_URL / VITE_REMOTE_API_URL (required for deployed frontend).
 */
export const API_BASE = import.meta.env.DEV ? "" : remoteApiBase();

export function apiUrl(path, baseOverride = API_BASE) {
  const p = path.startsWith("/") ? path : `/${path}`;
  const base = String(baseOverride ?? "").replace(/\/$/, "");
  return `${base}${p}`;
}

/**
 * Dev: local proxy first; if VITE_API_URL is set, retry against it after failures.
 * Prod: only configured remote origin(s).
 *
 * VITE_API_PREFER_LOCAL=false — try VITE_API_URL first in dev, then proxy.
 */
function apiBaseAttempts() {
  const remote = remoteApiBase();

  if (!import.meta.env.DEV) {
    return remote ? [remote] : [];
  }

  if (!remote) {
    return [""];
  }

  const preferLocal = import.meta.env.VITE_API_PREFER_LOCAL !== "false";
  return preferLocal ? ["", remote] : [remote, ""];
}

function shouldRetryWithHosted(devFirstAttempt, response) {
  if (!import.meta.env.DEV || !devFirstAttempt || !response) return false;
  return (
    response.status === 502 ||
    response.status === 503 ||
    response.status === 504
  );
}

export const API_SETUP_HINT =
  "Run the backend on port 3000 (see vite proxy) or set VITE_API_URL.";

/** Avoid infinite spinner; tries each base until one returns or all fail. */
export async function apiFetch(path, options = {}, timeoutMs = 20000) {
  const p = path.startsWith("/") ? path : `/${path}`;
  const bases = apiBaseAttempts();

  if (bases.length === 0) {
    throw new Error(
      `Missing API URL. Set VITE_API_URL for production builds. ${API_SETUP_HINT}`
    );
  }

  let lastError;

  for (let i = 0; i < bases.length; i++) {
    const base = String(bases[i]).replace(/\/$/, "");
    const url = `${base}${p}`;
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), timeoutMs);

    try {
      const res = await fetch(url, { ...options, signal: ctrl.signal });

      if (shouldRetryWithHosted(i === 0 && base === "", res)) {
        lastError = new Error(`Local API unavailable (${res.status})`);
        continue;
      }

      return res;
    } catch (e) {
      lastError = e;
      continue;
    } finally {
      clearTimeout(t);
    }
  }

  throw lastError ?? new Error("API unreachable");
}
