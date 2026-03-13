/**
 * Base API Client
 * Wraps native fetch to provide consistent error handling, base URLs, and logging.
 */

// Custom error class for API errors
export class ApiError extends Error {
  public status: number;
  public data?: unknown;

  constructor(status: number, message: string, data?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

export async function apiClient<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = endpoint.startsWith('http') ? endpoint : `/api${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
  
  const startTime = Date.now();
  const method = options.method || 'GET';

  try {
    // Log request (only in development or specific environments if needed)
    if (process.env.NODE_ENV === 'development') {
      console.log(`[API REQUEST] ${method} ${url}`, options.body ? JSON.parse(options.body as string) : '');
    }

    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    const duration = Date.now() - startTime;

    // Log response
    if (process.env.NODE_ENV === 'development') {
      console.log(`[API RESPONSE] ${method} ${url} - Status: ${response.status} (${duration}ms)`);
    }

    // Try to parse JSON, fallback to text if it fails
    let data;
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    if (!response.ok) {
      // Log error explicitly
      console.error(`[API ERROR] ${method} ${url} - Status: ${response.status}`, data);
      
      const errorMessage = data?.error || data?.message || `API Error: ${response.statusText}`;
      throw new ApiError(response.status, errorMessage, data);
    }

    return data as T;
  } catch (error) {
    const duration = Date.now() - startTime;
    // Log unexpected errors (e.g., network failures)
    if (error instanceof ApiError) {
      // Already logged above
      throw error;
    }
    
    console.error(`[API NETWORK ERROR] ${method} ${url} (${duration}ms)`, error);
    throw error;
  }
}
