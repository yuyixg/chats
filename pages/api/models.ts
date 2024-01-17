import { ChatModels } from '@/models';
import type { NextApiRequest, NextApiResponse } from 'next';
export const config = {
  // runtime: 'edge',
  api: {
    bodyParser: {
      sizeLimit: '1mb',
    },
  },
  // Specifies the maximum allowed duration for this function to execute (in seconds)
  maxDuration: 5,
};

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const models = await ChatModels.findAll({ where: { enable: true } });
    // if (!QIANFAN_API_KEY) {
    //   models = models.filter((x) => !x.name.includes('ERNIE'));
    // }
    // if (!process.env.OPENAI_API_KEY_VISION) {
    //   models = models.filter((x) => x.name.toUpperCase() !== 'GPT-4-VISION');
    // }
    // if (!process.env.OPENAI_API_KEY) {
    //   models = models.filter(
    //     (x) =>
    //       x.name.toUpperCase() !== 'GPT-4' && x.name.toUpperCase() !== 'GPT-3.5'
    //   );
    // }
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
    return res.status(500).send('error');
  }
};

export default handler;
