import jwt from 'jsonwebtoken';

export const authenticate = (req, res, next) => {
    try {
        // 1. Get token from header
        const authHeader = req.headers.authorization;
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                message: 'No token provided'
            });
        }

        const token = authHeader.split(' ')[1];

        // 2. Verify JWT
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // 3. Extract userId
        req.user = { userId: decoded.userId };

        // 4. next()
        next();
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: 'Invalid token'        
        });
    }
};
