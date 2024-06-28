import { BadRequest, InternalServerError } from '@/utils/error';

import { ChatsApiRequest } from '@/types/next-api';

import { FileServiceManager } from '@/managers';
import { apiHandler } from '@/middleware/api-handler';
import { IncomingForm } from 'formidable';
import { promises as fs } from 'fs';

export const config = {
  api: {
    bodyParser: false,
  },
};

const handler = async (req: ChatsApiRequest) => {
  const { id } = req.query as { id: string };
  const fileServer = await FileServiceManager.findById(id);
  if (!fileServer || !fileServer.enabled) {
    throw new BadRequest('Not found File Server');
  }

  const {
    configs: { storageFolderName = 'files' },
  } = fileServer;

  const data = (await new Promise((resolve, reject) => {
    const form = new IncomingForm();
    form.parse(req, (err: any, fields: any, files: any) => {
      if (err) return reject(err);
      resolve({ fields, files });
    });
  })) as any;
  try {
    const file = data.files.file[0];
    const imagePath = file.filepath;
    const pathToWriteImage = `public/${storageFolderName}/${file.originalFilename}`;
    const image = await fs.readFile(imagePath);
    await fs.writeFile(pathToWriteImage, image);
    return {
      getUrl: `${req.headers.origin}/${storageFolderName}/${file.originalFilename}`,
    };
  } catch (error: any) {
    throw new InternalServerError(
      JSON.stringify({ message: error?.message, stack: error?.stack }),
    );
  }
};

export default apiHandler(handler);
