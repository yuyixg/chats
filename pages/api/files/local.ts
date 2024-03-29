import { FileServerManager } from '@/managers';
import { badRequest, internalServerError, unauthorized } from '@/utils/error';
import { getSession } from '@/utils/session';
import { IncomingForm } from 'formidable';
import { promises as fs } from 'fs';
import { NextApiRequest, NextApiResponse } from 'next';

export const config = {
  api: {
    bodyParser: false,
  },
};

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const session = await getSession(req.cookies);
    if (!session) {
      return unauthorized(res);
    }
    const { id } = req.query as { id: string };
    const fileServer = await FileServerManager.findById(id);
    if (!fileServer || !fileServer.enabled) {
      return badRequest(res, 'Not found File Server');
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
      res.status(200).json({
        getUrl: `${req.headers.origin}/${storageFolderName}/${file.originalFilename}`,
      });
    } catch (error) {
      console.log(error);
      res.status(400).end('Upload failed!');
      return;
    }
  } catch (error) {
    console.error(error);
    return internalServerError(res);
  }
};

export default handler;
