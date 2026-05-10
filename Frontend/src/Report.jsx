import "./App.css";

function Report({
  income,
  expense,
  balance,
  setShowReport,
}) {

  return (

    <div className="container">

      <h1 className="title">
        Financial Report
      </h1>

      <div className="summary">

        <div className="card income">

          <h3>Total Income</h3>

          <p>Rs. {income}</p>

        </div>

        <div className="card expense">

          <h3>Total Expense</h3>

          <p>Rs. {expense}</p>

        </div>

        <div className="card balance">

          <h3>Balance</h3>

          <p>Rs. {balance}</p>

        </div>

      </div>

      <button
        className="btn back-btn"
        onClick={() => setShowReport(false)}
      >
        Back
      </button>

    </div>

  );

}

export default Report;