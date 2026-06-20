# FortifyAuth Environment Configurations Map

This document lists environment variables required to run FortifyAuth in production and development environments.

---

## Variable Indexes

| Variable Key | Scope and Safety | Recommended Default Value | Purpose |
| :--- | :--- | :--- | :--- |
| `NODE_ENV` | Environment Flag | `production` / `development` | Dictates compiler outputs and activates secure cookie requirements. |
| `DATABASE_URL` | Operational Postgres Connection | `postgresql://user:pass@host:5432/db` | Coordinates query paths for Prisma ORM. |
| `REDIS_URL` | High availability cache | `rediss://default:pass@redis-host:6379` | Coordinates Redis session arrays and blocklogs. |
| `JWT_ACCESS_SECRET` | HS256 Signing Key | High Entropy Random String | Validates short lived client access privileges. |
| `JWT_REFRESH_SECRET` | Session Signing Key | High Entropy Random String | Generates opaque rotation credentials. |
| `CORS_ALLOWED_ORIGINS` | CORS White-list | `https://app.fortifyauth.io` | Lists safe browser locations allowed to authenticate. |
| `SMTP_HOST` / `PORT` | Email Provider Access | `smtp.resend.com` : `465` | Handles validation notifications transmission. |

---

## Secret Injection Best Practices

1. **Do NOT save `.env` into repository folders**. Keep this file name in `.gitignore`.
2. **Rotate Signature Keys**: Access secrets should be rotated every 90 days.
3. **Use Clustered Vault Systems** (e.g. HashiCorp Vault, AWS Secrets Manager, GCP Secret Manager) to inject variables directly into target runtime containers in Kubernetes environments.
