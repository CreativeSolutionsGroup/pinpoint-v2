// Session ID management for API routes
import { NextRequest } from 'next/server';
import { cookies } from 'next/headers';

const SESSION_COOKIE_NAME = 'diagram_session_id';

// Generate a unique session ID
function generateSessionId(): string {
  return `sess_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
}

// Get or create session ID from request
export async function getSessionId(request: NextRequest): Promise<string> {
  const cookieStore = await cookies();
  let sessionId = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  
  if (!sessionId) {
    sessionId = generateSessionId();
    console.log(`[Session] Created new session: ${sessionId}`);
  }
  
  return sessionId;
}

// Create response headers with session cookie
export function createSessionHeaders(sessionId: string): Headers {
  const headers = new Headers();
  headers.set(
    'Set-Cookie',
    `${SESSION_COOKIE_NAME}=${sessionId}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${30 * 60}` // 30 minutes
  );
  return headers;
}
