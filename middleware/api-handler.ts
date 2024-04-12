import { CreateRequestLogs, RequestLogsManager } from '@/managers/requestLogs';
import { UserRole } from '@/types/admin';
import { ChatsApiRequest, ChatsApiResponse } from '@/types/next-api';
import { Session } from '@/types/session';
import { BaseError, Unauthorized } from '@/utils/error';
import { getSession } from '@/utils/session';
import { replacePassword } from '@/utils/user';

const modelApis = [
  '/api/models/kimi',
  '/api/models/openai',
  '/api/models/lingyi',
  '/api/models/qianwen',
  '/api/models/qianfan',
  '/api/models/openai',
  '/api/models/spark',
];

const publicApis = [
  '/api/public/login',
  '/api/public/messages',
  '/api/public/notify',
];
const adminApis = '/api/admin/';

async function authMiddleware(req: ChatsApiRequest) {
  const requestUrl = req.url!;
  let session: Session | null = null;
  if (!publicApis.includes(requestUrl)) {
    session = await getSession(req.cookies);
    if (!session) {
      throw new Unauthorized();
    }
  }
  if (requestUrl.includes(adminApis)) {
    if (session?.role !== UserRole.admin) {
      throw new Unauthorized();
    }
  }
  return session!;
}

export function apiHandler(handler: any) {
  return async (req: ChatsApiRequest, res: ChatsApiResponse) => {
    const requestUrl = req.url!;
    let logs = {
      url: requestUrl,
      method: req.method!,
      statusCode: 200,
      request: replacePassword(JSON.stringify(req.body)),
    } as CreateRequestLogs;

    try {
      let session = await authMiddleware(req);
      req.session = session;
      logs.userId = session?.userId;
      const data = await handler(req, res);
      logs.response = JSON.stringify(data);
      if (modelApis.includes(req.url!)) {
        return res.write(Buffer.from(data || ''));
      }
      await RequestLogsManager.create(logs);
      return data ? res.status(200).json(data) : res.status(200).end();
    } catch (error) {
      logs.response = `${error}`;
      if (error instanceof BaseError && error.statusCode !== 500) {
        logs.statusCode = error.statusCode;
        res.status(error.statusCode).send(error.message);
      } else {
        logs.statusCode = 500;
        res.status(500).json({ message: 'An unexpected error occurred' });
      }
      console.log(logs);
      await RequestLogsManager.create(logs);
    }
  };
}
