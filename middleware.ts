import { NextApiRequest } from 'next';
import { getSession } from './utils/session';
import prisma from './prisma/prisma';
import { NextResponse } from 'next/server';
export const middleware = async (req: NextApiRequest, res: NextResponse) => {
  if (req.url?.includes('/api/')) {
    // const session = await getSession(req.cookies);
    // console.log(req.url, req.method,res.status);
    // await prisma.auditLogs.create({
    //   data: {
    //     userId: session?.userId,
    //     method: req.method!,
    //     url: req.url!,
    //     body: JSON.stringify('{}'),
    //   },
    // });
  }
};
