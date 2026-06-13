import prisma from '../config/prisma.js';

export const createComment = async (expenseId, message, senderId) => {
    // Verify expense exists
    const expense = await prisma.expense.findUnique({
        where: { id: expenseId },
        include: {
            group: true
        }
    });

    if (!expense) {
        throw new Error('Expense not found');
    }

    // Verify sender belongs to the group
    const groupMember = await prisma.groupMember.findUnique({
        where: {
            groupId_userId: {
                groupId: expense.groupId,
                userId: senderId
            }
        }
    });

    if (!groupMember) {
        throw new Error('Access denied');
    }

    // Create comment
    const comment = await prisma.comment.create({
        data: {
            expenseId,
            senderId,
            message
        },
        include: {
            sender: {
                select: {
                    id: true,
                    name: true,
                    email: true
                }
            }
        }
    });

    return comment;
};

export const getExpenseComments = async (expenseId, userId) => {
    // Verify expense exists
    const expense = await prisma.expense.findUnique({
        where: { id: expenseId },
        include: {
            group: true
        }
    });

    if (!expense) {
        throw new Error('Expense not found');
    }

    // Verify user belongs to the group
    const groupMember = await prisma.groupMember.findUnique({
        where: {
            groupId_userId: {
                groupId: expense.groupId,
                userId
            }
        }
    });

    if (!groupMember) {
        throw new Error('Access denied');
    }

    // Get comments, oldest first
    const comments = await prisma.comment.findMany({
        where: { expenseId },
        include: {
            sender: {
                select: {
                    id: true,
                    name: true,
                    email: true
                }
            }
        },
        orderBy: {
            createdAt: 'asc'
        }
    });

    return comments;
};
