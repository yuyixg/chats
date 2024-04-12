import prisma from '@/db/prisma';
import { Prisma } from '@prisma/client';
export interface CreateRequestLogs {
  userId?: string;
  url: string;
  method: string;
  statusCode: number;
  request?: string;
  response?: string;
}

export interface FindRequestLogs {
  query: string;
  statusCode?: number;
  page: number;
  pageSize: number;
}

export class RequestLogsManager {
  static async create(params: CreateRequestLogs) {
    return await prisma.requestLogs.create({ data: { ...params } });
  }
  static async findRequestLogs(params: FindRequestLogs) {
    const { query, statusCode, page, pageSize } = params;

    const where: Prisma.RequestLogsWhereInput = {};
    if (query) {
      where.user = { username: { contains: query } };
    }
    if (statusCode) {
      where.statusCode = { equals: statusCode };
    }

    const requestLogs = await prisma.requestLogs.findMany({
      include: {
        user: { select: { username: true, role: true } },
      },
      where,
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: { createdAt: 'desc' },
    });
    const count = await prisma.requestLogs.count({
      where,
    });
    return { rows: requestLogs, count };
  }

  static async findByRequestLogsId(id: string) {
    return await prisma.requestLogs.findUnique({ where: { id } });
  }
}
