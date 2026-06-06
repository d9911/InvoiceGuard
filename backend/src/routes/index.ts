import { Router } from 'express';
import { CreateInvoiceController } from '@/features/invoices/create/controller';
import { ProcessWebhookUseCase } from '@/features/webhooks/process/useCase';
import { webhookSecurityMiddleware } from '@/features/webhooks/process/middleware';
import { LoginController } from '@/features/auth/login/controller';
import { RegisterController } from '@/features/auth/register/controller';
import { TwoFactorController } from '@/features/auth/2fa/controller';
import { authMiddleware } from '@/shared/lib/authMiddleware';
import { InvoiceRepository } from '@/entities/invoice/repository';

const router = Router();

const loginCtrl = new LoginController();
const registerCtrl = new RegisterController();
const tfaCtrl = new TwoFactorController();
const createInvoiceCtrl = new CreateInvoiceController();
const processWebhookUseCase = new ProcessWebhookUseCase();
const invoiceRepo = new InvoiceRepository();

// Auth
router.post('/auth/login', (req, res) => loginCtrl.handle(req, res));
router.post('/auth/register', (req, res) => registerCtrl.handle(req, res));

// 2FA (Protected or Semi-protected)
router.post('/auth/2fa/enable', authMiddleware, (req, res) => tfaCtrl.enable(req, res));
router.post('/auth/2fa/verify', authMiddleware, (req, res) => tfaCtrl.verify(req, res));
router.post('/auth/2fa/login-verify', (req, res) => tfaCtrl.verify(req, res));

// Invoices (Protected)
router.post('/invoice', authMiddleware, (req, res) => createInvoiceCtrl.handle(req, res));

// Get Invoice Status (from the requirements)
router.get('/invoice/:id', async (req, res) => {
  try {
    const invoice = await invoiceRepo.findByInvoiceId(req.params.id);
    if (!invoice) return res.status(404).json({ error: 'Invoice not found' });
    res.json(invoice);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Webhooks (Public with HMAC security)
router.post('/webhook', webhookSecurityMiddleware, async (req, res) => {
  try {
    const { invoiceId, status } = req.body;
    const result = await processWebhookUseCase.execute(invoiceId, status);
    res.json({ message: 'Processed', invoiceId: result.invoiceId, status: result.status });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

export default router;
