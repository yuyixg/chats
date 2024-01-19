export const DEFAULT_TEMPERATURE = parseFloat(
  process.env.NEXT_PUBLIC_DEFAULT_TEMPERATURE || '1'
);

export const SPARK_APP_ID = process.env.SPARK_APP_ID || '';
export const SPARK_API_KEY = process.env.SPARK_API_KEY || '';
export const SPARK_API_SECRET = process.env.SPARK_API_SECRET || '';

export const MINIO_ACCESS_KEY = process.env.MINIO_ACCESS_KEY || '';
export const MINIO_SECRET = process.env.MINIO_SECRET || '';
export const MINIO_BUCKET_NAME = process.env.MINIO_BUCKET_NAME || '';
