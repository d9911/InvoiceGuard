import { Router } from 'express';
import { CreateInvoiceController } from '../features/invoices/create/controller';
import { ProcessWebhookUseCase } from '../features/webhooks/process/useCase';
import { webhookSecurityMiddleware } from '../features/webhooks/process/middleware';
import { LoginController } from '../features/auth/login/controller';

const router = Router();
const createInvoiceCtrl = new CreateInvoiceController();
const loginCtrl = new LoginController();
const processWebhookUseCase = new ProcessWebhookUseCase();

router.post('/auth/login', (req, res) => loginCtrl.handle(req, res));
router.post('/invoice', (req, res) => createInvoiceCtrl.handle(req, res));

router.post('/webhook', webhookSecurityMiddleware, async (req, res) => {
  try {
    const { invoiceId, status } = req.body;
    const result = await processWebhookUseCase.execute(invoiceId, status);
    res.json({ message: 'Processed', invoiceId: result.invoiceId, status: result.status });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

export default router;
