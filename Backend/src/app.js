import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import authRoutes from './routes/auth.route.js';
import groupRoutes from './routes/group.routes.js';
import expenseRoutes from './routes/expense.routes.js';
import balanceRoutes from './routes/balance.routes.js';
import settlementRoutes from './routes/settlement.routes.js';
import commentRoutes from './routes/comment.routes.js';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/groups', groupRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api', balanceRoutes);
app.use('/api/settlements', settlementRoutes);
app.use('/api', commentRoutes);

export default app;
