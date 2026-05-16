import { useState } from "react";
import "./Aauth.css";
import { apiFetch, API_SETUP_HINT } from "./api.js";

function Login({ setPage, setUsername }) {

  const [usernameInput, setUsernameInput] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    const trimmed = usernameInput.trim();
    if (trimmed === "") {
      setError("Enter a username.");
      return;
    }

    setLoading(true);
    try {
      const res = await apiFetch("/api/users/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: trimmed }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.message || "Login failed.");
        return;
      }
      setUsername(data.username);
      setPage("app");
    } catch (err) {
      const msg = String(err.message ?? "");
      if (err.name === "AbortError") {
        setError(`Request timed out. ${API_SETUP_HINT}`);
      } else if (msg.includes("VITE_API_URL")) {
        setError(msg);
      } else {
        setError(`Cannot reach server. ${API_SETUP_HINT}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">

      <form className="auth-card" onSubmit={handleLogin}>

        <h2>Login</h2>

        <input
          type="text"
          placeholder="Username"
          autoComplete="username"
          value={usernameInput}
          onChange={(e) => setUsernameInput(e.target.value)}
        />

        {error && <p className="auth-error">{error}</p>}

        <button type="submit" disabled={loading}>
          {loading ? "Signing in…" : "Login"}
        </button>

      </form>

    </div>
  );
}

export default Login;
