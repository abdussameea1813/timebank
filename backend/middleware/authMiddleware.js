import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';

export const protect = async (req, res, next) => {
    let token = req.headers.authorization;

    console.log(req.headers); // Debugging line

    if (!token || !token.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Not authorized, no token' });
    }

    try {
        token = token.split(' ')[1]; // Extract token from "Bearer <token>"
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = await User.findById(decoded.id).select('-password');
        next();
    } catch (error) {
        console.error(error); // Log error for debugging
        res.status(401).json({ message: 'Token is not valid' });
    }
};
