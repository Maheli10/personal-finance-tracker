import express from 'express';

import {
  createTransaction,
  getTransactions,
  updateTransaction,
  deleteTransaction,
} from '../controllers/transactionController.js';

const routers = express.Router();

routers.post('/', createTransaction);
routers.get('/user/:username', getTransactions);
routers.put('/:id', updateTransaction);
routers.delete('/:id', deleteTransaction);

export default routers;
