import { PrismaClient as PostgresqlPrismaClient } from './generated/postgresql';
import { PrismaClient as SqlServerPrismaClient } from './generated/sqlserver';
const prisma = new PostgresqlPrismaClient();

export default prisma;
