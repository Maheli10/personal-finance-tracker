import express from 'express';

import{ createTransaction, getTransactions, updateTransaction, deleteTransaction } from '../controllers/transactionController.js';
import { get } from 'mongoose';

const routers = express.Router();

routers.post('/', createTransaction);
routers.get('/:userId', getTransactions);
routers.put('/:id', updateTransaction);
routers.delete('/:id', deleteTransaction);

export default routers;
