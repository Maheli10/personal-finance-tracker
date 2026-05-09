import express from 'express';

import{ createUser,getUsers,updateUser,deleteUser,getUserById} from '../controllers/userController.js';
import { get } from 'mongoose';

const router = express.Router();

router.post('/',createUser);
router.get('/',getUsers);
router.get('/:id',getUserById);
router.put('/:id',updateUser);
router.delete('/:id',deleteUser);

export default router;