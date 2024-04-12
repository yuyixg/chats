import { weChatAuth } from '@/utils/weChat';
import { apiHandler } from '@/middleware/api-handler';
import { ChatsApiRequest } from '@/types/next-api';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '1mb',
    },
  },
  maxDuration: 5,
};

const handler = async (req: ChatsApiRequest) => {
  if (req.method === 'GET') {
    const { code } = req.query as { code: string };
    const result = await weChatAuth(code);
    return result?.openid;
  }
};

export default apiHandler(handler);
