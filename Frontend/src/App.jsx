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

  const [loading, setLoading] = useState(false);

  const wakeServer = async () => {
    try {
      await fetch("https://personal-finance-tracker-kblh.onrender.com/ping");
    } catch (err) {
      console.log("Server wake failed");
    }
  };

  const fetchTransactions = useCallback(async () => {
    if (!username) return;

    setLoading(true);

    const result = await loadUserTransactions(username);

    if (result.aborted) {
      setLoading(false);
      return;
    }

    setTransactions(result.transactions ?? []);

    setTransactionsFetchError(
      result.ok
        ? ""
        : result.errorMessage ?? "Server is waking up. Please wait..."
    );

    setLoading(false);
  }, [username]);

  useEffect(() => {
    if (page !== "app" || !username) return;

    wakeServer();

    const ac = new AbortController();

    setLoading(true);

    loadUserTransactions(username, { signal: ac.signal }).then((result) => {
      if (result.aborted || ac.signal.aborted) return;

      setTransactions(result.transactions ?? []);

      setTransactionsFetchError(
        result.ok
          ? ""
          : result.errorMessage ?? "Server is waking up. Please wait..."
      );

      setLoading(false);
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
        headers: {
          "Content-Type": "application/json",
        },
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
      setActionError("Cannot reach server. Backend may be waking up.");
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
        headers: {
          "Content-Type": "application/json",
        },
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
      setActionError("Cannot reach server. Backend may be waking up.");
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
      setActionError("Cannot reach server. Backend may be waking up.");
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
      {page === "landing" && <LandingPage setPage={setPage} />}

      {page === "login" && <Login setPage={setPage} setUsername={setUsername} />}

      {page === "signup" && <Signup setPage={setPage} setUsername={setUsername} />}

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
                    {actionError && <p className="form-error">{actionError}</p>}

                    <div className="form-group">
                      <label>Transaction Title</label>
                      <input value={title} onChange={(e) => setTitle(e.target.value)} />
                    </div>

                    <div className="form-group">
                      <label>Amount</label>
                      <input
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                      />
                    </div>

                    <div className="form-group">
                      <label>Type</label>
                      <select value={type} onChange={(e) => setType(e.target.value)}>
                        <option value="income">income</option>
                        <option value="expense">expense</option>
                      </select>
                    </div>

                    <div className="button-group">
                      <button type="button" className="btn" onClick={handleAdd}>
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

                  {loading && <p>⏳ Waking up server...</p>}

                  {transactionsFetchError && (
                    <p className="transactions-fetch-error">
                      {transactionsFetchError}
                    </p>
                  )}

                  {transactions.length === 0 &&
                    !transactionsFetchError &&
                    !loading && <p>No transactions yet.</p>}

                  {transactions.map((t) => (
                    <div
                      key={t._id}
                      className={
                        selectedId === t._id
                          ? "transaction transaction-selected"
                          : "transaction"
                      }
                      onClick={() => selectTransaction(t)}
                    >
                      <h3>{t.title}</h3>
                      <p>{t.type}</p>
                      <p>
                        {t.type === "income" ? "+" : "-"} Rs. {t.amount}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <footer className="app-footer-bar">
                <span>
                  Logged in as <strong>{username}</strong>
                </span>

                <button onClick={handleLogout}>Log out</button>
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
            </>
          )}
        </div>
      )}
    </>
  );
}

export default App;