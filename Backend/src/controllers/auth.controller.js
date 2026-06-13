import { registerUser, loginUser, getCurrentUser, updateProfile as updateProfileService } from '../services/auth.service.js';

export const register = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        
        const result = await registerUser(name, email, password);
        
        res.status(201).json({
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

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        
        const result = await loginUser(email, password);
        
        res.status(200).json({
            success: true,
            data: result
        });
    } catch (error) {
        res.status(401).json({
            success: false,
            message: error.message
        });
    }
};

export const getMe = async (req, res) => {
    try {
        const user = await getCurrentUser(req.user.userId);
        
        res.status(200).json({
            success: true,
            data: user
        });
    } catch (error) {
        res.status(404).json({
            success: false,
            message: error.message
        });
    }
};

export const updateProfile = async (req, res) => {
    try {
        const { name, password } = req.body;
        
        const user = await updateProfileService(req.user.userId, name, password);
        
        res.status(200).json({
            success: true,
            data: user
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};
