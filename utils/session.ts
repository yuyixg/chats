import { SessionsManager } from '@/managers';
function getCookieSessionId(
  cookies:
    | Partial<{
        [key: string]: string;
      }>
    | string
) {
  if (typeof cookies === 'object') {
    return cookies['sessionId'] || null;
  }
  var name = 'sessionId' + '=';
  var decodedCookie = decodeURIComponent(cookies);
  var ca = decodedCookie.split(';');
  for (var i = 0; i < ca.length; i++) {
    var c = ca[i];
    while (c.charAt(0) == ' ') {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    }
  }
  return null;
}
export async function getSession(
  cookies:
    | Partial<{
        [key: string]: string;
      }>
    | string
) {
  const sessionId = getCookieSessionId(cookies);
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
