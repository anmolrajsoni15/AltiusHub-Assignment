project link:- https://docs.google.com/document/d/1IbWwf1i-nK9s7pNaJG3Iks78DoIAJ9EMTmlyqknVQcQ/edit?tab=t.0

Tech Stack Used:-
- Node.js
- Postgres
- Sequelize
- Javascript

The project asks us to create three tables 
1. Invoice
2. InvoiceItem
3. Inovice BillSundry

I have created three schemas for these table on `/backend/model` folder.
- `header.model.js` contains model for *Invoice* Table
- `items.model.js` contains model for *InvoiceItem* Table
- `billsundry.model.js` contains model for *Invoice BillSundry* Table

each table contains all the columns asked in the assignment.

Nextly I created the controllers for invoice which performs the following operation
- list all invoices
- create new invoices
- create new items
- create new billsundry
- update item
- delete item
- update bill sundry
- delete bill sundry

I have also applied the following validation on the program
- Validations for InvoiceItems:
  - `Amount = Quantity x Price`
  - `Price, Quantity, and Amount must be greater than zero.`
  
- Validations for BillSundrys:
  - `The amount can be negative or positive.`
  
- Validations for Invoice:
  - `TotalAmount = Sum(InvoiceItems’s Amount) + Sum(InvoiceBillSundry’s Amount)`
  - InvoiceNumber should autoincremental and hence should be unique.
  - Raise appropriate error messages if any validation fails.
