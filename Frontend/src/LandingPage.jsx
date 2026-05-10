import "./LandingPage.css";

function LandingPage({ setPage }) {

  return (
    <div className="landing-container">

      <div className="glass-card">

        {/* LOGO */}
        <div className="logo">
          💰
        </div>

        {/* TITLE */}
        <h1 className="app-title">
          Personal Finance Tracker
        </h1>

        <p className="subtitle">
          Track income, expenses and manage your money smartly.
        </p>

        {/* BUTTONS */}
        <div className="btn-group">

          {/* LOGIN BUTTON */}
          <button
            type="button"
            className="login-btn"
            onClick={() => setPage("login")}
          >
            Login
          </button>

          {/* SIGNUP BUTTON */}
          <button
            type="button"
            className="signup-btn"
            onClick={() => setPage("signup")}
          >
            Sign Up
          </button>

        </div>

      </div>

    </div>
  );
}

export default LandingPage;