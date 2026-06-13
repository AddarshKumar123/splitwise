import { createSettlement, deleteSettlement } from '../services/settlement.service.js';

export const recordSettlement = async (req, res) => {
    try {
        const settlement = await createSettlement(req.body, req.user.userId);
        
        res.status(201).json({
            success: true,
            data: settlement
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

export const deleteSettlementController = async (req, res) => {
    try {
        const result = await deleteSettlement(parseInt(req.params.id), req.user.userId);
        
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
