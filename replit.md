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
The application is running with **full backend integration**:
- PostgreSQL database (External server: 194.87.215.84)
  - Database: `data_vrassrochki`
  - Schema: `payment_tracking` (isolated from other projects)
- Node.js/Express backend API (port 3001)
- Real-time data persistence
- JWT authentication
- Full production-ready stack

## Running the Application

### Starting the App
The application runs automatically via the **Frontend** workflow. To start or restart:
1. Click the **Run** button in the top toolbar, or
2. Use the command: `npm run dev`

The app will start on **port 5000** and appear in the Webview panel.

### Current Configuration
**Frontend:**
- **Workflow**: Frontend (runs `npm run dev`)
- **Port**: 5000 (automatically exposed by Replit)
- **Host**: 0.0.0.0 (configured for Replit proxy)
- **URL**: Available in the Webview panel

**Backend:**
- **Workflow**: Backend (runs `cd src/backend-example && node server.js`)
- **Port**: 3001 (internal, accessed via Vite proxy)
- **Database**: PostgreSQL (External server)
  - Host: 194.87.215.84:5432
  - Database: data_vrassrochki
  - Schema: payment_tracking (isolated)
- **API Endpoint**: `/api` (proxied from frontend)

### Stopping/Restarting
- Use the workflow controls in the Replit interface
- Or manually stop with Ctrl+C in the console and restart with `npm run dev`

## Features
- **User Authentication**: Login and registration system
- **Client Management**: Add, edit, and track clients
- **Payment Calendar**: Visual monthly/yearly payment overview
- **Payment Status Tracking**: Paid, upcoming, overdue statuses
- **Payment Postponement**: Reschedule overdue payments
- **School Management**: Multi-school support (Architect role)
- **User Roles**: Architect, Admin, Manager, Assistant

## Backend & Database

The backend is **already configured** and running:

### Database Schema
- `schools` - School organizations
- `users` - User accounts (Architect, Admin, Manager, Assistant roles)
- `clients` - Client records with payment plans
- `payments` - Individual payment records
- `overdue_history` - Payment postponement history

### Current User Account
**Email:** sochneva.anastasiya@gmail.com  
**Role:** Architect (full system access)  
**Password:** Set during setup

### How It Works
- Frontend (port 5000) → Vite proxy → Backend (port 3001) → External PostgreSQL
- Authentication via JWT tokens
- All API requests go through `/api` endpoint
- Database connection using external PostgreSQL server
- All data stored in dedicated `payment_tracking` schema for project isolation

See `src/backend-example/README.md` for API documentation.

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
- **2025-11-18**: Full stack setup with external PostgreSQL completed
  - ✅ Configured Vite for Replit (port 5000, host 0.0.0.0, allowedHosts)
  - ✅ Created Frontend workflow
  - ✅ Connected to external PostgreSQL server (194.87.215.84)
  - ✅ Created dedicated schema `payment_tracking` for project isolation
  - ✅ Configured Backend workflow (port 3001)
  - ✅ Initialized database schema (5 tables in payment_tracking schema)
  - ✅ Updated all SQL queries to use schema-qualified table names
  - ✅ Created Architect user account (sochneva.anastasiya@gmail.com)
  - ✅ Configured Vite proxy for API routing
  - ✅ Updated env.ts for development mode detection
  - ✅ Added TypeScript definitions for Vite environment
  - ✅ Verified full stack integration (frontend ↔ backend ↔ external database)

## Project Status
✅ Frontend running (React + Vite)
✅ Backend running (Node.js + Express)
✅ Database connected (PostgreSQL)
✅ Full stack integration working
✅ User authentication functional
✅ All UI components operational

## Deployment
Ready to deploy as a static frontend application or configure backend for full functionality.
