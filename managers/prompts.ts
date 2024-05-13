import prisma from '@/prisma/prisma';
import { PromptType } from '@/types/prompt';

interface CreatePrompt {
  name: string;
  createUserId: string;
  content: string;
  type: PromptType;
  description?: string;
}

interface UpdatePrompt extends CreatePrompt {
  id: string;
}

export class PromptsManager {
  static async findUserPrompts(createUserId: string) {
    return await prisma.prompts.findMany({
      where: { createUserId },
      orderBy: { createdAt: 'desc' },
    });
  }

  static async create(params: CreatePrompt) {
    return await prisma.prompts.create({ data: { ...params } });
  }

  static async update(params: UpdatePrompt) {
    return await prisma.prompts.update({
      where: { id: params.id },
      data: { ...params },
    });
  }

  static async delete(id: string, createUserId: string) {
    const prompt = await prisma.prompts.findUnique({
      where: { id, createUserId },
    });
    if (prompt) {
      return await prisma.prompts.delete({
        where: { id },
      });
    }
    return null;
  }
}
