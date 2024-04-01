import { UserModel } from '@/db/userModels';
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

export function getModelApiConfig(modelVersion: ModelVersions | undefined) {
  return getModelConfigs(modelVersion, 'apiConfig');
}
export function getModelModelConfig(modelVersion: ModelVersions | undefined) {
  return getModelConfigs(modelVersion, 'modelConfig');
}
export function getModelFileConfig(modelVersion: ModelVersions | undefined) {
  return getModelConfigs(modelVersion, 'fileConfig');
}

export function getModelPriceConfig(modelVersion: ModelVersions | undefined) {
  return getModelConfigs(modelVersion, 'price');
}

export function getModelApiConfigJson(modelVersion: ModelVersions | undefined) {
  return JSON.stringify(getModelConfigs(modelVersion, 'apiConfig'), null, 2);
}

export function getModelModelConfigJson(
  modelVersion: ModelVersions | undefined
) {
  return JSON.stringify(getModelConfigs(modelVersion, 'modelConfig'), null, 2);
}

export function getModelFileConfigJson(
  modelVersion: ModelVersions | undefined
) {
  return JSON.stringify(getModelConfigs(modelVersion, 'fileConfig'), null, 2);
}

export function getModelPriceConfigJson(
  modelVersion: ModelVersions | undefined
) {
  return JSON.stringify(getModelConfigs(modelVersion, 'price'), null, 2);
}

export function mergeConfigs(obj1: any, obj2: any) {
  const config = Object.keys(obj1 || {}).reduce((result: any, key) => {
    result[key] = obj2[key] || null;
    return result;
  }, {});
  return JSON.stringify(config, null, 2);
}
