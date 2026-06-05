import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import invoiceRoutes from './interfaces/http/routes/invoiceRoutes';

const app = express();

app.use(cors());

// Custom body parser to keep raw body for signature verification
app.use(bodyParser.json({
  verify: (req: any, res, buf) => {
    req.rawBody = buf;
  }
}));

app.use('/api', invoiceRoutes);

// Basic health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

export default app;
