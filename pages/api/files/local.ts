import { IncomingForm } from 'formidable';
import { promises as fs } from 'fs';
import { NextApiRequest, NextApiResponse } from 'next';

export const config = {
  api: {
    bodyParser: false,
  },
};

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'POST') {
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
      const pathToWriteImage = `public/files/${file.originalFilename}`;
      const image = await fs.readFile(imagePath);
      await fs.writeFile(pathToWriteImage, image);
      res.status(200).json({
        getUrl: `${req.headers.origin}/files/${file.originalFilename}`,
      });
    } catch (error) {
      console.log(error);
      res.status(400).end('Upload failed!');
      return;
    }
  }
};

export default handler;
