import express from 'express'
import { createInvoice, deleteInvoice, getInvoice, listInvoices, updateInvoice } from '../controllers/invoice.controller.js';

const router = express.Router();

//this application contains the following routes

router.post('/invoices', createInvoice);
router.put('/invoices/:id', updateInvoice);
router.delete('/invoices/:id', deleteInvoice);
router.get('/invoices/:id', getInvoice);
router.get('/invoices', listInvoices);


export default router;