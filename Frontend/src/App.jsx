import { useEffect, useState } from "react";

function App() {
  const [transactions, setTransactions] = useState([]);

  const fetchTransactions = async () => {
    const res = await fetch(
      "https://personal-finance-tracker-kblh.onrender.com/api/transactions"
    );

    const data = await res.json();

    setTransactions(data);
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  return (
    <div>
      <h1>Personal Finance Tracker</h1>

      {transactions.map((t) => (
        <div key={t._id}>
          <h3>{t.title}</h3>
          <p>{t.amount}</p>
          <p>{t.type}</p>
        </div>
      ))}
    </div>
  );
}

export default App;