import { createExpense, getExpenseById, updateExpense, deleteExpense } from '../services/expense.service.js';

export const createExpenseController = async (req, res) => {
    try {
        const expense = await createExpense(req.body, req.user.userId);
        
        res.status(201).json({
            success: true,
            data: expense
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

export const getExpenseByIdController = async (req, res) => {
    try {
        const expense = await getExpenseById(parseInt(req.params.id), req.user.userId);
        
        res.status(200).json({
            success: true,
            data: expense
        });
    } catch (error) {
        res.status(404).json({
            success: false,
            message: error.message
        });
    }
};

export const updateExpenseController = async (req, res) => {
    try {
        const expense = await updateExpense(parseInt(req.params.id), req.body, req.user.userId);
        
        res.status(200).json({
            success: true,
            data: expense
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

export const deleteExpenseController = async (req, res) => {
    try {
        const result = await deleteExpense(parseInt(req.params.id), req.user.userId);
        
        res.status(200).json({
            success: true,
            data: result
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};
