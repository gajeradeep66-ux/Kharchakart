# KharchaKart

KharchaKart is a full-stack expense management application. Employees can submit and track expense claims, while managers, finance reviewers, and owners can review claims through a role-based approval workflow.

## Live Demo

**Demo URL:** _Add the deployed application URL here._

## Features

- User registration and token-based sign-in
- Expense claims with amount, currency, category, date, and description
- Optional vendor, location, notes, tags, and receipt upload
- Manager, finance, and owner review stages
- Expense search, filters, analytics, and CSV export
- User profiles, roles, and notifications
- Persistent light and dark themes
- Responsive React interface

## Technology

- Frontend: React, Vite, Tailwind CSS, React Router
- Backend: Node.js, Express
- Database: MongoDB with Mongoose
- Authentication: JSON Web Tokens and bcrypt
- Receipt uploads: Multer

## Requirements

- Node.js 20 or later and npm
- MongoDB, either a local instance or a MongoDB Atlas database

## Project scripts

Run from the project root:

| Command | Description |
| --- | --- |
| `npm run dev` | Start backend and frontend in development mode |
| `npm run dev:backend` | Start only the backend |
| `npm run dev:frontend` | Start only the frontend |
| `npm run build` | Build the frontend for production |
| `npm start` | Start the backend server |
| `npm run install:all` | Install backend and frontend dependencies |

Run `npm run seed` only with a development database when you want sample users and expenses for local testing. The server does not create demo records during startup, and the seed command is disabled when `NODE_ENV=production`.

## Deploy to Render

The [Render Blueprint](./render.yaml) builds the React app and serves it with the API from one Node web service. Create a Blueprint from this repository and provide `MONGODB_URI` for a reachable MongoDB database; Render generates `JWT_SECRET`. The service's own Render URL is allowed for same-origin requests. If you host the frontend separately, set `FRONTEND_URL` or add its origin to `ALLOWED_ORIGINS`.

Receipt files use local disk by default. Render's free web service does not provide persistent storage, so uploaded receipts can disappear after a restart or redeploy. Use external object storage or a persistent disk and set `UPLOAD_DIR` before relying on receipt retention.

## Configuration

The backend reads local settings from `backend/.env`. Supported settings include:

| Variable | Purpose |
| --- | --- |
| `PORT` | Backend listening port (defaults to `5000`) |
| `MONGODB_URI` | MongoDB connection string |
| `JWT_SECRET` | Private signing key for authentication tokens |
| `NODE_ENV` | Runtime environment |
| `FRONTEND_URL` | Optional frontend origin when hosting the UI separately |
| `ALLOWED_ORIGINS` | Comma-separated list of permitted browser origins |
| `UPLOAD_DIR` | Optional directory for uploaded receipt files |

Newly registered accounts receive the employee role; public registration cannot assign privileged roles. An owner can assign user, manager, finance, or owner access to an existing account, and the account's permissions and approval limit are updated with its role.
