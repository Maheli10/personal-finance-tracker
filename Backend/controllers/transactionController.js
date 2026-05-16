import Transaction from '../models/transaction.js';

function normalizeTxUsername(value) {
    return typeof value === "string" ? value.trim().toLowerCase() : "";
}

export const createTransaction = async (req, res) => {
    try {
        const username = normalizeTxUsername(req.body.username);
        if (!username) {
            return res.status(400).json({ message: "username is required" });
        }
        const payload = {
            ...req.body,
            username,
            category: req.body.category?.trim() || "general",
        };
        const newTransaction = new Transaction(payload);
        await newTransaction.save();
        res.status(201).json(newTransaction);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};  
export const getTransactions = async (req, res) => {
    try {
        const username = normalizeTxUsername(decodeURIComponent(req.params.username));
        const transactions = await Transaction.find({ username }).sort({ date: -1 });
        res.status(200).json(transactions);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }       
};
export const updateTransaction = async (req, res) => {
    try {
        const body = { ...req.body };
        if (body.username != null) {
            body.username = normalizeTxUsername(body.username);
        }
        const updatedTransaction = await Transaction.findByIdAndUpdate(req.params.id, body, { new: true });
        res.status(200).json(updatedTransaction);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }       
};
export const deleteTransaction = async (req, res) => {
    try {
        await Transaction.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: "Transaction deleted" });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }       
};  
