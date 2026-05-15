import "./App.css";
import Report from "./Report.jsx";
import LandingPage from "./LandingPage";
import Login from "./Login";
import Signup from "./Signup";
import { useEffect, useState } from "react";

function App() {

  const [transactions, setTransactions] = useState([]);
  const [showReport, setShowReport] = useState(false);
  const [page, setPage] = useState("landing");

  // FETCH TRANSACTIONS
  const fetchTransactions = async () => {
    try {
      const res = await fetch(
        "https://personal-finance-tracker-kblh.onrender.com/api/transactions"
      );

      const data = await res.json();
      setTransactions(data);

    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  // REPORT CALCULATIONS
  let income = 0;
  let expense = 0;

  transactions.forEach((t) => {
    if (t.type === "income") {
      income += t.amount;
    } else {
      expense += t.amount;
    }
  });

  const balance = income - expense;

  // MAIN ROUTING
  return (
    <>
      {page === "landing" && (
        <LandingPage setPage={setPage} />
      )}

      {page === "login" && (
        <Login setPage={setPage} />
      )}

      {page === "signup" && (
        <Signup setPage={setPage} />
      )}

      {page === "app" && (
        <div className="container">

          {!showReport ? (
            <>
              <h1 className="title">Personal Finance Tracker</h1>

              <div className="main">

                {/* LEFT SIDE */}
                <div className="form-section">

                  {/* PREVENT PAGE REFRESH */}
                  <form onSubmit={(e) => e.preventDefault()}>

                    <div className="form-group">
                      <label>Transaction Title</label>
                      <input type="text" />
                    </div>

                    <div className="form-group">
                      <label>Amount</label>
                      <input type="number" />
                    </div>

                    <div className="form-group">
                      <label>Type</label>

                      <select>
                        <option>income</option>
                        <option>expense</option>
                      </select>
                    </div>

                    <div className="button-group">

                      {/* ADD BUTTON */}
                      <button
                        type="button"
                        className="btn"
                        onClick={() =>
                          alert("Transaction Added Successfully")
                        }
                      >
                        Add
                      </button>

                      {/* UPDATE BUTTON */}
                      <button
                        type="button"
                        className="btn update-btn"
                        onClick={() =>
                          alert("Transaction Updated Successfully")
                        }
                      >
                        Update
                      </button>

                      {/* DELETE BUTTON */}
                      <button
                        type="button"
                        className="btn delete-btn"
                        onClick={() =>
                          alert("Transaction Deleted Successfully")
                        }
                      >
                        Delete
                      </button>

                      {/* REPORT BUTTON */}
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

                {/* RIGHT SIDE */}
                <div className="transactions">

                  <h2>Recent Transactions</h2>

                  {transactions.map((t) => (
                    <div className="transaction" key={t._id}>

                      <h3>{t.title}</h3>

                      <p>{t.type}</p>

                      <p>
                        {t.type === "income" ? "+" : "-"} Rs. {t.amount}
                      </p>

                    </div>
                  ))}

                </div>

              </div>
            </>
          ) : (
            <Report
              income={income}
              expense={expense}
              balance={balance}
              setShowReport={setShowReport}
            />
          )}

        </div>
      )}
    </>
  );
}

export default App;