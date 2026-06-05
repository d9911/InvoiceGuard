import { Router } from 'express';
import { invoiceController } from '../controllers/InvoiceController';
import { webhookAuth } from '../middlewares/webhookAuth';

const router = Router();

router.post('/invoice', (req, res) => invoiceController.create(req, res));
router.get('/invoice/:id', (req, res) => invoiceController.get(req, res));
router.post('/webhook', webhookAuth, (req, res) => invoiceController.webhook(req, res));

export default router;
