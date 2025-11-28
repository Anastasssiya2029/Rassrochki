# Interactive Payment Tracking Service

## Overview
This project is an interactive payment tracking and installment management service designed for online schools. Its primary purpose is to help educational institutions monitor client payments, manage installment schedules, and effectively handle overdue payments. The system aims to streamline financial operations, improve client relationship management, and provide clear visibility into payment statuses.

## User Preferences
I prefer iterative development with clear, concise explanations. Please ask before making major architectural changes or introducing new external dependencies. Focus on delivering robust, production-ready code.

## System Architecture
The application features a modern, responsive UI built with React, Vite, and TypeScript, utilizing `shadcn/ui` components and a cosmic gradient theme. Key UI/UX decisions include a calendar view for payment tracking and a client management dashboard.

The system is a full-stack application with a Node.js/Express backend and a PostgreSQL database.
**Technical Implementations and System Design:**
- **Frontend**: React + Vite + TypeScript, Tailwind CSS, Radix UI, Recharts, React Hook Form.
- **Backend**: Node.js + Express, PostgreSQL.
- **Authentication**: JWT-based authentication system.
- **Database Schema**: Dedicated `payment_tracking` schema with tables for `schools`, `users`, `clients`, `payments`, and `overdue_history`.
- **Multi-Role Support**: Designed to support multiple user roles (Architect, Admin, Manager, Assistant) per email address across different schools. The `email` field does not have a `UNIQUE` constraint to facilitate this. Each user record is unique by (`email` + `role` + `school_id`).
- **Schema Resolution**: Utilizes PostgreSQL `search_path` for automatic schema resolution, setting `search_path = payment_tracking, public` on connection to allow unqualified table names in queries.
- **API Proxying**: Frontend (port 5000) proxies API requests through Vite to the Backend (port 3001).
- **Core Features**:
    - User Authentication (Login/Registration)
    - Client Management (CRUD operations)
    - Payment Calendar (visual overview, status tracking)
    - Payment Statuses (Paid, Upcoming, Overdue)
    - Payment Postponement/Rescheduling
    - Multi-school Management (for Architect role)
    - Role-based Access Control

## External Dependencies
- **PostgreSQL Database**: Hosted on an external server (194.87.215.84), database `data_vrassrochki`, using schema `payment_tracking`.
- **Node.js/Express**: Backend server.
- **React**: Frontend library.
- **Vite**: Build tool for the frontend.
- **TypeScript**: Superset of JavaScript for type-safety.
- **Tailwind CSS**: Utility-first CSS framework.
- **Radix UI**: Unstyled component library.
- **shadcn/ui**: Components built with Radix UI and Tailwind CSS.
- **Recharts**: Charting library for analytics.
- **React Hook Form**: Form management library.