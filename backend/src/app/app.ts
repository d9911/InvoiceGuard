import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import path from 'path';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';
import router from '@/routes';
import 'module-alias/register';

import { MetricsProvider } from './providers/metrics.provider';

const app = express();

app.use(cors());

// Metrics middleware
app.use((req, res, next) => {
  const end = MetricsProvider.httpRequestDuration.startTimer({ method: req.method, path: req.path });
  res.on('finish', () => {
    MetricsProvider.httpRequestsCounter.inc({ method: req.method, path: req.path, status: res.statusCode });
    end();
  });
  next();
});

// Swagger
try {
  // dist/src/app/app.js -> ../../swagger.yaml -> dist/swagger.yaml
  // src/app/app.ts -> ../../swagger.yaml -> ./swagger.yaml
  const swaggerDocument = YAML.load(path.join(__dirname, '../../swagger.yaml'));
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
} catch (e) {
  console.warn('Swagger docs not loaded', e);
}

app.use(bodyParser.json({
  verify: (req: any, res, buf) => {
    req.rawBody = buf;
  }
}));

app.use('/api', router);

export { app };
