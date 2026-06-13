import prisma from '../config/prisma.js';

export const calculateGroupBalances = async (groupId) => {
    // Fetch all expenses for the group with participants
    const expenses = await prisma.expense.findMany({
        where: { groupId },
        include: {
            participants: true
        }
    });

    // Initialize balance map
    const balances = new Map();

    // Calculate raw balances
    expenses.forEach(expense => {
        // Payer gets +amount
        const payerBalance = balances.get(expense.payerId) || 0;
        balances.set(expense.payerId, payerBalance + Number(expense.amount));

        // Each participant owes their share
        expense.participants.forEach(participant => {
            const participantBalance = balances.get(participant.userId) || 0;
            balances.set(participant.userId, participantBalance - Number(participant.amount));
        });
    });

    // Convert map to array with user details
    const userIds = Array.from(balances.keys());
    const users = await prisma.user.findMany({
        where: { id: { in: userIds } },
        select: {
            id: true,
            name: true,
            email: true
        }
    });

    const userMap = new Map(users.map(u => [u.id, u]));

    const balanceArray = Array.from(balances.entries()).map(([userId, balance]) => ({
        user: userMap.get(userId),
        balance
    }));

    return balanceArray;
};

export const simplifyDebts = (balances) => {
    // Separate creditors (positive balance) and debtors (negative balance)
    const creditors = balances
        .filter(b => b.balance > 0)
        .map(b => ({ ...b, balance: Number(b.balance) }))
        .sort((a, b) => b.balance - a.balance);

    const debtors = balances
        .filter(b => b.balance < 0)
        .map(b => ({ ...b, balance: -Number(b.balance) }))
        .sort((a, b) => b.balance - a.balance);

    const transactions = [];
    let i = 0; // creditor index
    let j = 0; // debtor index

    // Greedy settlement algorithm
    while (i < creditors.length && j < debtors.length) {
        const creditor = creditors[i];
        const debtor = debtors[j];

        const amount = Math.min(creditor.balance, debtor.balance);

        if (amount > 0.01) { // Only add transaction if amount is significant
            transactions.push({
                from: debtor.user,
                to: creditor.user,
                amount: Math.round(amount * 100) / 100 // Round to 2 decimal places
            });
        }

        creditor.balance -= amount;
        debtor.balance -= amount;

        if (creditor.balance < 0.01) {
            i++;
        }
        if (debtor.balance < 0.01) {
            j++;
        }
    }

    return transactions;
};

export const calculateDashboardBalances = async (userId) => {
    // Fetch all groups the user is a member of
    const userGroups = await prisma.groupMember.findMany({
        where: { userId },
        select: { groupId: true }
    });

    const groupIds = userGroups.map(g => g.groupId);

    // Fetch all expenses from these groups
    const expenses = await prisma.expense.findMany({
        where: { groupId: { in: groupIds } },
        include: {
            participants: true
        }
    });

    let youOwe = 0;
    let youAreOwed = 0;

    expenses.forEach(expense => {
        // If user paid, they are owed the full amount
        if (expense.payerId === userId) {
            youAreOwed += Number(expense.amount);
        }

        // User owes their share in each expense
        const userParticipant = expense.participants.find(p => p.userId === userId);
        if (userParticipant) {
            youOwe += Number(userParticipant.amount);
        }
    });

    const netBalance = youAreOwed - youOwe;

    return {
        youOwe: Math.round(youOwe * 100) / 100,
        youAreOwed: Math.round(youAreOwed * 100) / 100,
        netBalance: Math.round(netBalance * 100) / 100
    };
};
