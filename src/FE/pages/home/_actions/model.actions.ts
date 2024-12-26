import { AdminModelDto } from '@/types/adminApis';

import {
  ModelAction,
  ModelActionTypes,
  SetModelMapType,
  SetModelsType,
  SetSelectModelType,
  SetSelectModelsType,
} from '../_reducers/model.reducer';

export const setModels = (models: SetModelsType): ModelAction => ({
  type: ModelActionTypes.SET_MODELS,
  payload: models,
});

export const setSelectedModel = (
  selectedModel: SetSelectModelType,
): ModelAction => ({
  type: ModelActionTypes.SET_SELECTED_MODEL,
  payload: selectedModel,
});

export const setSelectedModels = (
  selectedModels: SetSelectModelsType,
): ModelAction => ({
  type: ModelActionTypes.SET_SELECTED_MODELS,
  payload: selectedModels,
});

export const setModelMap = (models: SetModelsType): ModelAction => {
  const modelMap: Record<string, AdminModelDto> = {};
  models.forEach((x) => {
    modelMap[x.modelId] = x;
  });
  return {
    type: ModelActionTypes.SET_MODEL_MAP,
    payload: modelMap,
  };
};

export default function () {}
