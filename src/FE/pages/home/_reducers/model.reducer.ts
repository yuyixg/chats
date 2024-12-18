import { AdminModelDto } from '@/types/adminApis';

export type SetModelsType = AdminModelDto[];
export type SetSelectModelType = AdminModelDto | undefined;
export type SetSelectModelsType = AdminModelDto[];

interface ModelInitialState {
  models: SetModelsType;
  selectModel: SetSelectModelType;
  selectedModels: SetSelectModelsType;
}

export const modelInitialState: ModelInitialState = {
  models: [],
  selectModel: undefined,
  selectedModels: [],
};

export enum ModelActionTypes {
  SET_MODELS = 'SET_MODELS',
  SET_SELECTED_MODEL = 'SET_SELECTED_MODEL',
  SET_SELECTED_MODELS = 'SET_SELECTED_MODELS',
}

export type ModelAction =
  | { type: ModelActionTypes.SET_MODELS; payload: SetModelsType }
  | { type: ModelActionTypes.SET_SELECTED_MODEL; payload: SetSelectModelType }
  | {
      type: ModelActionTypes.SET_SELECTED_MODELS;
      payload: SetSelectModelsType;
    };

export default function modelReducer(
  state: ModelInitialState,
  action: ModelAction,
): ModelInitialState {
  switch (action.type) {
    case ModelActionTypes.SET_MODELS:
      return { ...state, models: action.payload };
    case ModelActionTypes.SET_SELECTED_MODEL:
      return { ...state, selectModel: action.payload };
    case ModelActionTypes.SET_SELECTED_MODELS:
      return { ...state, selectedModels: action.payload };
    default:
      return state;
  }
}
