import { Models } from '@/types/model';
import { QIANFAN_API_KEY } from '@/utils/app/const';

export const config = {
  runtime: 'edge',
};

const handler = async (req: Request): Promise<Response> => {
  try {
    let models = Models;
    if (!QIANFAN_API_KEY) {
      models = Models.filter((x) => !x.id.includes('ERNIE'));
    }
    return new Response(JSON.stringify(models), { status: 200 });
  } catch (error) {
    console.error(error);
    return new Response('Error', { status: 500 });
  }
};

export default handler;
