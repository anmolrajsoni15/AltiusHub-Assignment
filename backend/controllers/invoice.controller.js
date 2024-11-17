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

/**
 * Creates a new invoice.
 * 
 * Steps performed:
 * 1. Start a new transaction.
 * 2. Extract items, billSundries, and other invoice data from the request body.
 * 3. Validate the invoice data and calculate the total amount.
 * 4. Check if the calculated total matches the provided total amount.
 * 5. Generate a unique ID for the invoice.
 * 6. Create the invoice header record in the database.
 * 7. Create item and bill sundry records associated with the invoice.
 * 8. Commit the transaction if all operations succeed.
 * 9. Rollback the transaction and handle errors if any operation fails.
 */
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

/**
 * Updates an invoice with the provided data.
 * 
 * Steps performed:
 * 1. Starts a new transaction.
 * 2. Extracts the invoice ID from request parameters and invoice data from request body.
 * 3. Validates the total amount of the invoice.
 * 4. Checks if the invoice exists in the database.
 * 5. Deletes existing items and bill sundries associated with the invoice.
 * 6. Updates the invoice with new data.
 * 7. Creates new items and bill sundries associated with the invoice.
 * 8. Commits the transaction if all operations succeed.
 * 9. Rolls back the transaction and sends an error response if any operation fails.
 */
export const updateInvoice = async (req, res) => {
  const t = await sequelize.transaction();
  
  try {
    const { id } = req.params;
    const { items, billSundries, ...invoiceData } = req.body;
    const calculatedTotal = validateInvoiceData(items, billSundries);
    console.log(calculatedTotal, parseFloat(invoiceData.totalAmount));

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

/**
 * Deletes an invoice and its associated items and bill sundries from the database.
 * 
 * This function performs the following steps:
 * 1. Starts a new transaction.
 * 2. Extracts the invoice ID from the request parameters.
 * 3. Finds the invoice by its primary key.
 * 4. If the invoice is not found, throws an error.
 * 5. Deletes all associated items and bill sundries using the invoice ID within the transaction.
 * 6. Deletes the invoice itself within the transaction.
 * 7. Commits the transaction if all deletions are successful.
 * 8. Sends a 204 No Content response if the deletion is successful.
 * 9. Rolls back the transaction and sends a 400 Bad Request response if any error occurs.
 */
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

/**
 * Retrieves an invoice by its ID.
 * 
 * Steps performed:
 * 1. Extracts the invoice ID from the request parameters.
 * 2. Queries the database to find the invoice by its primary key (ID), including associated Items and BillSundry models.
 * 3. If the invoice is not found, returns a 404 status with an error message.
 * 4. If the invoice is found, returns the invoice data as a JSON response.
 * 5. Catches any errors during the process and returns a 400 status with the error message.
 */
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

/**
 * List all invoices.
 *
 * This function retrieves all invoices from the database, including associated items and bill sundries.
 * It performs the following steps:
 * 1. Attempts to fetch all invoices using the `Header.findAll` method.
 * 2. Includes associated `Items` and `BillSundry` models in the query.
 * 3. If successful, responds with the retrieved invoices in JSON format.
 * 4. If an error occurs, responds with a 400 status code and the error message in JSON format.
 */
export const listInvoices = async (_req, res) => {
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
