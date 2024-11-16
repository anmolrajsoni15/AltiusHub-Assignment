// Create a CRUD endpoint for an invoice. It must follow the following rules:
// Build 5 endpoints, create, update, delete, retrieve & list. Follow the REST principles.
// Each endpoint must accept the entire Invoice in one JSON during CRUD operation. That is, Each Invoice can have many InvoiceItems and InvoiceBillSundrys.
// Validations for InvoiceItems:
// Amount = Quantity x Price
// Price, Quantity, and Amount must be greater than zero.
// Validations for BillSundrys:
// The amount can be negative or positive.
// Validations for Invoice:
// TotalAmount = Sum(InvoiceItems’s Amount) + Sum(InvoiceBillSundry’s Amount)
// InvoiceNumber should autoincremental and hence should be unique.
// Raise appropriate error messages if any validation fails.

import Header from "../models/header.model.js";
import {v4 as uuidv4 } from 'uuid';
import Items from "../models/items.model.js";
import BillSundry from "../models/billsundry.model.js";
import sequelize from "../config/db.js";

const validateInvoiceData = (items, billSundries) => {
  // Validate invoice items
  for (const item of items) {
    const calculatedAmount = parseFloat(item.quantity) * parseFloat(item.price);
    if (Math.abs(calculatedAmount - parseFloat(item.amount)) > 0.01) {
      throw new Error(`Invalid amount for item ${item.itemName}. Expected: ${calculatedAmount}, Got: ${item.amount}`);
    }
    if (item.price <= 0 || item.quantity <= 0 || item.amount <= 0) {
      throw new Error(`Price, Quantity, and Amount must be greater than zero for item ${item.itemName}`);
    }
  }

  // Calculate total amount
  const itemsTotal = items.reduce((sum, item) => sum + parseFloat(item.amount), 0);
  const billSundriesTotal = billSundries.reduce((sum, sundry) => sum + parseFloat(sundry.amount), 0);
  
  return parseFloat(itemsTotal) + parseFloat(billSundriesTotal);
};

export const createInvoice = async (req, res) => {
  const t = await sequelize.transaction();
  
  try {
    const { items, billSundries, ...invoiceData } = req.body;
    const calculatedTotal = validateInvoiceData(items, billSundries);
    
    if (Math.abs(calculatedTotal - parseFloat(invoiceData.totalAmount)) > 0.01) {
      throw new Error(`Invalid total amount. Expected: ${calculatedTotal}, Got: ${invoiceData.totalAmount}`);
    }

    const invoiceId = uuidv4();

    invoiceData.id = invoiceId;
    await Header.create(invoiceData, { transaction: t });

    await Promise.all([
      ...items.map(item => Items.create({
        id: uuidv4(),
        ...item,
        headerId: invoiceId
      }, { transaction: t })),
      ...billSundries.map(sundry => BillSundry.create({
        id: uuidv4(),
        ...sundry,
        headerId: invoiceId
      }, { transaction: t }))
    ]);

    await t.commit();
    res.status(201).json({message: 'Invoice created successfully'});
  } catch (error) {
    await t.rollback();
    console.log(error);
    res.status(400).json({ error: error.message });
  }
};

export const updateInvoice = async (req, res) => {
  const t = await sequelize.transaction();
  
  try {
    const { id } = req.params;
    const { items, billSundries, ...invoiceData } = req.body;
    const calculatedTotal = validateInvoiceData(items, billSundries);

    if (Math.abs(calculatedTotal - parseFloat(invoiceData.totalAmount)) > 0.01) {
      throw new Error(`Invalid total amount. Expected: ${calculatedTotal}, Got: ${invoiceData.totalAmount}`);
    }

    const invoice = await Header.findOne({ where: { id } });
    if (!invoice) {
      throw new Error('Invoice not found');
    }

    await Promise.all([
      Items.destroy({ where: { headerId: id }, transaction: t }),
      BillSundry.destroy({ where: { headerId: id }, transaction: t })
    ]);

    await invoice.update(invoiceData, { transaction: t });

    await Promise.all([
      ...items.map(item => Items.create({
        id: uuidv4(),
        ...item,
        headerId: id
      }, { transaction: t })),
      ...billSundries.map(sundry => BillSundry.create({
        id: uuidv4(),
        ...sundry,
        headerId: id
      }, { transaction: t }))
    ]);

    await t.commit();
    res.json(invoice);
  } catch (error) {
    await t.rollback();
    res.status(400).json({ error: error.message });
  }
};

export const deleteInvoice = async (req, res) => {
  const t = await sequelize.transaction();
  
  try {
    const { id } = req.params;
    const invoice = await Header.findByPk(id);
    
    if (!invoice) {
      throw new Error('Invoice not found');
    }

    await Promise.all([
      Items.destroy({ where: { headerId: id }, transaction: t }),
      BillSundry.destroy({ where: { headerId: id }, transaction: t }),
      invoice.destroy({ transaction: t })
    ]);

    await t.commit();
    res.status(204).send();
  } catch (error) {
    await t.rollback();
    res.status(400).json({ error: error.message });
  }
};

export const getInvoice = async (req, res) => {
  try {
    const { id } = req.params;
    const invoice = await Header.findByPk(id, {
      include: [
        { model: Items },
        { model: BillSundry }
      ]
    });

    if (!invoice) {
      return res.status(404).json({ error: 'Invoice not found' });
    }

    res.json(invoice);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const listInvoices = async (req, res) => {
  try {
    const invoices = await Header.findAll({
      include: [
        { model: Items },
        { model: BillSundry }
      ]
    });
    res.json(invoices);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
