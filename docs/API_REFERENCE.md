# FortifyAuth API Reference Manual

The FortifyAuth REST API runs on port `3000` via standard HTTPS. All transaction bodies utilize standard JSON encoding. Request authorization parameters are parsed from bearer headers (`Authorization: Bearer <access_token>`) or HttpOnly cookies.

---

## Endpoint List Directory

### 1. Registration & Verification Flow
* `POST /api/v1/auth/register` - Create client user profile.
* `POST /api/v1/auth/verify-email` - Activate email flags with verification token.

### 2. Authentication Processes
* `POST /api/v1/auth/login` - Request access and refresh tokens.
* `POST /api/v1/auth/logout` - Revoke current device sessions and clear authorization cookies.
* `POST /api/v1/auth/refresh` - Request token renewal (Refresh Token Rotation).

### 3. Passwords & MFA Maintenance
* `POST /api/v1/auth/forgot-password` - Request a password reset link.
* `POST /api/v1/auth/reset-password` - Update password using a reset token.
* `POST /api/v1/mfa/enable` - Initiate Two-Factor Authentication (OTP secret mapping).
* `POST /api/v1/mfa/verify` - Verify and lock dual authorization settings.

### 4. Developer API Key Management
* `POST /api/v1/keys/create` - Provision API key headers.
* `GET /api/v1/keys` - List active client API keys.
* `DELETE /api/v1/keys/:id` - Revoke credentials.

### 5. Sessions & Audit Monitoring
* `GET /api/v1/sessions` - List currently connected physical equipment.
* `DELETE /api/v1/sessions/:id` - Forcefully terminate a session.
* `GET /api/v1/audit-logs` - Query security compliance timelines.

---

## Detailed Endpoint Specifications

### User Registration
* **Method**: `POST`
* **URL**: `/api/v1/auth/register`
* **Description**: Registers a new user account inside FortifyAuth and triggers an email verification cycle.
* **Authentication requirements**: None (Public)
* **Request Body**:
```json
{
  "email": "developer@enterprise.io",
  "password": "StrongSecurePassword30!",
  "name": "Alex Carter"
}
```
* **Success Response (201 Created)**:
```json
{
  "success": true,
  "message": "User registered successfully. Validation token sent to email.",
  "data": {
    "userId": "usr_910510e5_f36a",
    "email": "developer@enterprise.io",
    "role": "USER",
    "isEmailVerified": false
  }
}
```
* **Error Response (400 Bad Request)**:
```json
{
  "success": false,
  "error": "VAL_ERR_01",
  "message": "Password does not meet required complexity benchmarks. Must include at least 1 number and 1 symbol."
}
```

---

### User Login
* **Method**: `POST`
* **URL**: `/api/v1/auth/login`
* **Description**: Verifies credentials and serves HttpOnly cookies or response body properties containing ACCESS and REFRESH keys.
* **Authentication requirements**: None (Public)
* **Request Body**:
```json
{
  "email": "developer@enterprise.io",
  "password": "StrongSecurePassword30!"
}
```
* **Success Response (200 OK - Standard JSON)**:
```json
{
  "success": true,
  "message": "Authentication successful.",
  "accessToken": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6...",
  "refreshToken": "ref_8820f4_bc308"
}
```
*(Optionally establishes cookies automatically).*
* **Error Response (401 Unauthorized)**:
```json
{
  "success": false,
  "error": "AUTH_ERR_04",
  "message": "Invalid password or email. Account will lock after 3 further attempts."
}
```

---

### Password Reset Request
* **Method**: `POST`
* **URL**: `/api/v1/auth/forgot-password`
* **Description**: Generates an encrypted OTP token and transmits a reset link via background worker mail queues.
* **Authentication requirements**: None (Public)
* **Request Body**:
```json
{
  "email": "developer@enterprise.io"
}
```
* **Success Response (202 Accepted)**:
```json
{
  "success": true,
  "message": "If the email is indexed, reset commands will arrive within 2 minutes."
}
```

---

### Update Password
* **Method**: `POST`
* **URL**: `/api/v1/auth/reset-password`
* **Description**: Consumes the token payload and overrides security structures inside PostgreSQL.
* **Authentication requirements**: Token validation parameters
* **Request Body**:
```json
{
  "token": "tok_reset_3081e_4452a",
  "newPassword": "NewStrongerPassword40!"
}
```
* **Success Response (200 OK)**:
```json
{
  "success": true,
  "message": "Password changed successfully. All other device sessions revoked."
}
```

---

### List Connected Sessions
* **Method**: `GET`
* **URL**: `/api/v1/sessions`
* **Description**: Returns all connected physical equipment and locations currently authorized.
* **Authentication requirements**: Active Access Token (Bearer Header)
* **Success Response (200 OK)**:
```json
{
  "success": true,
  "data": [
    {
      "sessionId": "ses_4480fa_ff",
      "device": "MacBook Pro M3 (macOS Sonoma)",
      "ipAddress": "198.51.100.42",
      "location": "Paris, France",
      "isCurrent": true,
      "createdAt": "2026-06-20T03:00:00Z"
    },
    {
      "sessionId": "ses_9021da_ea",
      "device": "iPhone 15 Pro Max (iOS 17.4)",
      "ipAddress": "198.51.100.99",
      "location": "Marseille, France",
      "isCurrent": false,
      "createdAt": "2026-06-19T22:15:00Z"
    }
  ]
}
```
