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
**Password:** qwertyasd

### Multi-Role Support
The system supports **multiple roles per email address**:
- One email can be an architect AND admin of different schools
- Admins can be managers in other organizations
- No UNIQUE constraint on email field (removed for multi-role support)
- Each user record is unique by (email + role + school_id) combination

### How It Works
- Frontend (port 5000) → Vite proxy → Backend (port 3001) → External PostgreSQL
- Authentication via JWT tokens
- All API requests go through `/api` endpoint
- Database connection using external PostgreSQL server
- All data stored in dedicated `payment_tracking` schema for project isolation
- **Schema Resolution**: Uses PostgreSQL `search_path` approach for automatic schema resolution
  - Connection sets `search_path = payment_tracking, public` on connect
  - All queries use unqualified table names (e.g., `SELECT * FROM users`)
  - pg-format.ident() used for safe schema name escaping where needed

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
- **2025-11-20**: Fixed Select dropdown not opening in manager filter
  - ✅ Root cause: Invalid TailwindCSS syntax + style prop merging issue in select.tsx
    - Original code: `max-h-(--radix-select-content-available-height)` (incorrect syntax)
    - Original code: `origin-(--radix-select-content-transform-origin)` (incorrect syntax)
  - ✅ Solution implemented:
    - Used correct TailwindCSS arbitrary value: `max-h-[var(--radix-select-content-available-height)]`
    - Used inline style for transform-origin (not supported by Tailwind arbitrary values)
    - Extracted `style` prop and merged safely to prevent override
  - ✅ Radix UI animation variables now work correctly
  - ✅ Select dropdown opens, animates, and positions properly
  - ✅ Manager filter in Dashboard calendar now fully functional

- **2025-11-20**: Fixed calendar "Ожидается" sum calculation logic
  - ✅ "Ожидается" now shows total sum of ALL payments on a day (fixed amount)
  - ✅ Previously showed only unpaid payments (decreased when marking as paid)
  - ✅ Changed from `unpaidTotal` to `totalExpected` calculation
  - ✅ "Оплачено" remains unchanged (sum of paid payments only)
  - ✅ Business logic: Expected = fixed total, Paid = grows as payments are marked paid

- **2025-11-19**: Added client click navigation in calendar day details
  - ✅ Implemented clickable client names in DayDetailsDialog
  - ✅ Client name shows hover effect (underline + purple color)
  - ✅ Clicking client name opens EditClientDialog
  - ✅ Props threaded through: Dashboard → PaymentCalendar → DayDetailsDialog
  - ✅ Optional onClientClick prop maintains backward compatibility

- **2025-11-19**: Fixed manager dropdown not opening in AddClientDialog
  - ✅ Root cause #1: Radix UI Select doesn't work when value is empty string '' but no SelectItem has that value
    - Changed formData.manager initialization from '' to undefined
    - Updated Select value prop to use undefined when no manager selected
    - Added explicit TypeScript types to formData state (manager: string | undefined)
  - ✅ Root cause #2: z-index conflict between Dialog (z-[9999]) and SelectContent (z-50)
    - SelectContent was rendering behind Dialog modal, making dropdown invisible
    - Increased SelectContent z-index from z-50 to z-[10000] in ui/select.tsx
    - Dropdown now appears correctly above modal dialogs
  - ✅ Maintained backward compatibility with Input fallback when no managers exist

- **2025-11-19**: Simplified calendar display - removed prepayments, show only aggregated sums
  - ✅ Calendar cells now show only 2 aggregated sums per day (always visible):
    - "Ожидается" - sum of all unpaid payments (default color)
    - "Оплачено" - sum of all paid payments (green)
  - ✅ Removed all prepayment-specific UI elements:
    - No 🌸 flower emoji in calendar cells or tooltip
    - No blue color for prepayments
    - No "Предоплата" text in tooltip or legend
  - ✅ Tooltip shows only: client name, amount, and status (Оплачено/Ожидается)
  - ✅ Legend simplified: Оплачено, Ожидается, Перенесен, Сегодня
  - ✅ Both sums always displayed, even when 0 ₽
  - ✅ Added fallback handling (|| 0) for undefined/null payment amounts
  - ✅ Clean aggregated view for better clarity

- **2025-11-19**: Implemented architect role isolation - schools managed only in dedicated admin panel
  - ✅ Removed "Школы" tab from Dashboard - architect sees same interface as other roles when working in a school
  - ✅ Added "Управление школами" button in Dashboard header for architects
  - ✅ Implemented clearSchool() method in AuthContext to navigate back to SchoolSelector
  - ✅ Architect workflow: SchoolSelector (admin panel) ↔ Dashboard (per-school interface)
  - ✅ Fixed critical white-screen bug in client management
  - ✅ Resolved Radix UI Select crash caused by empty manager values
  - ✅ Enhanced AddClientDialog.tsx with smart manager field (Select or Input based on available managers)
  - ✅ Fixed EditClientDialog prop types and TypeScript typings

- **2025-11-18**: Full stack setup with external PostgreSQL completed
  - ✅ Configured Vite for Replit (port 5000, host 0.0.0.0, allowedHosts)
  - ✅ Created Frontend workflow
  - ✅ Connected to external PostgreSQL server (194.87.215.84)
  - ✅ Created dedicated schema `payment_tracking` for project isolation
  - ✅ Configured Backend workflow (port 3001)
  - ✅ Initialized database schema (5 tables in payment_tracking schema)
  - ✅ Implemented search_path approach for schema resolution (simpler than schema-qualified queries)
  - ✅ Fixed SQL syntax errors in server.js (incorrect quote usage in template literals)
  - ✅ Removed UNIQUE constraint on email field to support multi-role functionality
  - ✅ Created Architect user account (sochneva.anastasiya@gmail.com / qwertyasd)
  - ✅ Configured Vite proxy for API routing
  - ✅ Updated env.ts for development mode detection
  - ✅ Added TypeScript definitions for Vite environment
  - ✅ Verified full stack integration (frontend ↔ backend ↔ external database)
  - ✅ Tested multi-role support (one email with multiple roles in different schools)

## Project Status
✅ Frontend running (React + Vite)
✅ Backend running (Node.js + Express)
✅ Database connected (PostgreSQL)
✅ Full stack integration working
✅ User authentication functional
✅ All UI components operational

## Deployment
Ready to deploy as a static frontend application or configure backend for full functionality.
