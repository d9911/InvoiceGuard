import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import path from 'path';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';
import invoiceRoutes from './interfaces/http/routes/invoiceRoutes';

const app = express();

app.use(cors());

// Swagger setup
// Since compiled files are in dist/src/app.js, we go up two levels to find swagger.yaml in root
const swaggerDocument = YAML.load(path.join(__dirname, '../../swagger.yaml'));
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Custom body parser to keep raw body for signature verification
app.use(bodyParser.json({
  verify: (req: any, res: express.Response, buf: Buffer) => {
    req.rawBody = buf;
  }
}));

app.use('/api', invoiceRoutes);

// Basic health check
app.get('/health', (req: express.Request, res: express.Response) => {
  res.json({ status: 'ok' });
});

export default app;
