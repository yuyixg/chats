import prisma from '@/db/prisma';
export interface CreateAuditLogs {
  userId?: string;
  url: string;
  method: string;
  statusCode: number;
  request?: string;
  response?: string;
  error?: string;
}
export class AuditLogsManager {
  static async create(params: CreateAuditLogs) {
    return await prisma.auditLogs.create({ data: { ...params } });
  }
}
