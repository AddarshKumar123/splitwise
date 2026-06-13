import express from 'express';
import { authenticate } from '../middleware/auth.middleware.js';
import {
    recordSettlement,
    deleteSettlementController
} from '../controllers/settlement.controller.js';

const router = express.Router();

// All routes protected with auth middleware
router.use(authenticate);

router.post('/', recordSettlement);
router.delete('/:id', deleteSettlementController);

export default router;
