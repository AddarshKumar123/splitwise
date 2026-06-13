import { z } from 'zod';

export const createGroupSchema = z.object({
    name: z.string().min(1),
    description: z.string().optional()
});

export const renameGroupSchema = z.object({
    name: z.string().min(1)
});

export const addMemberSchema = z.object({
    email: z.email()
});
