# FortifyAuth Operations Master FAQ

This document addresses frequently asked questions from architects, security officers, and developers integrating FortifyAuth.

---

## 1. CORS Errors block login requests. How do we resolve this?
FortifyAuth enforces strict origin controls for security. In production, requests from unlisted domains are instantly rejected. To authorize a new client application, add its exact URL to `CORS_ALLOWED_ORIGINS` inside your environment variables:
```env
CORS_ALLOWED_ORIGINS=https://app.fortifyauth.io,https://dashboard.fortifyauth.io
```
Ensure they are comma-separated and do not contain trailing slashes or standard wildcards (`*`).

---

## 2. Why are tokens split into short-lived access keys and long-lived refresh keys?
To maximize API performance, access tokens are stateless JWTs that compute nodes decode without querying databases.
However, because they are stateless, they cannot be easily revoked before expiration.
Keeping access token lifespans short (15 minutes) limits the impact if one is intercepted. We pairing this with Refresh Token Rotation (RTR) to safely maintain user sessions over the long term.

---

## 3. How does FortifyAuth handle brute force dictionary attacks?
We enforce a multi-layer defense:
1. **IP Level Rate Limits**: Restricts login requests from a single IP to 5 attempts per minute.
2. **Account Lockout Policy**: Safely locks user accounts after 5 consecutive failed login attempts. Accounts can be unlocked via a transaction link sent to the verified email.
3. **Timed Delay Hooks**: Intentionally stretches server response times on consecutive validation failures to delay automated cracking scripts.
