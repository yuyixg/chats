import { apiHandler } from '@/middleware/api-handler';
import { ChatsApiRequest } from '@/types/next-api';
import { PromptsManager } from '@/managers';
import { PromptType } from '@/types/prompt';
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '1mb',
    },
  },
  maxDuration: 5,
};

const handler = async (req: ChatsApiRequest) => {
  const { userId } = req.session;
  if (req.method === 'GET') {
    const prompts = await PromptsManager.findUserPrompts(userId);

    return prompts.map((p) => {
      return {
        id: p.id,
        name: p.name,
        content: p.content,
        description: p.description,
      };
    });
  } else if (req.method === 'POST') {
    const { name, content, description } = req.body;
    const prompt = await PromptsManager.create({
      name,
      content,
      description,
      type: PromptType.Private,
      createUserId: userId,
    });
    return {
      id: prompt.id,
      name: prompt.name,
      content: prompt.content,
      description: prompt.description,
    };
  } else if (req.method === 'PUT') {
    const { id, name, content, description } = req.body;
    const prompt = await PromptsManager.update({
      id,
      name,
      content,
      description,
      type: PromptType.Private,
      createUserId: userId,
    });
    return {
      id: prompt.id,
      name: prompt.name,
      content: prompt.content,
      description: prompt.description,
    };
  } else if (req.method === 'DELETE') {
    const { id } = req.query as { id: string };
    return await PromptsManager.delete(id, userId);
  }
};

export default apiHandler(handler);
