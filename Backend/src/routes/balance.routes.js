import express from 'express';
import { authenticate } from '../middleware/auth.middleware.js';
import {
    getGroupBalances,
    getDashboard
} from '../controllers/balance.controller.js';

const router = express.Router();

// All routes protected with auth middleware
router.use(authenticate);

router.get('/dashboard', getDashboard);
router.get('/groups/:groupId/balances', getGroupBalances);

export default router;
