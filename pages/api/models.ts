import { Models } from '@/types/model';
import { QIANFAN_API_KEY } from '@/utils/app/const';

export const config = {
  runtime: 'edge',
};

const handler = async (req: Request): Promise<Response> => {
  try {
    let models = Models;
    if (!QIANFAN_API_KEY) {
      models = models.filter((x) => !x.name.includes('ERNIE'));
    }
    if (!process.env.OPENAI_API_KEY_VISION) {
      models = models.filter((x) => x.name !== 'GPT-4-VISION');
    }
    if (!process.env.OPENAI_API_KEY) {
      models = models.filter((x) => x.name !== 'GPT-4' && x.name !== 'GPT-3.5');
    }
    return new Response(JSON.stringify(models), { status: 200 });
  } catch (error) {
    console.error(error);
    return new Response('Error', { status: 500 });
  }
};

export default handler;
