import express from 'express';
import { getReport } from '../controllers/reportController.js';

const router = express.Router();

router.get('/user/:username', getReport);

export default router;
