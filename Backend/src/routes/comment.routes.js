import express from 'express';
import { authenticate } from '../middleware/auth.middleware.js';
import {
    createCommentController,
    getExpenseCommentsController
} from '../controllers/comment.controller.js';

const router = express.Router();

// All routes protected with auth middleware
router.use(authenticate);

router.post('/expenses/:expenseId/comments', createCommentController);
router.get('/expenses/:expenseId/comments', getExpenseCommentsController);

export default router;
