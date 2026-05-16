import Transaction from "../models/transaction.js";

export const getReport = async (req, res) => {
  try {
    const username = decodeURIComponent(req.params.username).trim().toLowerCase();
    const transactions = await Transaction.find({ username });

    let income = 0;
    let expense = 0;

    transactions.forEach((t) => { //loop and calculate total income and expense
      if (t.type === "income") {
        income += t.amount;
      } else {
        expense += t.amount;
      }
    });

    const balance = income - expense;

const response = {
  totalIncome: income,
  totalExpense: expense
};

if (balance > 0) {
  response.balance = balance;
}
else{
    response.balance = 0;
}

res.status(200).json(response);
     
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};