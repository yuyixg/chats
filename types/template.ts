import { ModelProviders, ModelType, ModelVersions } from './model';

type ChatGPTApiConfig = {
  host: string;
  apiKey: string;
};

type QianWenApiConfig = {
  host: string;
  apiKey: string;
};

type QianFanApiConfig = {
  host: string;
  apiKey: string;
  secret: string;
};

type LingYiApiConfig = {
  host: string;
  apiKey: string;
};

type MoonshotApiConfig = {
  host: string;
  apiKey: string;
};

type SparkApiConfig = {
  host: string;
  apiKey: string;
};

const gptApiConfig: ChatGPTApiConfig = {
  host: '',
  apiKey: '',
};

const qianWenApiConfig: QianWenApiConfig = {
  host: 'https://dashscope.aliyuncs.com/api/v1',
  apiKey: '',
};

const qianFanApiConfig: QianFanApiConfig = {
  host: 'https://aip.baidubce.com',
  apiKey: '',
  secret: '',
};

const lingYiApiConfig: LingYiApiConfig = {
  host: 'https://api.lingyiwanwu.com',
  apiKey: '',
};

const moonshotApiConfig: MoonshotApiConfig = {
  host: 'https://api.moonshot.cn',
  apiKey: '',
};

const sparkApiConfig: SparkApiConfig = {
  host: '',
  apiKey: '',
};

export const ModelProviderTemplates = {
  [ModelProviders.OpenAI]: {
    models: [
      ModelVersions.GPT_3_5,
      ModelVersions.GPT_4,
      ModelVersions.GPT_4_Vision,
    ],
    apiConfig: gptApiConfig,
    displayName: 'OpenAI',
  },
  [ModelProviders.Azure]: {
    models: [
      ModelVersions.GPT_3_5,
      ModelVersions.GPT_4,
      ModelVersions.GPT_4_Vision,
    ],
    apiConfig: gptApiConfig,
    displayName: 'Azure',
  },
  [ModelProviders.QianWen]: {
    models: [ModelVersions.QWen, ModelVersions.QWen_Vl],
    apiConfig: qianWenApiConfig,
    displayName: '通义千问',
  },
  [ModelProviders.QianFan]: {
    models: [ModelVersions.ERNIE_Bot_4, ModelVersions.ERNIE_Bot_8K],
    apiConfig: qianFanApiConfig,
    displayName: '文心一言',
  },
  [ModelProviders.LingYi]: {
    models: [
      ModelVersions.yi_34b_chat_0205,
      ModelVersions.yi_34b_chat_200k,
      ModelVersions.yi_vl_plus,
    ],
    apiConfig: lingYiApiConfig,
    displayName: '零一万物',
  },
  [ModelProviders.Moonshot]: {
    models: [
      ModelVersions.moonshot_v1_8k,
      ModelVersions.moonshot_v1_32k,
      ModelVersions.moonshot_v1_128k,
    ],
    apiConfig: moonshotApiConfig,
    displayName: '月之暗面',
  },
  [ModelProviders.Spark]: {
    models: [],
    apiConfig: sparkApiConfig,
    displayName: '讯飞星火',
  },
};

