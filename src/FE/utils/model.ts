import {
  ChatModelPriceConfig,
  ModelConfigType,
  ModelProviders,
  ModelVersions,
} from '@/types/model';
import { getModelDefaultTemplate } from '@/types/template';

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

export function getStorageModelId() {
  return localStorage.getItem('selectModelId');
}

export function setStorageModelId(modelId: string) {
  return localStorage.setItem('selectModelId', modelId);
}
