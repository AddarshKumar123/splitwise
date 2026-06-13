import { calculateGroupBalances, simplifyDebts, calculateDashboardBalances } from '../services/balance.service.js';

export const getGroupBalances = async (req, res) => {
    try {
        const groupId = parseInt(req.params.groupId);
        
        const balances = await calculateGroupBalances(groupId);
        const simplifiedDebts = simplifyDebts(balances);
        
        res.status(200).json({
            success: true,
            data: {
                balances,
                simplifiedDebts
            }
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

export const getDashboard = async (req, res) => {
    try {
        const dashboardData = await calculateDashboardBalances(req.user.userId);
        
        res.status(200).json({
            success: true,
            data: dashboardData
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};
