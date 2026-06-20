# FortifyAuth Quick Start Guide

This document describes how to launch a local development instance of FortifyAuth with fully-seeded databases, Redis-connected token caches, and operational environment variables.

## System Prerequisites

Before launching, verify your developer workstation exceeds the minimal boundaries below:
* **Node.js** v20.10.x or higher LTS
* **Docker Engine** v24.0.x or higher + **Compose** v2.20.x
* **PostgreSQL** v15+ (if running bare-metal on host)
* **Redis** v7.x+ (if running bare-metal on host)

---

## 5-Minute Developer Setup

### Step 1: Duplicate Parameters Core
Copy the configuration template to establish environment environments:
```bash
cp .env.example .env
```
*(Open `.env` to configure your PostgreSQL connection coordinates and Redis connection urls.)*

### Step 2: Provision Docker Containers
Spin up isolated instances of Postgres database and Redis cache in background mode:
```bash
docker-compose -f docker-compose.yml up -d
```
Verify matching state:
```bash
docker ps
```

### Step 3: Install Package Dependencies
Install all core and structural developer packages:
```bash
npm install
```

### Step 4: Run Prisma DB Migrations
Compile the Prisma schemas, align the PostgreSQL indexes, and execute state tables mapping:
```bash
npx prisma db push
```
*(For tracking strict git migration histories in production databases, use `npx prisma migrate dev --name init` instead).*

### Step 5: Execute Seed Operations
To inject standard Roles (`USER`, `ADMIN`, `MODERATOR`), test keys, and dev administrative records run:
```bash
npm run db:seed
```

### Step 6: Start local Development server
Launch the hot-reloading Express server proxying Vite client requests at port 3000:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to inspect the developer interactive dashboard.

---

## Database Seeding Sample

The operational schema includes a built-in seed file (`prisma/seed.ts`) to establish baseline operational compliance:

```typescript
// prisma/seed.ts
import { PrismaClient, Role } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Executing developer seed script...');
  
  // Seed Roles
  const roles = [Role.USER, Role.ADMIN, Role.MODERATOR];
  console.log('Seeded Roles: ' + roles.join(', '));

  // Seed Admin user
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@fortifyauth.io' },
    update: {},
    create: {
      email: 'admin@fortifyauth.io',
      name: 'Principal Security Officer',
      passwordHash: '$2b$12$Z0H37Sxe2fRzCAt8OWhOAuYgVz.3Q3lMvIdhHlq8kMbeN1cHeZfSq', //bcrypt hash for "AdminFortifySecur3"
      role: Role.ADMIN,
      isEmailVerified: true,
    },
  });

  console.log(`✅ Complete. Created Admin User: ${adminUser.email}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```
