# Interactive Payment Tracking Service

## Overview
This is a payment tracking and installment management system for online schools. The application helps track client payments, manage installment schedules, and handle overdue payments.

**Original Project**: [Figma Design](https://www.figma.com/design/2Hz5vxVZwXljYhAQShe4ID/Interactive-Payment-Tracking-Service)

## Project Structure
- **Frontend**: React + Vite + TypeScript
  - Modern UI with shadcn/ui components
  - Responsive design with cosmic gradient theme
  - Calendar view for payment tracking
  - Client management dashboard
- **Backend** (optional): Node.js + Express + PostgreSQL
  - Located in `src/backend-example/`
  - JWT authentication
  - PostgreSQL database for schools, users, clients, and payments

## Current Setup
The application is currently running in **demo mode** without a backend connection. This means:
- Uses mock data for demonstration
- All features are functional but data is not persisted
- Perfect for testing the UI and workflows

## Running the Application
The frontend is already configured and running:
- **URL**: Available in the Webview panel
- **Port**: 5000
- **Demo Mode**: Active (no backend required)

## Features
- **User Authentication**: Login and registration system
- **Client Management**: Add, edit, and track clients
- **Payment Calendar**: Visual monthly/yearly payment overview
- **Payment Status Tracking**: Paid, upcoming, overdue statuses
- **Payment Postponement**: Reschedule overdue payments
- **School Management**: Multi-school support (Architect role)
- **User Roles**: Architect, Admin, Manager, Assistant

## Optional: Backend Setup
If you want to connect a real backend with PostgreSQL:

1. Set up PostgreSQL database (use Replit's built-in PostgreSQL)
2. Navigate to backend: `cd src/backend-example`
3. Install dependencies: `npm install`
4. Create `.env` file with database credentials
5. Initialize database: `npm run init-db`
6. Run backend: `npm start` (will run on port 3001)
7. Set `REACT_APP_API_URL` environment variable in frontend

See `src/backend-example/README.md` for detailed backend instructions.

## Technologies Used
- React 18
- Vite 6
- TypeScript
- Tailwind CSS
- Radix UI components
- shadcn/ui
- Recharts for analytics
- React Hook Form
- Express.js (backend)
- PostgreSQL (backend)

## Recent Changes
- **2025-11-18**: Initial Replit setup
  - Configured Vite for Replit environment (port 5000, host 0.0.0.0)
  - Created frontend workflow
  - Added .gitignore for Node.js project
  - Verified demo mode functionality

## Project Status
✅ Frontend running in demo mode
✅ All UI components functional
⚠️ Backend not configured (optional)
⚠️ Database not connected (optional)

## Deployment
Ready to deploy as a static frontend application or configure backend for full functionality.
