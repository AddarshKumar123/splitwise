import express from 'express';
import { authenticate } from '../middleware/auth.middleware.js';
import {
    createGroupController,
    getGroupsController,
    getGroupByIdController,
    getGroupExpensesController,
    renameGroupController,
    addMemberController,
    removeMemberController,
    leaveGroupController,
    deleteGroupController
} from '../controllers/group.controller.js';

const router = express.Router();

// All routes protected with auth middleware
router.use(authenticate);

router.post('/', createGroupController);
router.get('/', getGroupsController);
router.get('/:id/expenses', getGroupExpensesController);
router.get('/:id', getGroupByIdController);
router.patch('/:id', renameGroupController);
router.delete('/:id', deleteGroupController);
router.post('/:id/members', addMemberController);
router.delete('/:id/members/:userId', removeMemberController);
router.post('/:id/leave', leaveGroupController);

export default router;
