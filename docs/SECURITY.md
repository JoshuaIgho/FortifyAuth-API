# FortifyAuth Cryptographic & Security Specification

This document details the enterprise-grade defense controls of FortifyAuth, mapping threat vectors to concrete security configurations. It provides a formal security audit covering cryptography, session architectures, and protocol defenses.

---

## 1. Compliance Controls Matrix (OWASP & Enterprise Benchmarks)

| Threat Boundary | Compliance Standard | Strategy & Implementation Specs |
| :--- | :--- | :--- |
| **Password Storage** | OWASP ASVS v4.0 | **bcrypt** with work factor `12`, or **Argon2id** (configured parameters: $m=65536, t=3, p=4$) preventing hardware-accelerated dictionary attacks. |
| **Session Forgery** | OWASP Top 10:2021 | Cryptographically signed dual-token system (strict short-lived JWTs + rotated opaque Refresh tokens). |
| **XSS Exfiltration** | OWASP Top 10:2021 | Tokens stored in `HttpOnly`, `Secure`, `SameSite=Strict` cookies hidden from Javascript runtime scopes. |
| **CSRF Injection** | OWASP Cheat Sheet | Double-Submit Cookie pattern paired with unique cryptographically random anti-CSRF headers. |
| **Replay Attacks** | NIST SP 800-63B | One-time-use Refresh tokens (Single-Use-Rotation), pairing old token blacklists with instantaneous account freezes on concurrent token reuse. |

---

## 2. JWT Cryptographic Signing Standards

### 2.1 Algorithm Requirements
* **Standard selection**: FortifyAuth rejects insecure algorithms like `none` or `HS256` in high-security multi-tenant installations.
* **Production Algorithm**: **RS256** (RSA Signature with SHA-256) or **ES256** (ECDSA with P-256 and SHA-256).
* **Key Rotations**: Key secrets are rotated daily via automated scripts using standard JWKS (JSON Web Key Sets) endpoints.

### 2.2 Payload Best Practices
* **Exempt sensitive parameters**: Payload arrays must never contain passwords, sensitive records, or critical database keys.
* **Claims Validation**: The engine enforces five primary claims assertions:
  1. `iss` (Issuer) - verifying matching system origins.
  2. `aud` (Audience) - rejecting requests intended for third-party client apps.
  3. `exp` (Expiration) - validating short-lived slots (<15 minutes).
  4. `nbf` (Not Before) - ensuring tokens are active.
  5. `jti` (JWT Unique ID) - checked against Redis session lists.

---

## 3. Cookie Hardening Specs

Cookies injected into browser sessions are hardened using these parameters:

```javascript
res.cookie('access_token', token, {
  httpOnly: true, // Absolutely cuts access from document.cookie scripts (defeats XSS-based session hijacking)
  secure: true,   // Forces TLS-only transit, preventing man-in-the-middle decryption on unencrypted channels
  sameSite: 'Strict', // Blocks cross-origin posts from leaking token parameters during cross-site requests
  maxAge: 15 * 60 * 1000, // Explicitly bounded token lifetime matching the 15-minute access token limit
  path: '/api/v1/auth', // Prevents secondary public system routes from receiving authorization headers
});
```

---

## 4. API Core Cors Mappings

Cors configurations must never use wildcards (`*`) in production. We configure strict origin boundaries:

```typescript
// cors.config.ts
import cors from 'cors';

const allowedOrigins = process.env.CORS_ALLOWED_ORIGINS?.split(',') || ['https://app.fortifyauth.io'];

export const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Rejected by FortifyAuth CORS Policies'));
    }
  },
  credentials: true, // Permits cookie routing transit
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token'],
  maxAge: 86400, // Cache pre-flight preflight requests for 24 hours to reduce platform network overhead
};
```

---

## 5. OWASP / Security Audit Checklist

Developers and audit administrators must verify these core verification parameters before signing off on production deployments:

* [ ] **Cryptographic Work Factors Verified**: Verify bcrypt is running at a work factor of `12` or higher.
* [ ] **JWT Private Keys Secured**: Confirm RSA/ECDSA private keys are injected as dynamic environment vectors, never hardcoded in repository sources.
* [ ] **HTTPS Enforced Globally**: Verify strict transport security headers (`Strict-Transport-Security: max-age=63072000; includeSubDomains; preload`) are injected into application controllers.
* [ ] **Cookie Contexts Hardened**: Double-check `httpOnly` and `secure` properties are set to `true` on access cookies in production environments.
* [ ] **SQL Injection Protections Active**: Confirm all queries run via Prisma parameterized statements, eliminating raw string injections.
* [ ] **Rate Limiting Active**: Ensure Redis sliding window limits restrict rapid auth connection calls (<5 tries/minute/IP on Login endpoints).
* [ ] **No Secrets in Public Repositories**: Verify `.env` parameters are present in `.gitignore`, preventing accidental commits to Git directories.
* [ ] **MFA MFA Protocols Configured**: Confirm MFA OTP endpoints use SHA-256 based cryptographically secure secret structures.
