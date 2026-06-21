export const mockUsers = [
  {
    email: 'admin@example.com',
    password: 'DUMMY_PASSWORD',
    role: 'ADMIN',
    isVerified: true,
    id: 'usr-admin-88',
  },
  {
    email: 'user@example.com',
    password: 'DUMMY_PASSWORD',
    role: 'USER',
    isVerified: true,
    id: 'usr-user-11',
  },
];

export const mockLogs = [
  {
    id: '1',
    action: 'USER_REGISTERED',
    email: 'admin@example.com',
    ip: '127.0.0.1',
    time: '2026-06-20 02:24',
  },
  {
    id: '2',
    action: 'EMAIL_VERIFIED',
    email: 'admin@example.com',
    ip: '127.0.0.1',
    time: '2026-06-20 02:25',
  },
  {
    id: '3',
    action: 'USER_LOGIN_SUCCESS',
    email: 'admin@example.com',
    ip: '127.0.0.1',
    time: '2026-06-20 02:30',
  },
];
