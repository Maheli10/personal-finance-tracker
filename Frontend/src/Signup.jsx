import { useState } from "react";
import "./Aauth.css";

function Signup({ setPage }) {

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const handleSignup = (e) => {
    e.preventDefault();

    if (name.trim() !== "" && email.trim() !== "") {
      setPage("app"); // ✅ go to main app
    }
  };

  return (
    <div className="auth-container">

      <form className="auth-card" onSubmit={handleSignup}>

        <h2>Sign Up</h2>

        <input
          type="text"
          placeholder="Enter Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <input
          type="email"
          placeholder="Enter Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <button type="submit">
          Sign Up
        </button>

      </form>

    </div>
  );
}

export default Signup;