/**
 * API base resolution (no bundled default host):
 * 1) VITE_API_URL or VITE_REMOTE_API_URL (build-time; set in Vercel → Environment Variables)
 * 2) <meta name="api-origin" content="https://your-api.example.com"> in index.html (runtime)
 *
 * Local dev (localhost:5173): leave both unset → same-origin `/api` → Vite proxy → :3000.
 * Vercel: you must set (1) or (2); same-origin `/api` is not proxied unless you add rewrites.
 */
function metaApiOrigin() {
  if (typeof document === "undefined") return "";
  const el = document.querySelector('meta[name="api-origin"]');
  const raw = el?.getAttribute("content")?.trim();
  if (!raw) return "";
  return raw.replace(/\/$/, "");
}

function remoteApiBase() {
  const fromEnv = String(
    import.meta.env.VITE_API_URL ?? import.meta.env.VITE_REMOTE_API_URL ?? ""
  )
    .trim()
    .replace(/\/$/, "");
  const fromMeta = metaApiOrigin();
  return fromEnv || fromMeta;
}

let warnedProdWithoutApi = false;

function warnProductionWithoutApi(remote) {
  if (import.meta.env.DEV || remote || warnedProdWithoutApi) return;
  warnedProdWithoutApi = true;
  console.warn(
    "[finance-tracker] Deployed build has no API origin. Add VITE_API_URL in Vercel (Project → Settings → Environment Variables) and redeploy, " +
      "or set <meta name=\"api-origin\" content=\"https://your-api-host\"> in index.html."
  );
}

/**
 * Client default: dev uses "" (proxy). Prod uses remote env/meta if set, else "" (same-origin).
 */
export const API_BASE =
  import.meta.env.DEV ? "" : remoteApiBase() || "";

export function apiUrl(path, baseOverride = API_BASE) {
  const p = path.startsWith("/") ? path : `/${path}`;
  const base = String(baseOverride ?? "").replace(/\/$/, "");
  return `${base}${p}`;
}

/**
 * Dev: `/api` via Vite proxy when no env; if VITE_API_URL set, prefer local proxy or remote via VITE_API_PREFER_LOCAL.
 * Prod: only the resolved remote origin (env or meta); never same-origin `/api` unless you intentionally leave it unset.
 */
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
  "On Vercel: set VITE_API_URL to your API (e.g. https://your-app.onrender.com), redeploy. Locally: npm run dev with backend on port 3000.";

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
