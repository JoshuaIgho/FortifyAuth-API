# FortifyAuth Multi-Token authentication and validation paths

FortifyAuth utilizes a robust multi-token architecture to balance user convenience with high-level security controls across web and mobile clients.

---

## 1. Dual-Token Architecture

* **Access Token**: Short lived (15 minutes). Signed with RS256. Emitted as a cryptographically signed JSON Web Token (JWT). Decoded by individual compute nodes without calling PostgreSQL.
* **Refresh Token**: Opaque cryptographically random UUID matching hashes inside PostgreSQL. Valid for 7 days. Restricted to `/api/v1/auth/refresh` paths.

---

## 2. Refresh Token Rotation (RTR) Sequence

Refresh tokens are set on a strict **Single-Use Rotation** pipeline to prevent session replay attacks if a token is intercepted:

```mermaid
sequenceDiagram
    participant Client
    participant Engine
    participant Redis
    participant DB

    Client->>Engine: POST /api/v1/auth/refresh {refreshToken_A}
    Engine->>DB: Lookup refreshToken_A hash
    alt Token is already marked as USED
        DB-->>Engine: Status: USED! (Alert! Fraud vector!)
        Engine->>Redis: Blacklist ALL sessions associated with user ID
        Engine->>DB: Delete session cluster family
        Engine-->>Client: 403 Forbidden (Re-login required on all devices)
    else Token is ACTIVE
        DB-->>Engine: Valid Token Session Object
        Engine->>DB: Mark refreshToken_A as USED/REVOKED
        Engine->>Redis: Cache refreshToken_A JTI in blacklist until expiration
        Engine->>DB: Generate New refreshToken_B (expires in 7 days)
        Engine->>Engine: Generate New AccessToken_B (expires in 15 mins)
        Engine-->>Client: Return AccessToken_B & refreshToken_B
    end
```

---

## 3. Email Authentication & Activation Flow

1. Registering users receive a secure validation token inside their verified email inbox.
2. The user client sends the token back to `/api/v1/auth/verify-email`.
3. The server validates the token against the database:
   * If valid and not expired, the user's `isEmailVerified` flag is set to `true` inside PostgreSQL.
   * If expired, a new activation email can be requested via a designated endpoint.
