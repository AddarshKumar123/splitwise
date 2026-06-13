import prisma from '../config/prisma.js';
import bcrypt from 'bcrypt';
import generateToken from '../utils/generateToken.js';

export const registerUser = async (name, email, password) => {
    // 1. check existing user
    const existingUser = await prisma.user.findUnique({
        where: { email }
    });

    if (existingUser) {
        throw new Error('Email already exists');
    }

    // 2. hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 3. create user
    const user = await prisma.user.create({
        data: {
            name,
            email,
            passwordHash: hashedPassword
        }
    });

    // 4. generate token
    const token = generateToken(user.id);

    // 5. return response
    return {
        token,
        user: {
            id: user.id,
            name: user.name,
            email: user.email,
            createdAt: user.createdAt
        }
    };
};

export const loginUser = async (email, password) => {
    // 1. find user
    const user = await prisma.user.findUnique({
        where: { email }
    });

    if (!user) {
        throw new Error('Invalid credentials');
    }

    // 2. verify password
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
        throw new Error('Invalid credentials');
    }

    // 3. generate token
    const token = generateToken(user.id);

    // 4. return response
    return {
        token,
        user: {
            id: user.id,
            name: user.name,
            email: user.email,
            createdAt: user.createdAt
        }
    };
};

export const getCurrentUser = async (userId) => {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
            id: true,
            name: true,
            email: true,
            createdAt: true,
            updatedAt: true
        }
    });

    if (!user) {
        throw new Error('User not found');
    }

    return user;
};

export const updateProfile = async (userId, name, password) => {
    const updateData = {};
    
    if (name) {
        updateData.name = name;
    }
    
    if (password) {
        updateData.passwordHash = await bcrypt.hash(password, 10);
    }

    const user = await prisma.user.update({
        where: { id: userId },
        data: updateData,
        select: {
            id: true,
            name: true,
            email: true,
            createdAt: true,
            updatedAt: true
        }
    });

    return user;
};
