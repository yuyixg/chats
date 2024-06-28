import getConfig from 'next/config';

import { GlobalConfigKeys, GlobalDefaultConfigs } from '@/types/config';

import prisma from '@/prisma/prisma';

const { publicRuntimeConfig } = getConfig();

export interface Configs {
  key: string;
  value: string;
  description?: string;
}

export class ConfigsManager {
  static async update(params: Configs) {
    const { key, value, description } = params;
    publicRuntimeConfig.globalConfigs[key] = value;
    await prisma.configs.update({
      where: { key },
      data: { value, description },
    });
  }

  static async create(params: Configs) {
    const { key, value, description } = params;
    if (publicRuntimeConfig.globalConfigs[key]) {
      publicRuntimeConfig.globalConfigs = value;
    }
    return await prisma.configs.create({ data: { key, value, description } });
  }

  static async delete(key: string) {
    if (publicRuntimeConfig.globalConfigs[key]) {
      delete publicRuntimeConfig.globalConfigs[key];
    }
    await prisma.configs.delete({ where: { key } });
  }

  static async find() {
    return await prisma.configs.findMany();
  }

  static async findByKey(key: string) {
    return await prisma.configs.findFirst({ where: { key } });
  }

  static async get<T>(key: GlobalConfigKeys): Promise<T> {
    if (publicRuntimeConfig.globalConfigs[key]) {
      return publicRuntimeConfig.globalConfigs[key];
    } else {
      const config = await prisma.configs.findFirst({ where: { key } });
      if (config) {
        const value = JSON.parse(config.value);
        publicRuntimeConfig.globalConfigs = value;
        return value;
      }
      return GlobalDefaultConfigs[key] as T;
    }
  }
}
