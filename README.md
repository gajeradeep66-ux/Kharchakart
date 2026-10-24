# 💳 KharchaKart - Expense Management System

[![Live Demo](https://img.shields.io/badge/Live_Demo-KharchaKart_on_Render-00c7b7?style=for-the-badge&logo=render&logoColor=white)](https://kharchakart.onrender.com)
&nbsp;
[![Live URL](https://img.shields.io/badge/Website-kharchakart.onrender.com-blue?style=for-the-badge)](https://kharchakart.onrender.com)

KharchaKart is a full-stack MERN enterprise expense tracking and approval system featuring role-based workflows, multi-currency claims, digital receipts, analytics, and persistent dark/light themes.

## ✨ Key Features
- **Role-Based Portals**: Dedicated access for Owner, Finance, Manager, and Employee.
- **3-Step Approval Pipeline**: Manager Review ➔ Finance Audit ➔ Owner Payment Confirmation.
- **Multi-Currency Engine**: Record claims in INR (₹), USD ($), EUR (€), GBP (£), and more.
- **Receipt Attachments**: Upload and preview PDF, JPG, PNG, and GIF receipts (up to 10 MB).
- **Analytics & CSV Export**: Real-time spending breakdown and one-click report downloads.
- **Dark & Light Mode**: Complete theme persistence across all screens and accounts.

## 👥 Demo Accounts
| Role | Portal URL | Email | Password | Access Level |
| :--- | :--- | :--- | :--- | :--- |
| **Owner** | `/login/admin` | `owner@kharchakart.com` | `Owner123!` | System settings, user roles, payment confirmation |
| **Finance** | `/login/finance` | `finance@kharchakart.com` | `Finance123!` | Step 2 audit, tax/invoice verification, CSV export |
| **Manager** | `/login/manager` | `manager@kharchakart.com` | `Manager123!` | Step 1 review, team claims verification |
| **Employee** | `/login` | `employee@kharchakart.com` | `Employee123!` | Submit claims, attach receipts, track status |

## 🔄 3-Step Approval Workflow
1. **Submit**: Employee submits expense claim with category, amount, currency, and receipt.
2. **Step 1 (Manager)**: Manager reviews claim justification and approves or rejects with reason.
3. **Step 2 (Finance)**: Finance team audits compliance, taxes, and receipt documents.
4. **Step 3 (Owner)**: Owner confirms payment disbursement and marks claim fully approved.

## 📡 API Endpoints Summary
- **Auth**: `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me`
- **Expenses**: `GET /api/expenses`, `POST /api/expenses`, `POST /api/expenses/upload-receipt`
- **Approvals**: `GET /api/approvals/pending`, `POST /api/approvals/:id/approve`, `POST /api/approvals/:id/reject`
- **Notifications**: `GET /api/notifications`, `PUT /api/notifications/:id/read`

## 🛠️ Tech Stack
- **Frontend**: React 18, Vite, Tailwind CSS, Lucide Icons, Axios
- **Backend**: Node.js, Express, MongoDB with Mongoose, JWT, Multer, Helmet
- **Database**: MongoDB Atlas / Local MongoDB

## 🚀 Quick Start
```bash
# 1. Install dependencies across backend and frontend
npm run install:all

# 2. Configure backend/.env with MONGODB_URI & JWT_SECRET
# 3. Seed demo accounts and sample expenses
npm run seed

# 4. Start frontend (:5173) and backend (:5000) concurrently
npm run dev
```

## 📜 Project Scripts
| Command | Action |
| :--- | :--- |
| `npm run dev` | Run backend & frontend concurrently in development mode |
| `npm run seed` | Populate database with demo users and expenses |
| `npm run build` | Build optimized frontend production bundle |
| `npm start` | Run backend server in production mode |

## ☁️ Deployment
- **Live App**: [https://kharchakart.onrender.com](https://kharchakart.onrender.com)
- **Blueprint**: Deployed on [Render](https://render.com) using [`render.yaml`](./render.yaml). Set `MONGODB_URI` and `JWT_SECRET` in environment variables.
