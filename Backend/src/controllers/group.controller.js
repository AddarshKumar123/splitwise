import {
    createGroup,
    getUserGroups,
    getGroupById,
    getGroupExpenses,
    renameGroup,
    addMember,
    removeMember,
    leaveGroup,
    deleteGroup
} from '../services/group.service.js';

export const createGroupController = async (req, res) => {
    try {
        const { name, description } = req.body;
        const group = await createGroup(name, description, req.user.userId);
        
        res.status(201).json({
            success: true,
            data: group
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

export const getGroupsController = async (req, res) => {
    try {
        const groups = await getUserGroups(req.user.userId);
        
        res.status(200).json({
            success: true,
            data: groups
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

export const getGroupByIdController = async (req, res) => {
    try {
        const { id } = req.params;
        const group = await getGroupById(parseInt(id), req.user.userId);
        
        res.status(200).json({
            success: true,
            data: group
        });
    } catch (error) {
        res.status(404).json({
            success: false,
            message: error.message
        });
    }
};

export const getGroupExpensesController = async (req, res) => {
    try {
        const { id } = req.params;
        const expenses = await getGroupExpenses(parseInt(id), req.user.userId);

        res.status(200).json({
            success: true,
            data: expenses
        });
    } catch (error) {
        res.status(404).json({
            success: false,
            message: error.message
        });
    }
};

export const renameGroupController = async (req, res) => {
    try {
        const { id } = req.params;
        const { name } = req.body;
        const group = await renameGroup(parseInt(id), name, req.user.userId);
        
        res.status(200).json({
            success: true,
            data: group
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

export const addMemberController = async (req, res) => {
    try {
        const { id } = req.params;
        const { email } = req.body;
        const member = await addMember(parseInt(id), email, req.user.userId);
        
        res.status(200).json({
            success: true,
            data: member
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

export const removeMemberController = async (req, res) => {
    try {
        const { id, userId } = req.params;
        const result = await removeMember(parseInt(id), parseInt(userId), req.user.userId);
        
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

export const leaveGroupController = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await leaveGroup(parseInt(id), req.user.userId);
        
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

export const deleteGroupController = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await deleteGroup(parseInt(id), req.user.userId);
        
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
