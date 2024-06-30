import { SessionsManager } from '@/managers';
import { IncomingHttpHeaders } from 'http';

function getHeaderSessionId(headers: IncomingHttpHeaders) {
  return headers?.authorization?.substring(7) || '';
}

export async function getSession(headers: IncomingHttpHeaders) {
  const sessionId = getHeaderSessionId(headers);
  if (!sessionId) {
    return null;
  }

  const session = await SessionsManager.findSession(sessionId);

  if (session) {
    const {
      user: { id, username, role, provider, sub },
    } = session;
    return { userId: id, username, role, provider, sub };
  }
  return null;
}
