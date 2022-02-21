import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';

import setupRoutesFor from './routes';

const run = port => {
  const app = express();
  app.use(cors({ origin: '*' }));
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: false }));

  setupRoutesFor(app);

  return new Promise(resolve => {
    const server = app.listen(port, () => {
      resolve(server);
    });
  });
};

export default run;

/* istanbul ignore next */
if (require.main === module) {
  run(9080);
}
