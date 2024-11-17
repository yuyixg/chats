import {
  ChatModelPriceConfig
} from '@/types/model';

export function mergeConfigs(obj1: any, obj2: any) {
  const config = Object.keys(obj1 || {}).reduce((result: any, key) => {
    result[key] = obj2[key] === null ? '' : obj2[key];
    return result;
  }, {});
  return JSON.stringify(config, null, 2);
}

export const ModelPriceUnit = 1000000;

export function conversionModelPriceToCreate(priceConfig: ChatModelPriceConfig) {
  const newConfig = {
    input: Number((priceConfig.input * ModelPriceUnit).toFixed(6)),
    out: Number((priceConfig.out * ModelPriceUnit).toFixed(6))
  };
  return JSON.stringify(newConfig, null, 2);
}

export function convertModelPriceToDisplay(inputTokenPrice1M: number, outputTokenPrice1M: number) {
  return JSON.stringify({
    input: inputTokenPrice1M,
    out: outputTokenPrice1M
  }, null, 2);
}

export function getStorageModelId() {
  return localStorage.getItem('selectModelId');
}

export function setStorageModelId(modelId: string) {
  return localStorage.setItem('selectModelId', modelId);
}
