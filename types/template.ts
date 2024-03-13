import { ModelType, ModelVersions } from './model';

type ChatGPTApiConfig = {
  apiKey: string;
  version: string;
  host: string;
  type: 'openai' | 'azure';
};

type QianWenPlusApiConfig = {
  apiKey: string;
  host: string;
};

type QianFanApiConfig = {
  apiKey: string;
  host: string;
  secret: string;
};

export const ModelDefaultTemplates = {
  [ModelVersions.GPT_3_5]: {
    type: ModelType.GPT,
    apiConfig: {
      host: '',
      apiKey: '',
      version: '2023-12-01-preview',
      type: 'openai',
    } as ChatGPTApiConfig,
    modelConfig: {
      prompt:
        "You are ChatGPT, a large language model trained by OpenAI. Follow the user's instructions carefully. Respond using markdown.",
    },
  },
  [ModelVersions.GPT_4]: {
    type: ModelType.GPT,
    apiConfig: {
      host: '',
      apiKey: '',
      version: '2023-12-01-preview',
      type: 'openai',
    } as ChatGPTApiConfig,
    modelConfig: {
      prompt:
        "You are ChatGPT, a large language model trained by OpenAI. Follow the user's instructions carefully. Respond using markdown.",
    },
  },
  [ModelVersions.GPT_4_Vision]: {
    type: ModelType.GPT,
    apiConfig: {
      host: '',
      apiKey: '',
      version: '2023-12-01-preview',
      type: 'openai',
    } as ChatGPTApiConfig,
    modelConfig: {
      prompt:
        "You are ChatGPT, a large language model trained by OpenAI. Follow the user's instructions carefully. Respond using markdown.",
    },
    imgConfig: {},
  },
  [ModelVersions.QWen_Vl_Plus]: {
    type: ModelType.QianWen,
    apiConfig: {
      host: 'https://dashscope.aliyuncs.com/api/v1',
      apiKey: '',
    } as QianWenPlusApiConfig,
    modelConfig: {
      prompt:
        "You are an AI assistant with image understanding capabilities, Follow the user's instructions carefully. Respond using markdown.",
    },
    imgConfig: {},
  },
  [ModelVersions.ERNIE_Bot_4]: {
    type: ModelType.QianFan,
    apiConfig: {
      host: 'https://aip.baidubce.com',
      apiKey: '',
      secret: '',
    } as QianFanApiConfig,
    modelConfig: {
      prompt:
        "You are an AI assistant, Follow the user's instructions carefully. Respond using markdown.",
    },
  },
  [ModelVersions.ERNIE_Bot_8K]: {
    type: ModelType.QianFan,
    apiConfig: {
      host: 'https://aip.baidubce.com',
      apiKey: '',
      secret: '',
    } as QianFanApiConfig,
    modelConfig: {
      prompt:
        "You are an AI assistant, Follow the user's instructions carefully. Respond using markdown.",
    },
  },
};
