import "./App.css";
import Report from "./Report.jsx";
import { useEffect, useState } from "react";

function App() {

  const [transactions, setTransactions] = useState([]);

  const [showReport, setShowReport] = useState(false);

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

  return (

    <div className="container">

      {!showReport ? (

        <>
          {/* MAIN PAGE */}

          <h1 className="title">
            Personal Finance Tracker
          </h1>

          <div className="main">

            {/* LEFT SIDE */}

            <div className="form-section">

              <form>

                {/* USER */}

                <div className="form-group">

                  <label>User Name</label>

                  <input
                    type="text"
                    placeholder="Enter user name"
                  />

                </div>

                {/* EMAIL */}

                <div className="form-group">

                  <label>Email</label>

                  <input
                    type="email"
                    placeholder="Enter email"
                  />

                </div>

                {/* TITLE */}

                <div className="form-group">

                  <label>Transaction Title</label>

                  <input
                    type="text"
                    placeholder="Ex: Salary, Food, Taxi"
                  />

                </div>

                {/* AMOUNT */}

                <div className="form-group">

                  <label>Amount</label>

                  <input
                    type="number"
                    placeholder="Enter amount"
                  />

                </div>

                {/* TYPE */}

                <div className="form-group">

                  <label>Type</label>

                  <select>

                    <option>income</option>

                    <option>expense</option>

                  </select>

                </div>

                {/* BUTTONS */}

                <div className="button-group">

                  <button className="btn">
                    Add Transaction
                  </button>

                  <button className="btn update-btn">
                    Update Transaction
                  </button>

                  <button className="btn delete-btn">
                    Delete Transaction
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

            {/* RIGHT SIDE */}

            <div className="transactions">

              <h2>Recent Transactions</h2>

              {transactions.map((t) => (

                <div
                  className="transaction"
                  key={t._id}
                >

                  <div className="transaction-info">

                    <h3>{t.title}</h3>

                    <p>{t.type}</p>

                  </div>

                  <p
                    className={
                      t.type === "income"
                        ? "transaction-income"
                        : "transaction-expense"
                    }
                  >

                    {t.type === "income" ? "+" : "-"}
                    Rs. {t.amount}

                  </p>

                </div>

              ))}

            </div>

          </div>

        </>

      ) 
        : (

          <Report
            income={income}
            expense={expense}
            balance={balance}
            setShowReport={setShowReport}
          />

        )}

    </div>

  );  
}

export default App;