import "./App.css";
import Report from "./Report.jsx";
import LandingPage from "./LandingPage";
import Login from "./Login";
import Signup from "./Signup";
import { useCallback, useEffect, useState } from "react";
import { apiFetch } from "./api.js";
import { loadUserTransactions } from "./loadUserTransactions.js";

function App() {

  const [transactions, setTransactions] = useState([]);
  const [showReport, setShowReport] = useState(false);
  const [page, setPage] = useState("landing");
  const [username, setUsername] = useState("");

  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [type, setType] = useState("income");
  const [selectedId, setSelectedId] = useState(null);
  const [actionError, setActionError] = useState("");
  const [transactionsFetchError, setTransactionsFetchError] = useState("");

  const fetchTransactions = useCallback(async () => {
    if (!username) return;
    const result = await loadUserTransactions(username);
    if (result.aborted) return;
    setTransactions(result.transactions ?? []);
    setTransactionsFetchError(result.ok ? "" : result.errorMessage ?? "");
  }, [username]);

  useEffect(() => {
    if (page !== "app" || !username) return;

    const ac = new AbortController();

    loadUserTransactions(username, { signal: ac.signal }).then((result) => {
      if (result.aborted || ac.signal.aborted) return;
      setTransactions(result.transactions ?? []);
      setTransactionsFetchError(result.ok ? "" : result.errorMessage ?? "");
    });

    return () => ac.abort();
  }, [page, username]);

  let income = 0;
  let expense = 0;

  transactions.forEach((t) => {
    if (t.type === "income") {
      income += Number(t.amount) || 0;
    } else {
      expense += Number(t.amount) || 0;
    }
  });

  const balance = income - expense;

  const resetForm = () => {
    setTitle("");
    setAmount("");
    setType("income");
    setSelectedId(null);
    setActionError("");
  };

  const handleAdd = async () => {
    setActionError("");
    const n = Number(amount);
    if (!title.trim()) {
      setActionError("Enter a transaction title.");
      return;
    }
    if (!Number.isFinite(n) || n <= 0) {
      setActionError("Enter a valid amount.");
      return;
    }
    try {
      const res = await apiFetch(`/api/transactions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username,
          title: title.trim(),
          amount: n,
          type,
          category: "general",
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setActionError(data.message || "Could not add transaction.");
        return;
      }
      resetForm();
      await fetchTransactions();
    } catch {
      setActionError("Cannot reach server.");
    }
  };

  const handleUpdate = async () => {
    setActionError("");
    if (!selectedId) {
      setActionError("Select a transaction to update.");
      return;
    }
    const n = Number(amount);
    if (!title.trim()) {
      setActionError("Enter a transaction title.");
      return;
    }
    if (!Number.isFinite(n) || n <= 0) {
      setActionError("Enter a valid amount.");
      return;
    }
    try {
      const res = await apiFetch(`/api/transactions/${selectedId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username,
          title: title.trim(),
          amount: n,
          type,
          category: "general",
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setActionError(data.message || "Could not update.");
        return;
      }
      resetForm();
      await fetchTransactions();
    } catch {
      setActionError("Cannot reach server.");
    }
  };

  const handleDelete = async () => {
    setActionError("");
    if (!selectedId) {
      setActionError("Select a transaction to delete.");
      return;
    }
    try {
      const res = await apiFetch(`/api/transactions/${selectedId}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setActionError(data.message || "Could not delete.");
        return;
      }
      resetForm();
      await fetchTransactions();
    } catch {
      setActionError("Cannot reach server.");
    }
  };

  const selectTransaction = (t) => {
    setSelectedId(t._id);
    setTitle(t.title ?? "");
    setAmount(String(t.amount ?? ""));
    setType(t.type === "expense" ? "expense" : "income");
    setActionError("");
  };

  const handleLogout = () => {
    setUsername("");
    resetForm();
    setShowReport(false);
    setTransactions([]);
    setPage("landing");
  };

  return (
    <>
      {page === "landing" && (
        <LandingPage setPage={setPage} />
      )}

      {page === "login" && (
        <Login setPage={setPage} setUsername={setUsername} />
      )}

      {page === "signup" && (
        <Signup setPage={setPage} setUsername={setUsername} />
      )}

      {page === "app" && (
        <div className="container container-app">

          {!showReport ? (
            <>
              <div className="app-header-row">
                <h1 className="title">Personal Finance Tracker</h1>
              </div>

              <div className="main">

                <div className="form-section">

                  <form onSubmit={(e) => e.preventDefault()}>

                    {actionError && (
                      <p className="form-error">{actionError}</p>
                    )}

                    <div className="form-group">
                      <label>Transaction Title</label>
                      <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                      />
                    </div>

                    <div className="form-group">
                      <label>Amount</label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                      />
                    </div>

                    <div className="form-group">
                      <label>Type</label>

                      <select
                        value={type}
                        onChange={(e) => setType(e.target.value)}
                      >
                        <option value="income">income</option>
                        <option value="expense">expense</option>
                      </select>
                    </div>

                    <div className="button-group">

                      <button
                        type="button"
                        className="btn"
                        onClick={handleAdd}
                      >
                        Add
                      </button>

                      <button
                        type="button"
                        className="btn update-btn"
                        onClick={handleUpdate}
                      >
                        Update
                      </button>

                      <button
                        type="button"
                        className="btn delete-btn"
                        onClick={handleDelete}
                      >
                        Delete
                      </button>

                      <button
                        type="button"
                        className="btn report-main-btn"
                        onClick={() => setShowReport(true)}
                      >
                        Get Report
                      </button>

                    </div>

                  </form>
                </div>

                <div className="transactions">

                  <h2>Recent Transactions</h2>

                  {transactionsFetchError && (
                    <p className="transactions-fetch-error">{transactionsFetchError}</p>
                  )}

                  {transactions.length === 0 && !transactionsFetchError && (
                    <p className="empty-transactions">No transactions yet.</p>
                  )}

                  {transactions.map((t) => (
                    <div
                      className={`transaction${selectedId === t._id ? " transaction-selected" : ""}`}
                      key={t._id}
                      role="button"
                      tabIndex={0}
                      onClick={() => selectTransaction(t)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          selectTransaction(t);
                        }
                      }}
                    >

                      <h3>{t.title || "(no title)"}</h3>

                      <p>{t.type}</p>

                      <p>
                        {t.type === "income" ? "+" : "-"} Rs. {t.amount}
                      </p>

                    </div>
                  ))}

                </div>

              </div>

              <footer className="app-footer-bar">
                <span className="user-label">
                  Logged in as <strong>{username}</strong>
                </span>
                <button type="button" className="logout-btn-compact" onClick={handleLogout}>
                  Log out
                </button>
              </footer>
            </>
          ) : (
            <>
              <Report
                income={income}
                expense={expense}
                balance={balance}
                setShowReport={setShowReport}
              />
              <footer className="app-footer-bar">
                <span className="user-label">
                  Logged in as <strong>{username}</strong>
                </span>
                <button type="button" className="logout-btn-compact" onClick={handleLogout}>
                  Log out
                </button>
              </footer>
            </>
          )}

        </div>
      )}
    </>
  );
}

export default App;
