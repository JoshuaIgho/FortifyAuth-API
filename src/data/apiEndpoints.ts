import { ApiEndpoint } from '../types';

export const apiEndpointsList: ApiEndpoint[] = [
  {
    id: 'register',
    method: 'POST',
    path: '/api/v1/auth/register',
    summary: 'Register a new user account',
    description:
      'Creates a new user account in an unverified state. Encrypts the password using Argon2id and dispatches an email verification token.',
    tags: ['Authentication'],
    requestBody: {
      contentType: 'application/json',
      schema: {
        email: {
          type: 'string',
          required: true,
          description: 'Valid email address. Must be unique.',
          example: '<EMAIL>',
        },
        password: {
          type: 'string',
          required: true,
          description:
            'Minimum 8 characters, 1 lowercase, 1 uppercase, 1 digit, 1 special character.',
          example: '<PASSWORD>',
        },
      },
    },
    responses: [
      {
        status: 201,
        description: 'User successfully created, verification email queued.',
        example: {
          success: true,
          message:
            'Registration successful! Please check your inbox for a registration verification mail.',
          user: {
            id: '<USER_ID>',
            email: '<EMAIL>',
            role: 'USER',
            isEmailVerified: false,
          },
        },
      },
      {
        status: 400,
        description: 'Input validation failed or password strength insufficient.',
        example: {
          error: 'Input validation failed.',
          details: [
            {
              field: 'password',
              message:
                'Password must be at least 8 characters long and contain standard numeric, upper-case and special characters.',
            },
          ],
        },
      },
      {
        status: 409,
        description: 'Email is already taken.',
        example: {
          error: 'An account with this email address already exists.',
        },
      },
    ],
  },
  {
    id: 'verify-email',
    method: 'POST',
    path: '/api/v1/auth/verify-email',
    summary: 'Verify email with OTP/token',
    description:
      'Confirms registration by validating the temporary opaque verification token sent to the user email.',
    tags: ['Authentication'],
    requestBody: {
      contentType: 'application/json',
      schema: {
        token: {
          type: 'string',
          required: true,
          description: 'Numerical verification OTP code sent by email.',
          example: '<TOKEN>',
        },
      },
    },
    responses: [
      {
        status: 200,
        description: 'Email successfully verified.',
        example: { success: true, message: 'Email verified successfully! You can now login.' },
      },
      {
        status: 400,
        description: 'Invalid token or token expired.',
        example: { error: 'Verification token is invalid or has expired.' },
      },
    ],
  },
  {
    id: 'login',
    method: 'POST',
    path: '/api/v1/auth/login',
    summary: 'Login authenticating user credentials',
    description:
      'Accepts username and password. On success, sets access token in JSON response and secure refresh token inside cookies.',
    tags: ['Authentication'],
    requestBody: {
      contentType: 'application/json',
      schema: {
        email: {
          type: 'string',
          required: true,
          description: 'Register account email address.',
          example: '<EMAIL>',
        },
        password: {
          type: 'string',
          required: true,
          description: 'Registration password sequence.',
          example: '<PASSWORD>',
        },
      },
    },
    responses: [
      {
        status: 200,
        description: 'Login successful. Returns access token, sets Refresh Token in Cookie.',
        example: {
          success: true,
          accessToken: '<YOUR_ACCESS_TOKEN>',
          expiresInSeconds: 900,
          user: { id: '<USER_ID>', email: '<EMAIL>', role: 'ADMIN' },
        },
      },
      {
        status: 401,
        description: 'Invalid identifiers or unverified account.',
        example: { error: 'Invalid email or password combination.' },
      },
    ],
  },
  {
    id: 'logout',
    method: 'POST',
    path: '/api/v1/auth/logout',
    summary: 'Logout current user session',
    description:
      'Clears the secure, httpOnly refresh token cookie and blacklists the current JWT access token JTI until its original expiration.',
    tags: ['Authentication'],
    responses: [
      {
        status: 200,
        description: 'Successfully logged out.',
        example: {
          success: true,
          message: 'Logged out sessions successfully and cleared co-occurring auth credentials.',
        },
      },
    ],
  },
  {
    id: 'refresh',
    method: 'POST',
    path: '/api/v1/auth/refresh',
    summary: 'Rotate authentication token keys',
    description:
      'Accepts previous valid refresh token from cookies, rotates it with an elegant OTP breach detection, and generates a new Access/Refresh token pair.',
    tags: ['Authentication'],
    responses: [
      {
        status: 200,
        description: 'Refreshed access tokens.',
        example: {
          success: true,
          accessToken: '<YOUR_ROTATED_ACCESS_TOKEN>',
          expiresInSeconds: 900,
        },
      },
      {
        status: 401,
        description: 'Missing/expired refresh token, or security breach detected.',
        example: { error: 'Session expired or refresh token is invalid.', code: 'INVALID_REFRESH' },
      },
    ],
  },
  {
    id: 'forgot-password',
    method: 'POST',
    path: '/api/v1/auth/forgot-password',
    summary: 'Request email recovery token link',
    description:
      'Saves a brief 1-hour expiration reset token in the DB and dispatches a recovery hyperlink mail to valid registered users.',
    tags: ['Password Recovery'],
    requestBody: {
      contentType: 'application/json',
      schema: {
        email: {
          type: 'string',
          required: true,
          description: 'The registered user email address.',
          example: '<EMAIL>',
        },
      },
    },
    responses: [
      {
        status: 200,
        description:
          'Dispatch triggered. Unconditionally returns positive response for security protection against account enumeration.',
        example: {
          success: true,
          message:
            'If an account exists with this email, a recovery pass-reset email has been dispatched.',
        },
      },
    ],
  },
  {
    id: 'reset-password',
    method: 'POST',
    path: '/api/v1/auth/reset-password',
    summary: 'Reset password utilizing token',
    description:
      'Validates temporary password reset token and overwrites previous password entries in DB with an Argon2id hash.',
    tags: ['Password Recovery'],
    requestBody: {
      contentType: 'application/json',
      schema: {
        token: {
          type: 'string',
          required: true,
          description: 'The OTP code/token sent to email.',
          example: '<TOKEN>',
        },
        newPassword: {
          type: 'string',
          required: true,
          description: 'New password requirements compliance.',
          example: '<PASSWORD>',
        },
      },
    },
    responses: [
      {
        status: 200,
        description: 'Password successfully updated.',
        example: {
          success: true,
          message: 'Password updated successfully! You can login with your new credentials.',
        },
      },
      {
        status: 400,
        description: 'Invalid token or weak password metrics.',
        example: { error: 'Reset token is invalid or expired.' },
      },
    ],
  },
  {
    id: 'me',
    method: 'GET',
    path: '/api/v1/users/me',
    summary: 'Retrieve authenticated profile',
    description:
      'Requires valid authorization JWT Bearer token. Returns profile information for the authenticated user.',
    tags: ['Users Dashboard'],
    requestHeaders: [
      {
        name: 'Authorization',
        type: 'string',
        required: true,
        description: 'Bearer access token format.',
        defaultValue: 'Bearer <YOUR_ACCESS_TOKEN>',
      },
    ],
    responses: [
      {
        status: 200,
        description: 'User details fetched successfully.',
        example: {
          id: '<USER_ID>',
          email: '<EMAIL>',
          role: 'ADMIN',
          isEmailVerified: true,
          createdAt: '2026-06-20T02:00:00Z',
        },
      },
      {
        status: 401,
        description: 'Invalid or missing Bearer token.',
        example: { error: 'Authentication token is required.' },
      },
    ],
  },
  {
    id: 'audit-logs',
    method: 'GET',
    path: '/api/v1/admin/audit-logs',
    summary: 'Query system security audit logs',
    description:
      'Requires ADMIN role. Returns chronological database log streams tracing all state changes.',
    tags: ['Admin Utilities'],
    requestHeaders: [
      {
        name: 'Authorization',
        type: 'string',
        required: true,
        description: 'Bearer JWT access token with ADMIN privileges.',
      },
    ],
    responses: [
      {
        status: 200,
        description: 'List of audit records.',
        example: [
          {
            id: '1',
            action: 'USER_LOGIN_SUCCESS',
            userId: '<USER_ID>',
            email: '<EMAIL>',
            ipAddress: '127.0.0.1',
            userAgent: 'Chrome/114.0',
            createdAt: '2026-06-20T02:30:00Z',
          },
        ],
      },
      {
        status: 403,
        description: 'Access forbidden for non-admins.',
        example: { error: 'Access forbidden. Insufficient clearance.' },
      },
    ],
  },
];
