import { ChatsError } from '@/utils/error';
import { NextApiRequest, NextApiResponse } from 'next';

const modelApis = [
  '/api/models/kimi',
  '/api/models/openai',
  '/api/models/lingyi',
  '/api/models/qianwen',
  '/api/models/qianfan',
  '/api/models/openai',
  '/api/models/spark',
];

export function apiHandler(handler: any) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    try {
      const data = await handler(req, res);
      if (modelApis.includes(req.url!)) {
        return res.write(Buffer.from(data || ''));
      }
      return data ? res.status(200).json(data) : res.status(200).end();
    } catch (error) {
      console.log('ERROR \n', error);
      if (error instanceof ChatsError && error.statusCode !== 500) {
        res.status(error.statusCode).send(error.message);
      } else {
        res.status(500).json({ message: 'An unexpected error occurred' });
      }
    }
  };
}
