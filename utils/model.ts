import { UserModel } from '@/dbs/userModels';
import { ChatModelConfig, ModelConfigType, ModelVersions } from '@/types/model';
import { ModelDefaultTemplates } from '@/types/template';

export function verifyModel(model: UserModel, config: ChatModelConfig) {
  const { maxLength = 0 } = config;
  const { tokens, counts, expires } = model;
  const result = {
    tokens: 'Not enough tokens available to send the message',
    counts: 'Not enough counts available to send the message',
    expires: 'Subscription has expired',
  };

  if (tokens && tokens !== null) {
    if (tokens < maxLength) {
      return result.tokens;
    }
  }

  if (counts && counts !== null) {
    if (counts < 0) {
      return result.counts;
    }
  }

  if (expires && expires !== null) {
    if (new Date(expires) < new Date()) {
      return result.expires;
    }
  }

  return null;
}

export function getModelConfigs(
  modelVersion: ModelVersions | undefined,
  configType: ModelConfigType
) {
  if (!modelVersion) return null;
  const template = ModelDefaultTemplates[modelVersion] as any;
  return template[configType] || null;
}

export function mergeModelConfigs(obj1: any, obj2: any) {
  const config = Object.keys(obj1 || {}).reduce((result: any, key) => {
    result[key] = obj2[key] || null;
    return result;
  }, {});
  return JSON.stringify(config, null, 2);
}
