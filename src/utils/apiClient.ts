/**
/**
 * Lightweight API Client for FortifyAuth Frontend Application
 */

const BASE_URL = '';

export interface ApiResponse<T = any> {
  status: 'success' | 'error';
  message?: string;
  data?: T;
  error?: string;
}

export function getStoredToken(): string | null {
  return localStorage.getItem('fortify_access_token');
}

export function setStoredToken(token: string | null): void {
  if (token) {
    localStorage.setItem('fortify_access_token', token);
  } else {
    localStorage.removeItem('fortify_access_token');
  }
}

export async function requestApi<T = any>(
  endpoint: string,
  options: {
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
    body?: any;
    token?: string | null;
    headers?: Record<string, string>;
  } = {},
): Promise<{ status: number; data: ApiResponse<T> }> {
  const method = options.method || 'GET';
  const token = options.token !== undefined ? options.token : getStoredToken();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const reqConfig: RequestInit = {
    method,
    headers,
  };

  if (options.body && method !== 'GET') {
    reqConfig.body = typeof options.body === 'string' ? options.body : JSON.stringify(options.body);
  }

  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, reqConfig);
    const contentType = response.headers.get('content-type');
    let data: ApiResponse<T>;

    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      const text = await response.text();
      data = {
        status: response.ok ? 'success' : 'error',
        message: text,
      };
    }

    return {
      status: response.status,
      data,
    };
  } catch (err: any) {
    return {
      status: 500,
      data: {
        status: 'error',
        message: err.message || 'Network request failed',
      },
    };
  }
}
