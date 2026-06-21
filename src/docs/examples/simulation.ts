import { mockUsers, mockLogs } from './mockData';
import { apiExamples } from './apiExamples';

// Lightweight global simulation state for "Try it out" calls
export const simState = {
  registeredUsers: [...mockUsers] as any[],
  activeSessions: [] as string[],
  lastResetEmailSentTo: '',
  lastVerificationSentTo: '',
  currentUser: null as any | null,
  logs: [...mockLogs] as any[],
};

export const simulationHandlers = {
  register: (body: any) => {
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
        message: `Registration successful! Verification dispatch simulation initiated for ${emailLower} (Simulation OTP is "${apiExamples.token}").`,
        user: {
          id: newUser.id,
          email: newUser.email,
          role: newUser.role,
          isEmailVerified: false,
        },
      },
    };
  },

  'verify-email': (body: any) => {
    const { token } = body || {};
    if (!token || token.trim() !== apiExamples.token) {
      return {
        status: 400,
        body: {
          error: `Verification token is invalid or has expired. Hint: enter "${apiExamples.token}" in the simulator to verify.`,
        },
      };
    }

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

  login: (body: any) => {
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
          error: `Email verification needed. Please verify using OTP (${apiExamples.token}) first.`,
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

  logout: () => {
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

  refresh: () => {
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

  'forgot-password': (body: any) => {
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
        message: `Password recovery mail simulation triggered for "${emailLower}". Reset OTP simulation code is "${apiExamples.resetToken}".`,
      },
    };
  },

  'reset-password': (body: any) => {
    const { token, newPassword } = body || {};
    if (token !== apiExamples.resetToken) {
      return {
        status: 400,
        body: {
          error: `Reset token invalid or expired. Hint: Use "${apiExamples.resetToken}" in the simulator.`,
        },
      };
    }
    if (!newPassword || newPassword.length < 8) {
      return {
        status: 400,
        body: { error: 'Weak password criteria. Must contain at least 8 characters.' },
      };
    }

    const targetEmail = simState.lastResetEmailSentTo || 'admin@example.com';
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

  me: () => {
    if (!simState.currentUser) {
      return {
        status: 401,
        body: {
          error: 'Access token expired or unauthorized. Please authenticate through /login first.',
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

  'audit-logs': () => {
    if (!simState.currentUser) {
      return {
        status: 401,
        body: { error: 'Authentication required. Please Login as admin@example.com first.' },
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
};
