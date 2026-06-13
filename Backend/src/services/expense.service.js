import prisma from '../config/prisma.js';
import {
    calculateEqualSplit,
    calculateExactSplit,
    calculatePercentageSplit,
    calculateSharesSplit
} from './split.service.js';

export const createExpense = async (expenseData, userId) => {
    const {
        groupId,
        description,
        amount,
        date,
        notes,
        payerId,
        splitType,
        participants
    } = expenseData;

    // Validate group exists
    const group = await prisma.group.findUnique({
        where: { id: groupId },
        include: {
            members: true
        }
    });

    if (!group) {
        throw new Error('Group not found');
    }

    // Verify payer is a member of the group
    const payerMember = group.members.find(m => m.userId === payerId);
    if (!payerMember) {
        throw new Error('Payer is not a member of this group');
    }

    // Verify all participants belong to the group
    const participantIds = participants.map(p => p.userId);
    const invalidParticipants = participantIds.filter(
        id => !group.members.some(m => m.userId === id)
    );

    if (invalidParticipants.length > 0) {
        throw new Error('Some participants are not members of this group');
    }

    // Calculate splits based on split type
    let calculatedSplits;
    switch (splitType) {
        case 'EQUAL':
            calculatedSplits = calculateEqualSplit(amount, participantIds);
            break;
        case 'EXACT':
            calculatedSplits = calculateExactSplit(participants);
            break;
        case 'PERCENTAGE':
            calculatedSplits = calculatePercentageSplit(amount, participants);
            break;
        case 'SHARES':
            calculatedSplits = calculateSharesSplit(amount, participants);
            break;
        default:
            throw new Error('Invalid split type');
    }

    // Create expense and participants in a transaction
    const expense = await prisma.$transaction(async (tx) => {
        const newExpense = await tx.expense.create({
            data: {
                description,
                amount,
                date: new Date(date),
                notes,
                groupId,
                payerId,
                createdById: userId 
            }
        });

        const expenseParticipants = await tx.expenseParticipant.createMany({
            data: calculatedSplits.map(split => ({
                expenseId: newExpense.id,
                userId: split.userId,
                splitType,
                amount: split.amount,
                percentage: split.percentage,
                shares: split.shares
            }))
        });

        return newExpense;
    });

    // Return expense with participants
    const result = await prisma.expense.findUnique({
        where: { id: expense.id },
        include: {
            payer: {
                select: {
                    id: true,
                    name: true,
                    email: true
                }
            },
            participants: {
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            email: true
                        }
                    }
                }
            }
        }
    });

    return result;
};

export const getExpenseById = async (expenseId, userId) => {
    const expense = await prisma.expense.findUnique({
        where: { id: expenseId },
        include: {
            payer: {
                select: {
                    id: true,
                    name: true,
                    email: true
                }
            },
            group: {
                select: {
                    id: true,
                    name: true
                }
            },
            createdBy: {
                select: {
                    id: true,
                    name: true,
                    email: true
                }
            },
            participants: {
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            email: true
                        }
                    }
                }
            },
            comments: {
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
            }
        }
    });

    if (!expense) {
        throw new Error('Expense not found');
    }

    // Verify user is a member of the group
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

    return expense;
};

export const updateExpense = async (expenseId, expenseData, userId) => {
    const {
        description,
        amount,
        date,
        notes,
        payerId,
        splitType,
        participants
    } = expenseData;

    // Get existing expense
    const existingExpense = await prisma.expense.findUnique({
        where: { id: expenseId },
        include: {
            group: {
                include: {
                    members: true
                }
            }
        }
    });

    if (!existingExpense) {
        throw new Error('Expense not found');
    }

    // Verify user is the creator
    if (existingExpense.createdById !== userId) {
        throw new Error('Only creator can update expense');
    }

    // If updating participants or split type, recalculate
    if (participants && splitType) {
        // Verify all participants belong to the group
        const participantIds = participants.map(p => p.userId);
        const invalidParticipants = participantIds.filter(
            id => !existingExpense.group.members.some(m => m.userId === id)
        );

        if (invalidParticipants.length > 0) {
            throw new Error('Some participants are not members of this group');
        }

        // Calculate new splits
        const finalAmount = amount || existingExpense.amount;
        let calculatedSplits;
        switch (splitType) {
            case 'EQUAL':
                calculatedSplits = calculateEqualSplit(finalAmount, participantIds);
                break;
            case 'EXACT':
                calculatedSplits = calculateExactSplit(participants);
                break;
            case 'PERCENTAGE':
                calculatedSplits = calculatePercentageSplit(finalAmount, participants);
                break;
            case 'SHARES':
                calculatedSplits = calculateSharesSplit(finalAmount, participants);
                break;
            default:
                throw new Error('Invalid split type');
        }

        // Update in transaction
        const updatedExpense = await prisma.$transaction(async (tx) => {
            // Delete old participants
            await tx.expenseParticipant.deleteMany({
                where: { expenseId }
            });

            // Update expense
            const expense = await tx.expense.update({
                where: { id: expenseId },
                data: {
                    description: description || existingExpense.description,
                    amount: finalAmount,
                    date: date ? new Date(date) : existingExpense.date,
                    notes: notes !== undefined ? notes : existingExpense.notes,
                    payerId: payerId || existingExpense.payerId
                }
            });

            // Create new participants
            await tx.expenseParticipant.createMany({
                data: calculatedSplits.map(split => ({
                    expenseId: expense.id,
                    userId: split.userId,
                    splitType,
                    amount: split.amount,
                    percentage: split.percentage,
                    shares: split.shares
                }))
            });

            return expense;
        });

        // Return updated expense
        const result = await prisma.expense.findUnique({
            where: { id: updatedExpense.id },
            include: {
                payer: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                },
                participants: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                name: true,
                                email: true
                            }
                        }
                    }
                }
            }
        });

        return result;
    } else {
        // Simple update without changing participants
        const updatedExpense = await prisma.expense.update({
            where: { id: expenseId },
            data: {
                description: description || existingExpense.description,
                amount: amount || existingExpense.amount,
                date: date ? new Date(date) : existingExpense.date,
                notes: notes !== undefined ? notes : existingExpense.notes,
                payerId: payerId || existingExpense.payerId
            },
            include: {
                payer: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                },
                participants: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                name: true,
                                email: true
                            }
                        }
                    }
                }
            }
        });

        return updatedExpense;
    }
};

export const deleteExpense = async (expenseId, userId) => {
    const expense = await prisma.expense.findUnique({
        where: { id: expenseId }
    });

    if (!expense) {
        throw new Error('Expense not found');
    }

    // Verify user is the creator
    if (expense.createdById !== userId) {
        throw new Error('Only creator can delete expense');
    }

    // Hard delete - cascade will remove ExpenseParticipants and Comments
    await prisma.expense.delete({
        where: { id: expenseId }
    });

    return { message: 'Expense deleted successfully' };
};
