import express from 'express';
import { authenticate } from '../middleware/auth.middleware.js';
import {
    createExpenseController,
    getExpenseByIdController,
    updateExpenseController,
    deleteExpenseController
} from '../controllers/expense.controller.js';

const router = express.Router();

// All routes protected with auth middleware
router.use(authenticate);

router.post('/', createExpenseController);
router.get('/:id', getExpenseByIdController);
router.patch('/:id', updateExpenseController);
router.delete('/:id', deleteExpenseController);

export default router;
