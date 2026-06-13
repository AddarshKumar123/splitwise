import { z } from 'zod';

export const createSettlementSchema = z.object({
    groupId: z.number().int().positive(),
    payerId: z.number().int().positive(),
    receiverId: z.number().int().positive(),
    amount: z.number().positive(),
    date: z.string().or(z.date()),
    notes: z.string().optional()
}).refine(data => data.payerId !== data.receiverId, {
    message: "Payer and receiver cannot be the same",
    path: ["payerId"]
}).refine(data => {
    const settlementDate = new Date(data.date);
    const now = new Date();
    return settlementDate <= now;
}, {
    message: "Future dates are not allowed",
    path: ["date"]
});
