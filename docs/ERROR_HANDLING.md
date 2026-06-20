# FortifyAuth Global Error Resolution System

FortifyAuth utilizes a centralized error-handling system. This guarantees that all operational failures return consistent, clear, and non-sensitive data models.

---

## Centralized HTTP Errors Mappings

Enterprise client modules parsing exception states rely on specific FortifyAuth Error Codes:

| Exception Category | HTTP Status Code | Fortify Error Code | Description |
| :--- | :--- | :--- | :--- |
| **Validation Failures** | `400 Bad Request` | `VAL_ERR_01` | Password, email, or input structures violate pattern schemas. |
| **Expired Signature** | `401 Unauthorized` | `AUTH_ERR_01` | Access token time-slot has elapsed. Client should execute auto-refresh loops. |
| **Revoked Session** | `401 Unauthorized` | `AUTH_ERR_02` | Refresh token JTI was revoked or previously used (re-authentication required). |
| **IP Rate Checked** | `429 Too Many Requests` | `RATE_ERR_01` | Request volume from connection IP has breached security thresholds. |
| **Internal Failures** | `500 Server Error` | `SYS_ERR_99` | System core issues (e.g., PostgreSQL connection drops). Details are masked from client. |

---

## Detailed JSON Error Payloads

Clients receive structured, secure error bodies:

```json
{
  "success": false,
  "error": "AUTH_ERR_02",
  "message": "Token was revoked or previously rotated. Directing client to require user login.",
  "timestamp": "2026-06-20T03:10:00.240Z",
  "path": "/api/v1/auth/refresh"
}
```

---

## Production Security Masking

Custom Express error handler middlewares strip debug arrays and PostgreSQL trace logs from API responses:

```typescript
// errorHandler.ts
import { Request, Response, NextFunction } from 'express';

export function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
  const status = err.statusCode || 500;
  
  // High fidelity logging for internal monitoring tools
  console.error(`[EXEC_ERROR] [${err.code || 'SYS_ERR_99'}] - ${err.message}`, err.stack);

  res.status(status).json({
    success: false,
    error: err.code || 'SYS_ERR_99',
    message: status === 500 ? 'An unexpected internal error occurred.' : err.message,
    timestamp: new Date().toISOString(),
    path: req.originalUrl,
  });
}
```
This protects internal database designs from being exposed to potential attackers.
