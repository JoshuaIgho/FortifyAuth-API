# FortifyAuth Session & Device Management Blueprint

Enterprise security workflows require thorough tracking of authenticated user devices. FortifyAuth logs detailed connection fingerprints to keep users informed and identify anomalous login attempts.

---

## 1. Metadata Session Capturing

Whenever users authenticate, the engine records physical workstation metadata properties in the database:

* **Location (GeoIP Mapping)**: Translates inbound request IP coordinates (e.g., Paris, France).
* **Equipment (User-Agent extraction)**: Parses browser engine and OS specifics (e.g., "Chrome v122 on macOS Sonoma").
* **Fingerprints (`jti`)**: Maps active sessions to specific database UUID structures.

---

## 2. Session Revocation Pattern

Users can view active logins on a designated page and revoke access for specific devices (e.g., if a device is lost or stolen):

```typescript
// session.service.ts
import { PrismaClient } from '@prisma/client';
import { getRedisClient } from '../lib/redis';

const prisma = new PrismaClient();

export async function revokeDeviceSession(userId: string, sessionId: string) {
  // 1. Fetch target session record in PostgreSQL
  const session = await prisma.deviceSession.findFirst({
    where: { id: sessionId, userId }
  });

  if (!session) {
    throw new Error('Target session was not found or access is restricted.');
  }

  // 2. Erase the session from PostgreSQL
  await prisma.deviceSession.delete({
    where: { id: sessionId }
  });

  // 3. Blacklist associated token JTIs in Redis to instantly reject active requests
  const redis = getRedisClient();
  const expRemaining = 7 * 24 * 60 * 60; // 7 days in seconds
  await redis.setex(`blacklist:jti:${sessionId}`, expRemaining, 'revoked');

  console.log(`[REVOCATION] Evicted session ${sessionId} for user ${userId}`);
}
```

---

## 3. Simultaneous Session Limits

To prevent brute force credentials sharing, administrators can configure concurrent session thresholds:
* **Max Active Devices**: 5 concurrent active logins per user template.
* **Overrun Strategy**: If a user logs in on a 6th device, the oldest active session is automatically terminated.
