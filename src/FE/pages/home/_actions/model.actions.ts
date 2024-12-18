import {
  ModelAction,
  ModelActionTypes,
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

export default function () {}
