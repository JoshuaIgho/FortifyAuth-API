# 🛡️ FortifyAuth API

[![Production Status](https://img.shields.io/badge/Status-Production--Ready-success?style=for-the-badge)](https://fortifyauth-api-1.onrender.com/)
[![Tech Stack](https://img.shields.io/badge/Stack-Node.js%20%7C%20Express%20%7C%20TypeScript%20%7C%20Prisma%20%7C%20PostgreSQL-blue?style=for-the-badge)](https://fortifyauth-api-1.onrender.com/)
[![Security](https://img.shields.io/badge/Security-Argon2id%20%7C%20JWT%20Rotation%20%7C%20RBAC-red?style=for-the-badge)](https://fortifyauth-api-1.onrender.com/)

**FortifyAuth** is a high-integrity, production-grade identity platform and authentication service. It transforms a documentation-heavy prototype into a fully functional, secure, and modular backend engine designed for high availability and resilient security.

---

## 🚀 Key Features

- **🔐 Advanced Cryptography**: Password hashing using **Argon2id** (OWASP-recommended) with memory-hard and parallel-processing parameters.
- **🔄 Dual-Tier Token Engine**: Stateless **JWT Access Tokens** paired with opaque, database-backed **Refresh Tokens**.
- **🚨 Breach Detection**: Automatic **Refresh Token Rotation** with a built-in "nuclear option" that invalidates all user sessions upon detection of token reuse/replay attacks.
- **🛡️ Multi-Layered Security**:
  - **RBAC**: Role-Based Access Control (USER, ADMIN, MODERATOR).
  - **Rate Limiting**: Granular, in-memory sliding window protection for critical authentication paths.
  - **Sanitization**: Global input sterilization using **DOMPurify** to neutralize XSS vectors.
  - **Hardened Headers**: Full **Helmet.js** integration with custom CSP and HSTS policies.
- **📧 Transactional Mail**: Integrated flows for email verification and password recovery via SMTP (Resend/Nodemailer).
- **📋 Audit & Observability**: Comprehensive logging of security events, login history, and administrative changes using **Winston**.
- **📖 Interactive Documentation**: Live Swagger/OpenAPI explorer and a built-in React-based technical blueprint UI.

---

## 🛠️ Tech Stack

- **Runtime**: Node.js (ES Modules)
- **Framework**: Express.js
- **Language**: TypeScript
- **ORM**: Prisma
- **Database**: PostgreSQL
- **Validation**: Zod
- **Security**: Argon2, JsonWebToken, Helmet, DOMPurify
- **Documentation**: Swagger UI, Vite (Frontend UI)
- **Deployment**: Render (Native Node.js Runtime)

---

## 📂 Project Structure

```text
src/
├── config/         # Environment and service configurations
├── controllers/    # Request handlers (API interface)
├── services/       # Core business logic & security orchestration
├── repositories/   # Data access layer (Prisma interactions)
├── middlewares/    # Security, Auth, Rate-limiting, and Error filters
├── routes/         # API endpoint definitions (versioned)
├── validators/     # Zod schema definitions for input validation
├── utils/          # Hashing, logging, and shared utility functions
├── docs/           # Swagger config and technical specifications
├── app.ts          # Express application setup
└── server.ts       # Server entry point and DB connection logic
```

---

## 🚦 Getting Started

### Prerequisites

- **Node.js** (v18+)
- **PostgreSQL** instance

### Local Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/your-username/fortify-auth.git
   cd fortify-auth
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment**:
   Create a `.env` file based on `.env.example`:
   ```bash
   cp .env.example .env
   ```
   *Required fields: `DATABASE_URL`, `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, `SMTP_HOST`, `SMTP_PASS`.*

4. **Initialize Database**:
   ```bash
   npx prisma migrate dev
   ```

5. **Run in Development**:
   ```bash
   # Start backend (auto-reload)
   npm run server:dev

   # Start frontend (vite dev)
   npm run dev
   ```

---

## 🏗️ Build & Deployment

### Production Build
The project uses a dual build pipeline:
- **Frontend**: Vite compiles assets into `dist/client`.
- **Backend**: esbuild bundles the server into `dist/server.js`.

```bash
npm run build
```

### Deploy to Render
1. Create a **Web Service** on Render.
2. Connect your repository.
3. Set **Build Command**: `npm install && npm run build`
4. Set **Start Command**: `npm start`
5. Add your Environment Variables in the Render dashboard.

---

## 🧪 Testing

The project includes an integration test suite using **Jest** and **Supertest** with Prisma mocking.

```bash
npm test
```

---

## 📜 API Documentation

Once the server is running, you can access the interactive documentation at:

- **Technical Blueprints (React UI)**: `http://localhost:3000/`
- **Swagger/OpenAPI Explorer**: `http://localhost:3000/api/docs`

---

## ⚖️ License

Distributed under the MIT License. See `LICENSE` for more information.

<div align="center">
  <sub>Built with ❤️ by the FortifyAuth Engineering Team</sub>
</div>
