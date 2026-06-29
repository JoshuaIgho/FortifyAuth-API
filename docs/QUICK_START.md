# FortifyAuth Quick Start Guide

This guide helps you launch FortifyAuth for local development.

## Prerequisites
- **Node.js** v20.x or higher
- **PostgreSQL** v15+ (Local or Managed)
- **Redis** v7.x+ (Local or Managed)

## Setup Steps

1. **Clone & Install**
   ```bash
   npm install
   ```

2. **Environment Configuration**
   ```bash
   cp .env.example .env
   # Update .env with your local DB and Redis credentials
   ```

3. **Database Setup**
   ```bash
   npx prisma db push
   ```

4. **Start Development**
   ```bash
   # Backend: starts on port 4000
   npm run server:dev

   # Frontend: starts on port 3000
   # run in separate terminal
   # npm run dev
   ```

Open [http://localhost:3000](http://localhost:3000) for the documentation dashboard.
