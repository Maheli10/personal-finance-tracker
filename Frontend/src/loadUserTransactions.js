import { apiFetch, API_SETUP_HINT } from "./api.js";

/**
 * Loads transactions for a user; no React setState — safe to call from effects via .then().
 */
export async function loadUserTransactions(username, options = {}) {
  const { signal } = options;

  await Promise.resolve();
  if (signal?.aborted) return { aborted: true };

  try {
    const q = encodeURIComponent(username);
    const res = await apiFetch(`/api/transactions/user/${q}`);
    if (signal?.aborted) return { aborted: true };

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      console.error(err);
      return {
        ok: false,
        transactions: [],
        errorMessage:
          err.message || `Could not load transactions (${res.status}).`,
      };
    }

    const data = await res.json();
    if (signal?.aborted) return { aborted: true };

    return {
      ok: true,
      transactions: Array.isArray(data) ? data : [],
      errorMessage: "",
    };
  } catch (err) {
    console.error(err);
    const msg = String(err.message ?? "");
    return {
      ok: false,
      transactions: [],
      errorMessage:
        err.name === "AbortError"
          ? `Request timed out. ${API_SETUP_HINT}`
          : msg.includes("VITE_API_URL")
            ? msg
            : `Could not reach the API. ${API_SETUP_HINT}`,
    };
  }
}
