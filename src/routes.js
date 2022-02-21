import { Router } from 'express';
import multer from 'multer';
import get from './controllers/api';

const AWS = require('aws-sdk');
const fs = require('fs');
const multiparty = require('multiparty');

const storage = multer.diskStorage({
  destination: './public',
  filename(req, file, cb) {
    cb(null, `${file.originalname}`);
  },
});

const upload = multer({ storage }).single('file');

// API Controller
const apiRouter = Router();
apiRouter.all('/:service', get);

const fileRouter = Router();
fileRouter.post('/:service', (req, res) => {
  upload(req, res, err => {
    if (err instanceof multer.MulterError) {
      return res.status(500).json(err);
    }
    if (err) {
      return res.status(500).json(err);
    }
    return get(req, res);
  });
});

// create S3 instance
const s3 = new AWS.S3({
  accessKeyId: 'AKIAZ3IKVYD3BIDJW74U',
  secretAccessKey: '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',
  Bucket: 'wealth-management-s3bucket',
});

const uploadFile = (buffer, name) => {
  const params = {
    ACL: 'public-read',
    Body: buffer,
    Bucket: 'wealth-management-s3bucket',
    //  ContentType: type.mime,
    Key: name,
  };
  return s3.upload(params).promise();
};

const docRouter = Router();
docRouter.post('/:service', (request, response) => {
  const form = new multiparty.Form();

  form.parse(request, async (error, fields, files) => {
    if (error) throw new Error(error);
    try {
      const data = files.file.map(async (fileData, index) => {
        const { path } = fileData;
        const buffer = fs.readFileSync(path);

        const fileName = `${fields.clientname[index]}/
        ${fields.pan[index]}/
        ${fields.category[index]}/
        ${fields.filename[index]}`;

        return uploadFile(buffer, fileName);
      });

      const res = await Promise.all(data);
      const s3url = res.map(ele => ele.Location);

      request.body = {
        name: fields.clientname,
        pan: fields.pan,
        category: fields.category,
        filename: fields.filename,
        s3url,
        createdatetime: fields.createdatetime,
      };

      return get(request, response);
    } catch (err) {
      return response.status(400).send(err);
    }
  });
});

export default app => {
  app.use('/api', apiRouter);
  app.use('/file', fileRouter);
  app.use('/doc', docRouter);
};
