# FortifyAuth Migration Plan

This document outlines the transformation of the FortifyAuth API repository from a documentation and UI prototype into a production-ready authentication and authorization service.

## 1. Audit of Existing Codebase

The current codebase is a React-based interactive documentation hub.
- **Frontend**: Vite + React + Tailwind CSS. Provides a visual representation of the architecture, database schema, and API endpoints.
- **Data Layer**: Static TypeScript files in `src/data/` containing mock data and "simulation handlers" for API endpoints.
- **Infrastructure**: Minimal. Basic `package.json` for a React app, `tsconfig.json` for frontend development.

## 2. Hardcoded/Demo Implementations Identified

The following components are demo-only and will be replaced by functional backend logic:
- `src/data/apiEndpoints.ts`: Contains `simState` and `simulationHandler` functions.
- `src/components/AuthDemoView.tsx`: Interacts with the simulation handlers instead of a real API.
- Hardcoded roles and user data in various `src/data/*.ts` files.

## 3. Migration Strategy

### What will be Kept
- **React Frontend**: The UI prototype will be preserved. It serves as excellent documentation and a "Playground" for the API.
- **Styling & Assets**: Tailwind configuration and any assets used for the UI.
- **Folder Structure**: The existing `src/components` and `src/data` will remain.

### What will be Refactored/Modified
- `package.json`: Updated to include backend dependencies and scripts for both frontend and backend.
- `tsconfig.json`: Adjusted to support both DOM and Node.js environments.
- `src/main.tsx`: The entry point for the frontend remains, but it may eventually point to real API endpoints instead of simulations.

### What will be Added (New Backend Service)
A new modular backend architecture will be implemented under `src/`:
- `src/config/`: Environment and service configurations.
- `src/controllers/`: Request handlers.
- `src/services/`: Business logic.
- `src/repositories/`: Data access layer (Prisma).
- `src/middlewares/`: Security, validation, and error handling.
- `src/routes/`: Express route definitions.
- `src/validators/`: Zod schemas for request validation.
- `src/utils/`: Shared utilities (logger, helpers).
- `src/interfaces/` & `src/types/`: TypeScript definitions.
- `src/server.ts` & `src/app.ts`: Entry points for the Express server.

## 4. Execution Phases

- **Phase 1**: Foundation (Express, Logger, Error Handling, Env Config).
- **Phase 2**: Database (Prisma + PostgreSQL).
- **Phase 3**: Authentication (Register, Login, Logout, Refresh).
- **Phase 4**: Email Features (Verification, Password Reset).
- **Phase 5**: Authorization (RBAC).
- **Phase 6**: Security (Helmet, Rate Limiting, CORS).
- **Phase 7**: Documentation (Swagger/OpenAPI).
