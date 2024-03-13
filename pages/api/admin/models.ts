import { ChatModelManager } from '@/managers';
import type { NextApiRequest, NextApiResponse } from 'next';
import { UserRole } from '@/types/admin';
import { getSession } from '@/utils/session';
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '1mb',
    },
  },
  maxDuration: 5,
};

// -> 1234567890 -> 12345***90
const addAsterisk = (value?: string, separator = '*') => {
  if (!value) {
    return null;
  }
  return (
    value.substring(0, 5) +
    value
      .substring(5, value.length - 2)
      .split('')
      .map((x) => separator)
      .join('') +
    value.substring(value.length - 2, value.length)
  );
};

const checkKey = (
  originValue: string | undefined,
  currentValue: string | undefined
) => {
  if (originValue && addAsterisk(originValue) === currentValue) {
    return originValue;
  }
  return currentValue;
};

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const session = await getSession(req.cookies);
  if (!session) {
    return res.status(401).end();
  }
  const role = session.role;
  if (role !== UserRole.admin) {
    res.status(401).end();
    return;
  }

  try {
    if (req.method === 'PUT') {
      const {
        modelId,
        name,
        enable,
        modelConfig: modelConfigJson,
        apiConfig: apiConfigJson,
        imgConfig: imgConfigJson,
      } = req.body;
      const model = await ChatModelManager.findModelById(modelId);
      if (!model) {
        res.status(400).end('Model is not Found!');
        return;
      }

      let modelConfig = JSON.parse(modelConfigJson);
      let apiConfig = JSON.parse(apiConfigJson);
      let imgConfig = JSON.parse(imgConfigJson);

      apiConfig.appId = checkKey(model?.apiConfig.apiKey, apiConfig.appId);
      apiConfig.apiKey = checkKey(model?.apiConfig.apiKey, apiConfig.apiKey);
      apiConfig.secret = checkKey(model?.apiConfig.secret, apiConfig.secret);

      const data = await ChatModelManager.updateModel(
        modelId,
        name,
        enable,
        modelConfig,
        apiConfig,
        imgConfig
      );
      return res.status(200).send(data);
    } else {
      const { all } = req.body;
      const models = await ChatModelManager.findEnableModels(all);
      const data = models.map((x) => {
        return {
          rank: x.rank,
          modelId: x.id,
          modelVersion: x.modelVersion,
          name: x.name,
          type: x.type,
          enable: x.enable,
          imgConfig: JSON.stringify(x.imgConfig || {}, null, 2),
          modelConfig: JSON.stringify(x.modelConfig || {}, null, 2),
          apiConfig: JSON.stringify(
            {
              appId: addAsterisk(x.apiConfig?.appId),
              apiKey: addAsterisk(x.apiConfig?.apiKey),
              secret: addAsterisk(x.apiConfig?.secret),
              version: x.apiConfig?.version,
              host: x.apiConfig.host,
              organization: x.apiConfig?.organization,
              type: x.apiConfig?.type,
            },
            null,
            2
          ),
        };
      });
      return res.status(200).json(data);
    }
  } catch (error) {
    console.error(error);
    return res.status(500).end();
  }
};

export default handler;