export const ModelTemplates = {
  [ModelVersions.GPT_3_5]: {
    type: ModelType.GPT,
    config: {
      temperature: {
        min: 0,
        max: 2,
      },
    },
    modelConfig: {
      prompt:
        "You are ChatGPT, a large language model trained by OpenAI. Follow the user's instructions carefully. Respond using markdown.",
      temperature: 0.5,
      version: '2024-02-01',
      organization: '',
      deploymentName: '',
    },
    apiConfig: gptApiConfig,
    fileConfig: null,
    priceConfig: {
      input: 0.00001085,
      out: 0.00001446,
    },
  },
  [ModelVersions.GPT_4]: {
    type: ModelType.GPT,
    config: {
      temperature: {
        min: 0,
        max: 2,
      },
    },
    modelConfig: {
      prompt:
        "You are ChatGPT, a large language model trained by OpenAI. Follow the user's instructions carefully. Respond using markdown.",
      temperature: 0.5,
      version: '2024-02-01',
      organization: '',
      deploymentName: '',
    },
    apiConfig: gptApiConfig,
    priceConfig: {
      input: 0.00021691,
      out: 0.00043381,
    },
  },
  [ModelVersions.GPT_4_Vision]: {
    type: ModelType.GPT,
    config: {
      temperature: {
        min: 0,
        max: 2,
      },
    },
    modelConfig: {
      prompt:
        "You are ChatGPT, a large language model trained by OpenAI. Follow the user's instructions carefully. Respond using markdown.",
      temperature: 0.5,
      version: '2024-02-01',
      organization: '',
      deploymentName: '',
    },
    apiConfig: gptApiConfig,
    fileConfig: { count: 5, maxSize: 10240 },
    priceConfig: {
      input: 0.0000723,
      out: 0.00021691,
    },
  },
  [ModelVersions.QWen]: {
    type: ModelType.QianWen,
    config: {
      temperature: {
        min: 0,
        max: 1.99,
      },
    },
    modelConfig: {
      prompt:
        "You are an AI assistant with image understanding capabilities, Follow the user's instructions carefully. Respond using markdown.",
      temperature: 0.85,
      version: 'qwen-max-longcontext',
      enableSearch: false,
    },
    apiConfig: qianWenApiConfig,
    priceConfig: {
      input: 0,
      out: 0,
    },
  },
  [ModelVersions.QWen_Vl]: {
    type: ModelType.QianWen,
    config: {},
    modelConfig: {
      prompt:
        "You are an AI assistant with image understanding capabilities, Follow the user's instructions carefully. Respond using markdown.",
      version: 'qwen-vl-max',
    },
    apiConfig: qianWenApiConfig,
    fileConfig: { count: 5, maxSize: 10240 },
    priceConfig: {
      input: 0,
      out: 0,
    },
  },
  [ModelVersions.ERNIE_Bot_4]: {
    type: ModelType.QianFan,
    config: {
      temperature: {
        min: 0,
        max: 2,
      },
    },
    modelConfig: {
      prompt:
        "You are an AI assistant, Follow the user's instructions carefully. Respond using markdown.",
      temperature: 0.8,
    },
    apiConfig: qianFanApiConfig,
    priceConfig: {
      input: 0.000024,
      out: 0.000048,
    },
  },
  [ModelVersions.ERNIE_Bot_8K]: {
    type: ModelType.QianFan,
    config: {
      temperature: {
        min: 0,
        max: 2,
      },
    },
    modelConfig: {
      prompt:
        "You are an AI assistant, Follow the user's instructions carefully. Respond using markdown.",
      temperature: 0.8,
    },
    apiConfig: qianFanApiConfig,
    priceConfig: {
      input: 0.000024,
      out: 0.000048,
    },
  },
  [ModelVersions.yi_34b_chat_0205]: {
    type: ModelType.LingYi,
    config: {
      temperature: {
        min: 0,
        max: 2,
      },
    },
    modelConfig: {
      prompt:
        "You are an AI assistant, Follow the user's instructions carefully. Respond using markdown.",
      temperature: 0.8,
    },
    apiConfig: lingYiApiConfig,
    priceConfig: {
      input: 0.0000025,
      out: 0.0000025,
    },
  },
  [ModelVersions.yi_34b_chat_200k]: {
    type: ModelType.LingYi,
    config: {
      temperature: {
        min: 0,
        max: 2,
      },
    },
    modelConfig: {
      prompt:
        "You are an AI assistant, Follow the user's instructions carefully. Respond using markdown.",
      temperature: 0.8,
    },
    apiConfig: lingYiApiConfig,
    priceConfig: {
      input: 0.000012,
      out: 0.000012,
    },
  },
  [ModelVersions.yi_vl_plus]: {
    type: ModelType.LingYi,
    config: {},
    modelConfig: {
      prompt:
        "You are an AI assistant with image understanding capabilities, Follow the user's instructions carefully. Respond using markdown.",
    },
    apiConfig: lingYiApiConfig,
    fileConfig: {},
    priceConfig: {
      input: 0.000006,
      out: 0.000006,
    },
  },
  [ModelVersions.moonshot_v1_8k]: {
    type: ModelType.Moonshot,
    config: {
      temperature: {
        min: 0,
        max: 1,
      },
    },
    modelConfig: {
      prompt:
        "You are an AI assistant, Follow the user's instructions carefully. Respond using markdown.",
      temperature: 0.3,
    },
    apiConfig: moonshotApiConfig,
    priceConfig: {
      input: 0.000012,
      out: 0.000012,
    },
  },
  [ModelVersions.moonshot_v1_32k]: {
    type: ModelType.Moonshot,
    config: {
      temperature: {
        min: 0,
        max: 1,
      },
    },
    modelConfig: {
      prompt:
        "You are an AI assistant, Follow the user's instructions carefully. Respond using markdown.",
      temperature: 0.3,
    },
    apiConfig: moonshotApiConfig,
    priceConfig: {
      input: 0.000024,
      out: 0.000024,
    },
  },
  [ModelVersions.moonshot_v1_128k]: {
    type: ModelType.Moonshot,
    config: {
      temperature: {
        min: 0,
        max: 1,
      },
    },
    modelConfig: {
      prompt:
        "You are an AI assistant, Follow the user's instructions carefully. Respond using markdown.",
      temperature: 0.3,
    },
    apiConfig: moonshotApiConfig,
    priceConfig: {
      input: 0.00006,
      out: 0.00006,
    },
  },
};
