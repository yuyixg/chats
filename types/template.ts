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

type LingYiApiConfig = {
  apiKey: string;
  host: string;
};

type KimiApiConfig = {
  apiKey: string;
  host: string;
};

const gptDefaultApiConfig = {
  host: '',
  apiKey: '',
  version: '2023-12-01-preview',
  type: 'openai',
};

const qianFanDefaultApiConfig = {
  host: 'https://aip.baidubce.com',
  apiKey: '',
  secret: '',
};

const lingYiDefaultApiConfig = {
  host: 'https://api.lingyiwanwu.com',
  apiKey: '',
};

const kimiDefaultApiConfig = {
  host: 'https://api.moonshot.cn',
  apiKey: '',
};

export const ModelDefaultTemplates = {
  [ModelVersions.GPT_3_5]: {
    type: ModelType.GPT,
    apiConfig: gptDefaultApiConfig as ChatGPTApiConfig,
    modelConfig: {
      prompt:
        "You are ChatGPT, a large language model trained by OpenAI. Follow the user's instructions carefully. Respond using markdown.",
    },
    fileConfig: null,
    priceConfig: {
      input: 0.00001085,
      out: 0.00001446,
    },
  },
  [ModelVersions.GPT_4]: {
    type: ModelType.GPT,
    apiConfig: gptDefaultApiConfig as ChatGPTApiConfig,
    modelConfig: {
      prompt:
        "You are ChatGPT, a large language model trained by OpenAI. Follow the user's instructions carefully. Respond using markdown.",
    },
    priceConfig: {
      input: 0.00021691,
      out: 0.00043381,
    },
  },
  [ModelVersions.GPT_4_Vision]: {
    type: ModelType.GPT,
    apiConfig: gptDefaultApiConfig as ChatGPTApiConfig,
    modelConfig: {
      prompt:
        "You are ChatGPT, a large language model trained by OpenAI. Follow the user's instructions carefully. Respond using markdown.",
    },
    fileConfig: { count: 5, maxSize: 10240 },
    priceConfig: {
      input: 0.0000723,
      out: 0.00021691,
    },
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
    fileConfig: { count: 5, maxSize: 10240 },
    priceConfig: {
      input: 0,
      out: 0,
    },
  },
  [ModelVersions.ERNIE_Bot_4]: {
    type: ModelType.QianFan,
    apiConfig: qianFanDefaultApiConfig as QianFanApiConfig,
    modelConfig: {
      prompt:
        "You are an AI assistant, Follow the user's instructions carefully. Respond using markdown.",
    },
    priceConfig: {
      input: 0.000024,
      out: 0.000048,
    },
  },
  [ModelVersions.ERNIE_Bot_8K]: {
    type: ModelType.QianFan,
    apiConfig: qianFanDefaultApiConfig as QianFanApiConfig,
    modelConfig: {
      prompt:
        "You are an AI assistant, Follow the user's instructions carefully. Respond using markdown.",
    },
    priceConfig: {
      input: 0.000024,
      out: 0.000048,
    },
  },
  [ModelVersions.yi_34b_chat_0205]: {
    type: ModelType.LingYi,
    apiConfig: lingYiDefaultApiConfig as LingYiApiConfig,
    modelConfig: {
      prompt:
        "You are an AI assistant, Follow the user's instructions carefully. Respond using markdown.",
    },
    priceConfig: {
      input: 0.0000025,
      out: 0.0000025,
    },
  },
  [ModelVersions.yi_34b_chat_200k]: {
    type: ModelType.LingYi,
    apiConfig: lingYiDefaultApiConfig as LingYiApiConfig,
    modelConfig: {
      prompt:
        "You are an AI assistant, Follow the user's instructions carefully. Respond using markdown.",
    },
    priceConfig: {
      input: 0.000012,
      out: 0.000012,
    },
  },
  [ModelVersions.yi_vl_plus]: {
    type: ModelType.LingYi,
    apiConfig: lingYiDefaultApiConfig as LingYiApiConfig,
    modelConfig: {
      prompt:
        "You are an AI assistant with image understanding capabilities, Follow the user's instructions carefully. Respond using markdown.",
    },
    fileConfig: {},
    priceConfig: {
      input: 0.000006,
      out: 0.000006,
    },
  },
  [ModelVersions.moonshot_v1_8k]: {
    type: ModelType.Kimi,
    apiConfig: kimiDefaultApiConfig as KimiApiConfig,
    modelConfig: {
      prompt:
        "You are an AI assistant, Follow the user's instructions carefully. Respond using markdown.",
    },
    priceConfig: {
      input: 0.000012,
      out: 0.000012,
    },
  },
  [ModelVersions.moonshot_v1_32k]: {
    type: ModelType.Kimi,
    apiConfig: kimiDefaultApiConfig as KimiApiConfig,
    modelConfig: {
      prompt:
        "You are an AI assistant, Follow the user's instructions carefully. Respond using markdown.",
    },
    priceConfig: {
      input: 0.000024,
      out: 0.000024,
    },
  },
  [ModelVersions.moonshot_v1_128k]: {
    type: ModelType.Kimi,
    apiConfig: kimiDefaultApiConfig as KimiApiConfig,
    modelConfig: {
      prompt:
        "You are an AI assistant, Follow the user's instructions carefully. Respond using markdown.",
    },
    priceConfig: {
      input: 0.00006,
      out: 0.00006,
    },
  },
};
