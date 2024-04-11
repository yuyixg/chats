import { CreateAuditLogs } from '@/managers/auditLogs';
import { BaseError } from '@/utils/error';
import { replacePassword } from '@/utils/user';
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
    let logs = {
      url: req.url!,
      method: req.method!,
      statusCode: 200,
      request: replacePassword(JSON.stringify(req.body)),
    } as CreateAuditLogs;
    try {
      const data = await handler(req, res);
      logs.response = JSON.stringify(data);
      if (modelApis.includes(req.url!)) {
        return res.write(Buffer.from(data || ''));
      }
      console.log(logs);
      return data ? res.status(200).json(data) : res.status(200).end();
    } catch (error) {
      logs.error = `${error}`;
      if (error instanceof BaseError && error.statusCode !== 500) {
        res.status(error.statusCode).send(error.message);
      } else {
        res.status(500).json({ message: 'An unexpected error occurred' });
      }
      console.log(logs);
    }
  };
}
