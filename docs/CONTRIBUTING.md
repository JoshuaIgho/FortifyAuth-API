# FortifyAuth Developer Contribution Guide

This guide describes how to contribute to FortifyAuth. As a security-critical enterprise-grade platform, all pull requests are evaluated against strict cryptographic and performance standards.

---

## 1. Local Branch Naming Rules
We group work branches by purpose:
* `feature/` - new security models or system modules (e.g., `feature/webauthn-passkeys`).
* `bugfix/` - security patches, regression repairs (e.g., `bugfix/jti-expiration-lookup`).
* `docs/` - documentation updates (e.g., `docs/faq-cors-instructions`).

---

## 2. Coding and Formatting Conventions
* **Language Specification**: 100% TypeScript with strict typing enabled.
* **Typing Quality**: Refrain from using `any` types. All variables must be bound to interfaces or primitive types.
* **Linter Standards**: Run validation routines prior to commit operations:
```bash
npm run lint
```

---

## 3. Cryptographic Verification Gateways
When updating code blocks touching crypto services, you must satisfy these constraints:
1. **Never use raw Math.random()** for cryptographic keys; use `crypto.randomBytes` or `window.crypto.getRandomValues`.
2. **Never commit hardcoded test credentials** or raw salt strings.
3. Every SQL transaction must go through Prisma query parameter mappings to avoid SQL inject vectors.

