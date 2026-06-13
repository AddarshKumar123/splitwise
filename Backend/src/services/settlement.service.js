import prisma from '../config/prisma.js';

export const createSettlement = async (settlementData, userId) => {
    const {
        groupId,
        payerId,
        receiverId,
        amount,
        date,
        notes
    } = settlementData;

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

    // Validate amount > 0
    if (amount <= 0) {
        throw new Error('Amount must be greater than 0');
    }

    // Verify both users are members of the group
    const payerMember = group.members.find(m => m.userId === payerId);
    const receiverMember = group.members.find(m => m.userId === receiverId);

    if (!payerMember) {
        throw new Error('Payer is not a member of this group');
    }

    if (!receiverMember) {
        throw new Error('Receiver is not a member of this group');
    }

    // Get user names for description
    const users = await prisma.user.findMany({
        where: { id: { in: [payerId, receiverId] } },
        select: { id: true, name: true }
    });

    const payerName = users.find(u => u.id === payerId)?.name;
    const receiverName = users.find(u => u.id === receiverId)?.name;

    // Create settlement as Expense with type=SETTLEMENT
    const settlement = await prisma.$transaction(async (tx) => {
        const expense = await tx.expense.create({
            data: {
                type: 'SETTLEMENT',
                description: `${payerName} settled with ${receiverName}`,
                amount,
                date: new Date(date),
                notes,
                groupId,
                payerId,
                createdById: userId
            }
        });

        // Create ExpenseParticipants
        // Payer gets 0 (they paid, so they're not owed anything)
        // Receiver gets full amount (they were owed this amount)
        await tx.expenseParticipant.createMany({
            data: [
                {
                    expenseId: expense.id,
                    userId: payerId,
                    splitType: 'EXACT',
                    amount: 0,
                    percentage: null,
                    shares: null
                },
                {
                    expenseId: expense.id,
                    userId: receiverId,
                    splitType: 'EXACT',
                    amount: amount,
                    percentage: null,
                    shares: null
                }
            ]
        });

        return expense;
    });

    // Return settlement with participants
    const result = await prisma.expense.findUnique({
        where: { id: settlement.id },
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

export const deleteSettlement = async (settlementId, userId) => {
    // Find settlement
    const settlement = await prisma.expense.findUnique({
        where: { id: settlementId }
    });

    if (!settlement) {
        throw new Error('Settlement not found');
    }

    // Verify type is SETTLEMENT
    if (settlement.type !== 'SETTLEMENT') {
        throw new Error('This is not a settlement');
    }

    // Verify user is the creator
    if (settlement.createdById !== userId) {
        throw new Error('Only creator can delete settlement');
    }

    // Delete expense - cascade will remove ExpenseParticipants
    await prisma.expense.delete({
        where: { id: settlementId }
    });

    return { message: 'Settlement deleted successfully' };
};
