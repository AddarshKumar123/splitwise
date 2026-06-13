import { z } from 'zod';

export const createExpenseSchema = z.object({
    groupId: z.number().int().positive(),
    description: z.string().min(1),
    amount: z.number().positive(),
    date: z.string().or(z.date()),
    notes: z.string().optional(),
    payerId: z.number().int().positive(),
    splitType: z.enum(['EQUAL', 'EXACT', 'PERCENTAGE', 'SHARES']),
    participants: z.array(z.object({
        userId: z.number().int().positive(),
        amount: z.number().positive().optional(),
        percentage: z.number().min(0).max(100).optional(),
        shares: z.number().int().positive().optional()
    })).min(1)
});

export const updateExpenseSchema = z.object({
    description: z.string().min(1).optional(),
    amount: z.number().positive().optional(),
    date: z.string().or(z.date()).optional(),
    notes: z.string().optional(),
    payerId: z.number().int().positive().optional(),
    splitType: z.enum(['EQUAL', 'EXACT', 'PERCENTAGE', 'SHARES']).optional(),
    participants: z.array(z.object({
        userId: z.number().int().positive(),
        amount: z.number().positive().optional(),
        percentage: z.number().min(0).max(100).optional(),
        shares: z.number().int().positive().optional()
    })).optional()
});
