import type { NextApiRequest, NextApiResponse } from 'next';
import { RequestLogsManager } from '@/managers';
import { UserRole } from '@/types/admin';
import { getSession } from '@/utils/session';
import { InternalServerError } from '@/utils/error';
import { apiHandler } from '@/middleware/api-handler';
import { ChatsApiRequest, ChatsApiResponse } from '@/types/next-api';
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '1mb',
    },
  },
  maxDuration: 5,
};

const handler = async (req: ChatsApiRequest, res: ChatsApiResponse) => {
  try {
    if (req.method === 'GET') {
      const { id } = req.query as {
        id: string;
      };
      const requestLog = await RequestLogsManager.findByRequestLogsId(id);
      return requestLog;
    } else if (req.method === 'POST') {
      const requestLogs = await RequestLogsManager.findRequestLogs(req.body);
      const rows = requestLogs.rows.map((x) => {
        return {
          id: x.id,
          method: x.method,
          url: x.url,
          statusCode: x.statusCode,
          username: x.user?.username,
          request: x.request,
          response: x.response,
          createdAt: x.createdAt,
        };
      });
      return { rows, count: requestLogs.count };
    }
  } catch (error: any) {
    throw new InternalServerError(
      JSON.stringify({ message: error?.message, stack: error?.stack })
    );
  }
};

export default apiHandler(handler);
