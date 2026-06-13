import { createComment, getExpenseComments } from '../services/comment.service.js';

export const createCommentController = async (req, res) => {
    try {
        const expenseId = parseInt(req.params.expenseId);
        const { message } = req.body;
        
        const comment = await createComment(expenseId, message, req.user.userId);
        
        res.status(201).json({
            success: true,
            data: comment
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

export const getExpenseCommentsController = async (req, res) => {
    try {
        const expenseId = parseInt(req.params.expenseId);
        
        const comments = await getExpenseComments(expenseId, req.user.userId);
        
        res.status(200).json({
            success: true,
            data: comments
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};
