import { ChatModelManager } from '@/managers';
import type { NextApiRequest, NextApiResponse } from 'next';
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '1mb',
    },
  },
  maxDuration: 5,
};

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const { enable } = req.body;
    const models = await ChatModelManager.findEnableModels(enable);
    const data = models.map((x) => {
      return {
        modelId: x.id,
        name: x.name,
        type: x.type,
        systemPrompt: x.systemPrompt,
        maxLength: x.maxLength,
        tokenLimit: x.tokenLimit,
        imgConfig: x.imgConfig,
      };
    });
    return res.status(200).json(data);
  } catch (error) {
    console.error(error);
    return res.status(500).end();
  }
};

export default handler;
