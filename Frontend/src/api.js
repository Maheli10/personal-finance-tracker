/* global __APP_VERCEL_BUILD__ */
function normalizeOrigin(url) {
  return String(url ?? "").trim().replace(/\/$/, "");
}

/** Override via VITE_RENDER_URL if your Render URL changes */
const DEFAULT_RENDER_ORIGIN = normalizeOrigin(
  import.meta.env.VITE_RENDER_URL ??
    "https://personal-finance-tracker-kblh.onrender.com"
);

function metaApiOrigin() {
  if (typeof document === "undefined") return "";
  const el = document.querySelector('meta[name="api-origin"]');
  const raw = el?.getAttribute("content")?.trim();
  if (!raw) return "";
  return normalizeOrigin(raw);
}

function isLocalFrontendHost() {
  if (typeof window === "undefined") return import.meta.env.DEV;
  const h = window.location.hostname;
  return h === "localhost" || h === "127.0.0.1";
}

function isVercelFrontendHost() {
  if (typeof window === "undefined") return false;
  const h = window.location.hostname;
  return (
    h.endsWith(".vercel.app") ||
    h.endsWith(".vercel.dev") ||
    h === "vercel.app"
  );
}

/**
 * After explicit env/meta: route by where the UI is served.
 * - localhost / 127.0.0.1 → same-origin `/api` (Vite dev :5173 or preview → proxy → :3000)
 * - Vercel hosts → Render API (DEFAULT_RENDER_ORIGIN)
 */
function hostBasedRemoteFallback() {
  if (import.meta.env.DEV) return "";

  if (isLocalFrontendHost()) return "";

  if (isVercelFrontendHost()) return DEFAULT_RENDER_ORIGIN;

  if (typeof __APP_VERCEL_BUILD__ !== "undefined" && __APP_VERCEL_BUILD__) {
    return DEFAULT_RENDER_ORIGIN;
  }

  return "";
}

function remoteApiBase() {
  const explicit =
    normalizeOrigin(import.meta.env.VITE_API_URL) ||
    normalizeOrigin(import.meta.env.VITE_REMOTE_API_URL) ||
    metaApiOrigin();

  if (explicit) return explicit;

  return hostBasedRemoteFallback();
}

let warnedProdWithoutApi = false;

function warnProductionWithoutApi(remote) {
  if (import.meta.env.DEV || remote || warnedProdWithoutApi) return;
  warnedProdWithoutApi = true;
  console.warn(
    "[finance-tracker] No API URL resolved. Set VITE_API_URL or VITE_RENDER_URL, or serve from localhost / Vercel."
  );
}

/**
 * Dev: always proxy unless env forces remote (see apiBaseAttempts).
 * Prod: inferred Render URL on Vercel; localhost uses proxy.
 */
export const API_BASE =
  import.meta.env.DEV ? "" : remoteApiBase() || "";

export function apiUrl(path, baseOverride = API_BASE) {
  const p = path.startsWith("/") ? path : `/${path}`;
  const base = String(baseOverride ?? "").replace(/\/$/, "");
  return `${base}${p}`;
}

function apiBaseAttempts() {
  const remote = remoteApiBase();

  if (!import.meta.env.DEV) {
    warnProductionWithoutApi(remote);
    return remote ? [remote] : [""];
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
  "Use npm run dev (proxies /api → port 3000). On Vercel the app calls Render unless VITE_API_URL overrides.";

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
