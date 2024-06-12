import { BadRequest } from '@/utils/error';

import { ChatsApiRequest } from '@/types/next-api';

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

const handler = async (req: ChatsApiRequest) => {
  if (req.method === 'GET') {
    const codes = await InvitationCodeManager.find();
    return codes.map((x) => ({
      id: x.id,
      value: x.value,
      count: x.count,
      username: x.user?.username,
    }));
  } else if (req.method === 'PUT') {
    const { id, count } = req.body;
    const data = await InvitationCodeManager.updateCodeCount(id, count);
    return data;
  } else if (req.method === 'POST') {
    const { userId } = req.session;
    const { value, count } = req.body;
    const code = await InvitationCodeManager.findByCode(value);
    if (code) {
      throw new BadRequest('邀请码已存在');
    }
    const data = await InvitationCodeManager.create({
      value,
      count,
      createUserId: userId,
    });
    return data;
  } else if (req.method === 'DELETE') {
    const { id } = req.query as { id: string };
    const code = await InvitationCodeManager.findById(id);
    if (code) {
      await InvitationCodeManager.delete(id);
    } else throw new BadRequest('Invitation code is not Found!');
  }
};

export default apiHandler(handler);
