import getConfig from 'next/config';

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
    await prisma.configs.update({
      where: { key },
      data: { value, description },
    });
  }

  static async create(params: Configs) {
    const { key, value, description } = params;
    return await prisma.configs.create({ data: { key, value, description } });
  }

  static async delete(key: string) {
    await prisma.configs.delete({ where: { key } });
  }

  static async find() {
    return await prisma.configs.findMany();
  }

  static async findByKey(key: string) {
    return await prisma.configs.findFirst({ where: { key } });
  }

  static async get(key: string) {
    if (publicRuntimeConfig.globalConfigs[key]) {
      return publicRuntimeConfig.globalConfigs[key];
    } else {
      const config = await prisma.configs.findFirst({ where: { key } });
      if (config) {
        const value = JSON.parse(config.value);
        publicRuntimeConfig.globalConfigs = value;
        return value;
      }
      return null;
    }
  }
}
