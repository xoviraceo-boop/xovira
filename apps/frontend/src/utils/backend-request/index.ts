/**
 * Get authentication token for backend requests
 * Uses the token endpoint to get a valid JWT
 */
export async function fetchAuthToken(session?: any): Promise<string | null> {
  try {
    if (!session?.user?.id) {
      return null;
    }

    // Fetch token from API endpoint (server-side only)
    if (typeof window === 'undefined') {
      const jwt = await import('jsonwebtoken');
      const secret = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET;
      
      if (!secret) {
        console.warn('No AUTH_SECRET found, backend requests may fail');
        return null;
      }

      return jwt.default.sign(
        { 
          id: session.user.id,
          sub: session.user.id,
          email: session.user.email,
          name: session.user.name,
        },
        secret,
        { expiresIn: '1h' }
      );
    } else {
      // Client-side: fetch from API
      const response = await fetch('/api/auth/token', { credentials: 'include' });
      if (!response.ok) throw new Error('Unable to fetch auth token');
      if (response.ok) {
        const data = await response.json();
        return data.token;
      }
      return null;
    }
  } catch (error) {
    console.error('Error generating backend auth token:', error);
    return null;
  }
}

/**
 * Make authenticated request to backend
 */
export async function sendBackendRequest(
  endpoint: string,
  options: RequestInit = {},
  session?: any
): Promise<Response> {
  const url = `${process.env.NEXT_PUBLIC_SERVER_URL || process.env.SERVER_URL || 'http://localhost:3001'}${endpoint}`;
  const token = session ? await fetchAuthToken(session) : null;
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
    ...options.headers,
  };
  return fetch(url, {
    ...options,
    headers,
  });
}


