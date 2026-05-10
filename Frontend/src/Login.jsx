import { useState } from "react";
import "./Aauth.css";

function Login({ setPage }) {

  const [name, setName] = useState("");

  const handleLogin = (e) => {
    e.preventDefault();

    if (name.trim() !== "") {
      setPage("app"); // ✅ go to main app
    }
  };

  return (
    <div className="auth-container">

      <form className="auth-card" onSubmit={handleLogin}>

        <h2>Login</h2>

        <input
          type="text"
          placeholder="Enter Username"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <button type="submit">
          Login
        </button>

      </form>

    </div>
  );
}

export default Login;