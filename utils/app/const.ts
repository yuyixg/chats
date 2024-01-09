export const DEFAULT_SYSTEM_PROMPT =
  process.env.NEXT_PUBLIC_DEFAULT_SYSTEM_PROMPT ||
  "You are ChatGPT, a large language model trained by OpenAI. Follow the user's instructions carefully. Respond using markdown.";

export const OPENAI_API_HOST =
  process.env.OPENAI_API_HOST || 'https://api.openai.com';

export const DEFAULT_TEMPERATURE = parseFloat(
  process.env.NEXT_PUBLIC_DEFAULT_TEMPERATURE || '1'
);

export const OPENAI_API_TYPE = process.env.OPENAI_API_TYPE || 'openai';

export const OPENAI_API_VERSION =
  process.env.OPENAI_API_VERSION || '2023-03-15-preview';

export const OPENAI_ORGANIZATION = process.env.OPENAI_ORGANIZATION || '';

export const SPARK_APP_ID = process.env.SPARK_APP_ID || '';
export const SPARK_API_KEY = process.env.SPARK_API_KEY || '';
export const SPARK_API_SECRET = process.env.SPARK_API_SECRET || '';

export const QIANFAN_API_KEY = process.env.QIANFAN_API_KEY || '';
export const QIANFAN_SECRET_KEY = process.env.QIANFAN_SECRET_KEY || '';

export const AWS_ACCESS_KEY = process.env.AWS_ACCESS_KEY || '';
export const AWS_SECRET = process.env.AWS_SECRET || '';
export const AWS_BUCKET_NAME = process.env.AWS_BUCKET_NAME || '';
