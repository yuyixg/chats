import { Model } from '@/types/model';

export const getEndpoint = (model: Model) => {
  if (model.name.includes('GPT')) {
    return 'api/chat';
  }

  if (model.name.includes('SPARK')) {
    return 'api/spark';
  }

  if (model.name.includes('ERNIE-Bot')) {
    return 'api/qianfan';
  }

  throw 'Not endpoint!';
};
