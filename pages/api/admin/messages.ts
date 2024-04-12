import { ChatMessageManager, UserModelManager, UsersManager } from '@/managers';
import { UserRole } from '@/types/admin';
import { getSession } from '@/utils/session';
import { BadRequest, InternalServerError } from '@/utils/error';
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
      const { query, page, pageSize } = req.query as {
        query: string;
        page: string;
        pageSize: string;
      };
      const messages = await ChatMessageManager.findMessages(
        query,
        parseInt(page),
        parseInt(pageSize)
      );
      const rows = messages.rows.map((x: any) => {
        return {
          messageId: x.id,
          username: x.user.username,
          chatCount: x.chatCount,
          tokenCount: x.tokenCount,
          name: x.name,
          modelName: x.chatModel.name,
          isDeleted: x.isDeleted,
          isShared: x.isShared,
          totalPrice: x.totalPrice,
          createdAt: x.createdAt,
          updatedAt: x.updatedAt,
        };
      });
      return { rows, count: messages.count };
    } else if (req.method === 'PUT') {
      const { id, username, password, role } = req.body;
      let user = await UsersManager.findByUserId(id);
      if (!user) {
        throw new BadRequest('User not found');
      }
      const data = await UsersManager.updateUser({
        id,
        username,
        password: password ? password : user.password,
        role,
      });
      return data;
    } else {
      const { username, password, role } = req.body;
      let isFound = await UsersManager.findByAccount(username);
      if (isFound) {
        throw new BadRequest('User existed');
      }
      const user = await UsersManager.createUser({
        username,
        password,
        role,
      });
      await UserModelManager.createUserModel({
        userId: user.id!,
        models: '[]',
      });
      return user;
    }
  } catch (error: any) {
    throw new InternalServerError(
      JSON.stringify({ message: error?.message, stack: error?.stack })
    );
  }
};

export default apiHandler(handler);
