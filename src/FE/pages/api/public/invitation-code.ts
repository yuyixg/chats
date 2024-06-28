import { NextApiRequest } from 'next';

import { BadRequest } from '@/utils/error';

import { InvitationCodeManager } from '@/managers';
import { apiHandler } from '@/middleware/api-handler';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '1mb',
    },
  },
  maxDuration: 5,
};

async function handler(req: NextApiRequest) {
  if (req.method === 'POST') {
    const { invitationCode } = req.body;
    const code = await InvitationCodeManager.verifyCode(invitationCode);
    if (!code || code.count == 0) {
      throw new BadRequest('邀请码错误或过期');
    }
  }
}

export default apiHandler(handler);
