const REMOTE_DEFAULT = "https://personal-finance-tracker-kblh.onrender.com";

/** Hosted API base (Render). Same env works in dev & prod builds. */
function remoteApiBase() {
  const raw =
    import.meta.env.VITE_API_URL ??
    import.meta.env.VITE_REMOTE_API_URL ??
    REMOTE_DEFAULT;
  return String(raw).replace(/\/$/, "");
}

/**
 * Debug / compatibility: production uses hosted URL only.
 * In dev, "" means same-origin `/api…` → Vite proxy → localhost backend.
 */
export const API_BASE = import.meta.env.DEV ? "" : remoteApiBase();

export function apiUrl(path, baseOverride = API_BASE) {
  const p = path.startsWith("/") ? path : `/${path}`;
  const base = String(baseOverride ?? "").replace(/\/$/, "");
  return `${base}${p}`;
}

/**
 * Dev: try local API first (Vite proxy → :3000), then hosted API if proxy/backend fails.
 * Prod (e.g. Vercel): hosted API only — browsers cannot reach your machine's localhost.
 *
 * Set VITE_API_PREFER_LOCAL=false in dev to try hosted first, then local proxy.
 */
function apiBaseAttempts() {
  const remote = remoteApiBase();

  if (!import.meta.env.DEV) {
    return [remote];
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

/** Avoid infinite spinner; tries each base until one returns or all fail. */
export async function apiFetch(path, options = {}, timeoutMs = 20000) {
  const p = path.startsWith("/") ? path : `/${path}`;
  const bases = apiBaseAttempts();

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
