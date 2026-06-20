import { ApiEndpoint } from '../types';

// Let's hold a lightweight global simulation state so that "Try it out" calls feels real!
export const simState = {
  registeredUsers: [
    {
      email: 'admin@fortify.com',
      password: 'Password123!',
      role: 'ADMIN',
      isVerified: true,
      id: 'usr-admin-88',
    },
    {
      email: 'user@fortify.com',
      password: 'Password123!',
      role: 'USER',
      isVerified: true,
      id: 'usr-user-11',
    },
  ] as any[],
  activeSessions: [] as string[],
  lastResetEmailSentTo: '',
  lastVerificationSentTo: '',
  currentUser: null as any | null,
  logs: [
    {
      id: '1',
      action: 'USER_REGISTERED',
      email: 'admin@fortify.com',
      ip: '192.168.1.1',
      time: '2026-06-20 02:24',
    },
    {
      id: '2',
      action: 'EMAIL_VERIFIED',
      email: 'admin@fortify.com',
      ip: '192.168.1.1',
      time: '2026-06-20 02:25',
    },
    {
      id: '3',
      action: 'USER_LOGIN_SUCCESS',
      email: 'admin@fortify.com',
      ip: '192.168.1.1',
      time: '2026-06-20 02:30',
    },
  ] as any[],
};

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
          example: 'newuser@example.com',
        },
        password: {
          type: 'string',
          required: true,
          description:
            'Minimum 8 characters, 1 lowercase, 1 uppercase, 1 digit, 1 special character.',
          example: 'SecureP@ss123',
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
            id: 'fa993e11-e8d1-4171-872a-4a87268d83c2',
            email: 'newuser@example.com',
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
    simulationHandler: (body: any) => {
      const { email, password } = body || {};
      if (!email || !email.includes('@')) {
        return {
          status: 400,
          body: {
            error: 'Input validation failed.',
            details: [{ field: 'email', message: 'Must be a valid email structure.' }],
          },
        };
      }
      if (!password || password.length < 8) {
        return {
          status: 400,
          body: {
            error: 'Input validation failed.',
            details: [{ field: 'password', message: 'Password must be at least 8 characters.' }],
          },
        };
      }

      const emailLower = email.toLowerCase().trim();
      const userExists = simState.registeredUsers.some((u) => u.email === emailLower);
      if (userExists) {
        return {
          status: 409,
          body: { error: 'An account with this email address already exists.' },
        };
      }

      const newUser = {
        id: `usr-${Math.floor(Math.random() * 90000) + 10000}`,
        email: emailLower,
        password: password,
        role: 'USER',
        isVerified: false,
      };
      simState.registeredUsers.push(newUser);
      simState.lastVerificationSentTo = emailLower;

      // Add audit log
      simState.logs.unshift({
        id: `log-${Date.now()}`,
        action: 'USER_REGISTERED',
        email: emailLower,
        ip: '127.0.0.1',
        time: new Date().toISOString().replace('T', ' ').slice(0, 16),
      });

      return {
        status: 201,
        body: {
          success: true,
          message:
            'Registration successful! Verification dispatch simulation initiated for ' +
            emailLower +
            ' (Simulation OTP is "123456").',
          user: {
            id: newUser.id,
            email: newUser.email,
            role: newUser.role,
            isEmailVerified: false,
          },
        },
      };
    },
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
          example: '123456',
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
    simulationHandler: (body: any) => {
      const { token } = body || {};
      if (!token || token.trim() !== '123456') {
        return {
          status: 400,
          body: {
            error:
              'Verification token is invalid or has expired. Hint: enter "123456" in the simulator to verify.',
          },
        };
      }

      // Find last unverified user and verify them
      const unverifiedUser = simState.registeredUsers.find((u) => !u.isVerified);
      if (unverifiedUser) {
        unverifiedUser.isVerified = true;
        simState.logs.unshift({
          id: `log-${Date.now()}`,
          action: 'EMAIL_VERIFIED',
          email: unverifiedUser.email,
          ip: '127.0.0.1',
          time: new Date().toISOString().replace('T', ' ').slice(0, 16),
        });
        return {
          status: 200,
          body: {
            success: true,
            message: `Email verified successfully for ${unverifiedUser.email}! You can now login.`,
          },
        };
      }

      return {
        status: 200,
        body: {
          success: true,
          message: 'Token verified! (No unverified user in state, but token was accepted)',
        },
      };
    },
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
          example: 'admin@fortify.com',
        },
        password: {
          type: 'string',
          required: true,
          description: 'Registration password sequence.',
          example: 'Password123!',
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
          user: { id: 'usr-admin-88', email: 'admin@fortify.com', role: 'ADMIN' },
        },
      },
      {
        status: 401,
        description: 'Invalid identifiers or unverified account.',
        example: { error: 'Invalid email or password combination.' },
      },
    ],
    simulationHandler: (body: any) => {
      const { email, password } = body || {};
      if (!email || !password) {
        return {
          status: 401,
          body: { error: 'Invalid email or password combination. Both are required.' },
        };
      }

      const emailLower = email.toLowerCase().trim();
      const found = simState.registeredUsers.find((u) => u.email === emailLower);

      if (!found || found.password !== password) {
        simState.logs.unshift({
          id: `log-${Date.now()}`,
          action: 'USER_LOGIN_FAILED',
          email: emailLower,
          ip: '127.0.0.1',
          time: new Date().toISOString().replace('T', ' ').slice(0, 16),
        });
        return { status: 401, body: { error: 'Invalid email or password combination.' } };
      }

      if (!found.isVerified) {
        return {
          status: 401,
          body: {
            error: 'Email verification needed. Please verify using OTP (123456) first.',
            code: 'UNVERIFIED_EMAIL',
          },
        };
      }

      simState.currentUser = found;
      simState.activeSessions.push(found.id);

      simState.logs.unshift({
        id: `log-${Date.now()}`,
        action: 'USER_LOGIN_SUCCESS',
        email: found.email,
        ip: '127.0.0.1',
        time: new Date().toISOString().replace('T', ' ').slice(0, 16),
      });

      return {
        status: 200,
        body: {
          success: true,
          message:
            'Authenticated successfully! Co-occurring Refresh Token cookie set in document environment.',
          accessToken: '<YOUR_ACCESS_TOKEN>',
          expiresInSeconds: 900,
          user: { id: found.id, email: found.email, role: found.role },
        },
      };
    },
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
    simulationHandler: () => {
      const email = simState.currentUser ? simState.currentUser.email : 'anonymous';
      if (simState.currentUser) {
        simState.logs.unshift({
          id: `log-${Date.now()}`,
          action: 'USER_LOGOUT',
          email: email,
          ip: '127.0.0.1',
          time: new Date().toISOString().replace('T', ' ').slice(0, 16),
        });
      }
      simState.currentUser = null;
      return {
        status: 200,
        body: {
          success: true,
          message: 'Logged out sessions successfully and cleared co-occurring auth cookie.',
        },
      };
    },
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
    simulationHandler: () => {
      if (!simState.currentUser) {
        return {
          status: 401,
          body: {
            error:
              'Unauthorized Session expired or refresh token is invalid in cookies. Make sure you Login first.',
            code: 'INVALID_REFRESH',
          },
        };
      }
      return {
        status: 200,
        body: {
          success: true,
          message: 'Refresh token rotated successfully with state protection mechanisms.',
          accessToken: '<YOUR_ROTATED_ACCESS_TOKEN>',
          expiresInSeconds: 900,
        },
      };
    },
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
          example: 'admin@fortify.com',
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
    simulationHandler: (body: any) => {
      const { email } = body || {};
      if (!email || !email.includes('@')) {
        return { status: 400, body: { error: 'Email parameter invalid.' } };
      }

      const emailLower = email.toLowerCase().trim();
      simState.lastResetEmailSentTo = emailLower;

      simState.logs.unshift({
        id: `log-${Date.now()}`,
        action: 'PASSWORD_RESET_REQUEST',
        email: emailLower,
        ip: '127.0.0.1',
        time: new Date().toISOString().replace('T', ' ').slice(0, 16),
      });

      return {
        status: 200,
        body: {
          success: true,
          message: `Password recovery mail simulation triggered for "${emailLower}". Reset OTP simulation code is "RESET99".`,
        },
      };
    },
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
          example: 'RESET99',
        },
        newPassword: {
          type: 'string',
          required: true,
          description: 'New password requirements compliance.',
          example: 'BrandNewP@ss789!',
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
    simulationHandler: (body: any) => {
      const { token, newPassword } = body || {};
      if (token !== 'RESET99') {
        return {
          status: 400,
          body: { error: 'Reset token invalid or expired. Hint: Use "RESET99" in the simulator.' },
        };
      }
      if (!newPassword || newPassword.length < 8) {
        return {
          status: 400,
          body: { error: 'Weak password criteria. Must contain at least 8 characters.' },
        };
      }

      // Update password of last request reset user
      const targetEmail = simState.lastResetEmailSentTo || 'admin@fortify.com';
      const userToReset = simState.registeredUsers.find((u) => u.email === targetEmail);

      if (userToReset) {
        userToReset.password = newPassword;
        simState.logs.unshift({
          id: `log-${Date.now()}`,
          action: 'PASSWORD_RESET_SUCCESS',
          email: targetEmail,
          ip: '127.0.0.1',
          time: new Date().toISOString().replace('T', ' ').slice(0, 16),
        });
        return {
          status: 200,
          body: {
            success: true,
            message: `Password reset successfully for "${targetEmail}"! You can now login using "${newPassword}".`,
          },
        };
      }

      return {
        status: 200,
        body: { success: true, message: 'Password reset simulation processed!' },
      };
    },
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
          id: 'usr-admin-88',
          email: 'admin@fortify.com',
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
    simulationHandler: (body: any, headers?: any) => {
      if (!simState.currentUser) {
        return {
          status: 401,
          body: {
            error:
              'Access token expired or unauthorized. Please authenticate through /login first.',
          },
        };
      }
      return {
        status: 200,
        body: {
          id: simState.currentUser.id,
          email: simState.currentUser.email,
          role: simState.currentUser.role,
          isEmailVerified: simState.currentUser.isVerified,
          createdAt: '2026-06-20T02:00:00Z',
          scope_privileges:
            simState.currentUser.role === 'ADMIN'
              ? ['read:all', 'write:all', 'audit:read']
              : ['read:own', 'write:own'],
        },
      };
    },
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
            userId: 'usr-8822',
            email: 'admin@fortify.com',
            ipAddress: '192.168.1.1',
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
    simulationHandler: () => {
      if (!simState.currentUser) {
        return {
          status: 401,
          body: { error: 'Authentication required. Please Login as admin@fortify.com first.' },
        };
      }
      if (simState.currentUser.role !== 'ADMIN') {
        return {
          status: 403,
          body: {
            error:
              'Access forbidden. Only administrators with role "ADMIN" are permitted to view logs.',
          },
        };
      }

      return {
        status: 200,
        body: simState.logs,
      };
    },
  },
];
