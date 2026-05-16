import { useState } from "react";
import "./Aauth.css";
import { apiFetch, API_SETUP_HINT } from "./api.js";

function Signup({ setPage, setUsername }) {

  const [usernameInput, setUsernameInput] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");
    const trimmedUsername = usernameInput.trim();
    const trimmedEmail = email.trim();
    if (trimmedUsername === "" || trimmedEmail === "") {
      setError("Username and email are required.");
      return;
    }

    setLoading(true);
    try {
      const res = await apiFetch("/api/users/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: trimmedUsername, email: trimmedEmail }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.message || "Sign up failed.");
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

      <form className="auth-card" onSubmit={handleSignup}>

        <h2>Sign Up</h2>

        <input
          type="text"
          placeholder="Username (unique)"
          autoComplete="username"
          value={usernameInput}
          onChange={(e) => setUsernameInput(e.target.value)}
        />

        <input
          type="email"
          placeholder="Email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        {error && <p className="auth-error">{error}</p>}

        <button type="submit" disabled={loading}>
          {loading ? "Creating account…" : "Sign Up"}
        </button>

      </form>

    </div>
  );
}

export default Signup;
