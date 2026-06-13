# Splitwise Clone

A full-stack expense sharing application. Users can create groups, add expenses with multiple split types, track balances, settle debts, and chat about expenses in real-time.

## Features

### Authentication
- User registration and login
- JWT-based authentication
- Profile management
- Secure password storage with bcrypt

### Groups
- Create and manage expense groups
- Add/remove group members
- Group ownership transfer when creator leaves
- Group renaming and deletion
- Duplicate member prevention

### Expenses
- Create expenses with multiple split types:
  - **Equal**: Split amount equally among all participants
  - **Exact**: Specify exact amounts for each participant
  - **Percentage**: Split by percentage (must total 100%)
  - **Shares**: Split by shares (proportional allocation)
- Edit and delete expenses
- Expense notes and dates
- Single payer per expense

### Balance Engine
- Real-time balance calculation from transaction history
- Debt simplification using minimum cash flow algorithm
- Positive balance = user should receive money
- Negative balance = user owes money
- No cached balances (computed on each request)

### Settlements
- Record debt settlements
- Partial settlements supported
- Settlements stored as expense transactions
- Automatic balance recalculation
- Settlement history preserved

### Real-time Chat
- Expense-level comments
- Real-time updates via Socket.IO
- Comment history persistence
- Only group members can comment

## Tech Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **ORM**: Prisma
- **Database**: PostgreSQL
- **Authentication**: JWT + bcrypt
- **Real-time**: Socket.IO
- **Validation**: Zod

### Frontend
- **Framework**: React
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Routing**: React Router
- **HTTP Client**: Axios
- **Real-time**: Socket.IO Client
- **State Management**: Context API

### Deployment
- **Frontend**: Vercel
- **Backend**: Render
- **Database**: Railway PostgreSQL

## Project Structure

```
splitwise/
├── Backend/
│   ├── prisma/
│   │   └── schema.prisma          # Database schema
│   ├── src/
│   │   ├── controllers/            # Request handlers
│   │   ├── services/              # Business logic
│   │   ├── routes/                # API routes
│   │   ├── middleware/            # Auth middleware
│   │   ├── utils/                 # Utility functions
│   │   ├── sockets/               # Socket.IO setup
│   │   └── validations/           # Zod schemas
│   └── .env                       # Environment variables
├── Frontend/
│   ├── src/
│   │   ├── pages/                 # React pages
│   │   ├── components/            # Reusable components
│   │   └── context/               # Context providers
│   ├── package.json
│   └── vite.config.js
├── AI_CONTEXT.md                  # Development documentation
├── BUILD_PLAN.md                  # Build plan
└── README.md                      # This file
```

## Setup Instructions

### Prerequisites
- Node.js (v16 or higher)
- PostgreSQL database
- npm or yarn

### Backend Setup

1. Navigate to the backend directory:
```bash
cd Backend
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env` file in the Backend directory:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/splitwise"
JWT_SECRET="your-secret-key"
```

4. Run database migrations:
```bash
npx prisma migrate dev --name init
```

5. Generate Prisma client:
```bash
npx prisma generate
```

6. Start the backend server:
```bash
node src/index.js
```

The backend will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd Frontend
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env` file in the Frontend directory:
```env
VITE_API_URL="http://localhost:5000/api"
VITE_SOCKET_URL="http://localhost:5000"
```

4. Start the development server:
```bash
npm run dev
```

The frontend will run on `http://localhost:5173`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `PATCH /api/auth/profile` - Update user profile

### Groups
- `POST /api/groups` - Create a new group
- `GET /api/groups` - Get user's groups
- `GET /api/groups/:id` - Get group details
- `PATCH /api/groups/:id` - Rename group
- `DELETE /api/groups/:id` - Delete group
- `POST /api/groups/:id/members` - Add member to group
- `DELETE /api/groups/:id/members/:userId` - Remove member from group
- `POST /api/groups/:id/leave` - Leave group

### Expenses
- `POST /api/expenses` - Create expense
- `GET /api/expenses/:id` - Get expense details
- `PATCH /api/expenses/:id` - Update expense
- `DELETE /api/expenses/:id` - Delete expense

### Balances
- `GET /api/groups/:groupId/balances` - Get group balances
- `GET /api/dashboard` - Get user dashboard summary

### Settlements
- `POST /api/settlements` - Create settlement
- `DELETE /api/settlements/:id` - Delete settlement

### Comments
- `GET /api/expenses/:expenseId/comments` - Get expense comments
- `POST /api/expenses/:expenseId/comments` - Add comment

### Socket.IO Events
- `joinExpense` - Join expense room for real-time updates
- `leaveExpense` - Leave expense room
- `sendComment` - Send comment via socket
- `receiveComment` - Receive comment via socket

## Database Schema

### Models
- **User**: User accounts
- **Group**: Expense groups
- **GroupMember**: Group membership (many-to-many)
- **Expense**: Expenses and settlements
- **ExpenseParticipant**: Expense split details
- **Comment**: Expense comments

### Key Design Decisions
- No balance table (computed dynamically)
- Settlements stored as Expense records
- Decimal(10,2) for money fields
- Unique constraints to prevent duplicates

## Deployment

### Environment Variables (Production)

**Backend (.env.production):**
```env
DATABASE_URL="postgresql://user:password@host:port/database"
JWT_SECRET="production-secret-key"
```

**Frontend (.env.production):**
```env
VITE_API_URL="https://your-backend-url.com/api"
VITE_SOCKET_URL="https://your-backend-url.com

```

### Deployment Platforms
- **Frontend**: Deployed to Vercel
- **Backend**: Deployed to Render
- **Database**: Railway PostgreSQL

## Known Limitations

- No pagination (suitable for ≤100 users)
- No caching (balances computed on each request)
- No notifications
- No search functionality
- INR currency only
- Single payer per expense
- No account deletion
- No email verification
- No password reset

## Development Notes

- All balances are derived from transaction history
- Debt simplification uses minimum cash flow algorithm
- Socket.IO used only for real-time delivery, not persistence
- Comments persisted in database, loaded via REST API
