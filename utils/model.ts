import {
  ChatModelConfig,
  ChatModelPriceConfig,
  ModelConfigType,
  ModelProviders,
  ModelVersions,
} from '@/types/model';
import { getModelDefaultTemplate } from '@/types/template';

import Decimal from 'decimal.js';

export function verifyChat(model: any, userBalance: Decimal) {
  const { tokens, counts, expires } = model;
  const errorMessages = {
    tokens: 'Not enough tokens available to send the message',
    counts: 'Not enough counts available to send the message',
    expires: 'Subscription has expired',
  };

  let usages = {
    balance: false,
    tokens: false,
    counts: false,
    expires: true,
  };

  if (expires !== '-') {
    if (new Date(expires + ' 23:59:59') < new Date()) {
      usages.expires = false;
      return usages;
    }
  }

  if (counts === '-') {
    usages.counts = true;
    return usages;
  }

  if (counts !== '-') {
    if (+counts > 0) {
      usages.counts = true;
      return usages;
    }
  }

  if (tokens === '-') {
    usages.tokens = true;
    return usages;
  }
  
  if (tokens !== '-') {
    if (+tokens >= 4096) {
      usages.tokens = true;
      return usages;
    }
  }

  if (userBalance.gte(0)) {
    usages.balance = true;
    return usages;
  }

  return usages;
}

export function getModelConfigs(
  modelVersion: ModelVersions | undefined,
  modelProvider: ModelProviders,
  configType: ModelConfigType,
) {
  if (!modelVersion) return null;
  const template = getModelDefaultTemplate(modelVersion, modelProvider) as any;
  return template[configType] || null;
}

export function getModelModelConfig(
  modelVersion: ModelVersions | undefined,
  modelProvider: ModelProviders,
) {
  return getModelConfigs(modelVersion, modelProvider, 'modelConfig');
}
export function getModelFileConfig(
  modelVersion: ModelVersions | undefined,
  modelProvider: ModelProviders,
) {
  return getModelConfigs(modelVersion, modelProvider, 'fileConfig');
}

export function getModelPriceConfig(
  modelVersion: ModelVersions | undefined,
  modelProvider: ModelProviders,
) {
  return getModelConfigs(modelVersion, modelProvider, 'priceConfig');
}

export function getModelApiConfigJson(
  modelVersion: ModelVersions | undefined,
  modelProvider: ModelProviders,
) {
  return JSON.stringify(
    getModelConfigs(modelVersion, modelProvider, 'apiConfig'),
    null,
    2,
  );
}

export function getModelModelConfigJson(
  modelVersion: ModelVersions | undefined,
  modelProvider: ModelProviders,
) {
  return JSON.stringify(
    getModelConfigs(modelVersion, modelProvider, 'modelConfig'),
    null,
    2,
  );
}

export function getModelFileConfigJson(
  modelVersion: ModelVersions | undefined,
  modelProvider: ModelProviders,
) {
  const config = getModelConfigs(modelVersion, modelProvider, 'fileConfig');
  return config ? JSON.stringify(config, null, 2) : null;
}

export function getModelPriceConfigJson(
  modelVersion: ModelVersions | undefined,
  modelProvider: ModelProviders,
) {
  return JSON.stringify(
    getModelConfigs(modelVersion, modelProvider, 'priceConfig'),
    null,
    2,
  );
}

export function mergeConfigs(obj1: any, obj2: any) {
  const config = Object.keys(obj1 || {}).reduce((result: any, key) => {
    result[key] = obj2[key] === null ? '' : obj2[key];
    return result;
  }, {});
  return JSON.stringify(config, null, 2);
}

export const ModelPriceUnit = 1000000;

export function conversionModelPriceToCreate(priceConfig: string) {
  const configs = JSON.parse(priceConfig) as ChatModelPriceConfig;
  configs.input = Number((configs.input * ModelPriceUnit).toFixed(2));
  configs.out = Number((configs.out * ModelPriceUnit).toFixed(2));
  return JSON.stringify(configs, null, 2);
}

export function conversionModelPriceToDisplay(priceConfig: string) {
  const configs = JSON.parse(priceConfig) as ChatModelPriceConfig;
  configs.input = configs.input * ModelPriceUnit;
  configs.out = configs.out * ModelPriceUnit;
  return JSON.stringify(configs, null, 2);
}

export function conversionModelPriceToSave(priceConfig: string) {
  const configs = JSON.parse(priceConfig) as ChatModelPriceConfig;
  configs.input = configs.input / ModelPriceUnit;
  configs.out = configs.out / ModelPriceUnit;
  return JSON.stringify(configs);
}

export function getStorageModelId() {
  return localStorage.getItem('selectModelId');
}

export function setStorageModelId(modelId: string) {
  return localStorage.setItem('selectModelId', modelId);
}
