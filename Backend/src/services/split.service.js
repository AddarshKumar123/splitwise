export const calculateEqualSplit = (amount, participants) => {
    const splitAmount = amount / participants.length;
    
    return participants.map(userId => ({
        userId,
        amount: splitAmount,
        percentage: null,
        shares: null
    }));
};

export const calculateExactSplit = (participants) => {
    const totalAmount = participants.reduce((sum, p) => sum + p.amount, 0);
    
    return participants.map(p => ({
        userId: p.userId,
        amount: p.amount,
        percentage: null,
        shares: null
    }));
};

export const calculatePercentageSplit = (amount, participants) => {
    const totalPercentage = participants.reduce((sum, p) => sum + p.percentage, 0);
    
    if (Math.abs(totalPercentage - 100) > 0.01) {
        throw new Error('Percentages must sum to 100');
    }
    
    return participants.map(p => ({
        userId: p.userId,
        amount: (amount * p.percentage) / 100,
        percentage: p.percentage,
        shares: null
    }));
};

export const calculateSharesSplit = (amount, participants) => {
    const totalShares = participants.reduce((sum, p) => sum + p.shares, 0);
    
    if (totalShares === 0) {
        throw new Error('Total shares cannot be zero');
    }
    
    const amountPerShare = amount / totalShares;
    
    const splits = participants.map((p, index) => ({
        userId: p.userId,
        amount: amountPerShare * p.shares,
        percentage: null,
        shares: p.shares
    }));
    
    // Remainder goes to last member
    const calculatedTotal = splits.reduce((sum, s) => sum + s.amount, 0);
    const remainder = amount - calculatedTotal;
    
    if (remainder !== 0 && splits.length > 0) {
        splits[splits.length - 1].amount += remainder;
    }
    
    return splits;
};
