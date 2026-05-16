function normalizeOrigin(url) {
  return String(url ?? "").trim().replace(/\/$/, "");
}

const DEFAULT_RENDER_ORIGIN = normalizeOrigin(
  import.meta.env.VITE_RENDER_URL ??
    "https://personal-finance-tracker-kblh.onrender.com"
);

function metaApiOrigin() {
  if (typeof document === "undefined") return "";
  const el = document.querySelector('meta[name="api-origin"]');
  const raw = el?.getAttribute("content")?.trim();
  return raw ? normalizeOrigin(raw) : "";
}

function isLocalFrontendHost() {
  if (typeof window === "undefined") return import.meta.env.DEV;
  const h = window.location.hostname;
  return h === "localhost" || h === "127.0.0.1";
}

function isVercelFrontendHost() {
  if (typeof window === "undefined") return false;
  const h = window.location.hostname;
  return h.endsWith(".vercel.app") || h.endsWith(".vercel.dev");
}

function hostBasedRemoteFallback() {
  if (import.meta.env.DEV) return "";
  if (isLocalFrontendHost()) return "";
  if (isVercelFrontendHost()) return DEFAULT_RENDER_ORIGIN;
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

function apiBaseAttempts() {
  const remote = remoteApiBase();

  if (!import.meta.env.DEV) {
    return remote ? [remote] : [""];
  }

  if (!remote) return [""];

  const preferLocal = import.meta.env.VITE_API_PREFER_LOCAL !== "false";
  return preferLocal ? ["", remote] : [remote, ""];
}

function shouldRetryWithHosted(devFirstAttempt, response) {
  if (!import.meta.env.DEV || !devFirstAttempt || !response) return false;
  return response.status === 502 || response.status === 503 || response.status === 504;
}

export async function apiFetch(path, options = {}) {
  const p = path.startsWith("/") ? path : `/${path}`;
  const bases = apiBaseAttempts();

  let lastError;

  for (let i = 0; i < bases.length; i++) {
    const base = String(bases[i]).replace(/\/$/, "");
    const url = `${base}${p}`;

    try {
      const res = await fetch(url, options);

      if (shouldRetryWithHosted(i === 0 && base === "", res)) {
        lastError = new Error(`Local API unavailable (${res.status})`);
        continue;
      }

      return res;
    } catch (err) {
      lastError = err;
      continue;
    }
  }

  throw lastError || new Error("API unreachable");
}

export function apiUrl(path, baseOverride = "") {
  const base = baseOverride || remoteApiBase();
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${base}${p}`;
}

export const API_SETUP_HINT =
  "Use npm run dev (proxy /api → backend). On Vercel, API calls go to Render unless overridden.";