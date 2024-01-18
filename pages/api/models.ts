import { ChatModels } from '@/models';
import type { NextApiRequest, NextApiResponse } from 'next';
export const config = {
  // runtime: 'edge',
  api: {
    bodyParser: {
      sizeLimit: '1mb',
    },
  },
  maxDuration: 5,
};

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const models = await ChatModels.findAll({ where: { enable: true } });
    const _models = models.map((x) => {
      return {
        modelId: x.modelId,
        name: x.name,
        type: x.type,
        systemPrompt: x.systemPrompt,
        maxLength: x.maxLength,
        tokenLimit: x.tokenLimit,
        fileSizeLimit: x.fileSizeLimit,
      };
    });
    return res.status(200).json(_models);
  } catch (error) {
    console.error(error);
    return res.status(500).end();
  }
};

export default handler;
