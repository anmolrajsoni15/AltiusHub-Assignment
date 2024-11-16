## Project Overview

AltiusHub is a backend application designed to manage invoices. It provides a set of RESTful APIs to create, update, delete, retrieve, and list invoices. Each invoice can have multiple items and bill sundries associated with it.

## Features

- Create, update, delete, retrieve, and list invoices.
- Validate invoice items and bill sundries.
- Ensure total amount calculations are accurate.
- Auto-incrementing invoice numbers.
- Error handling for validation failures.

## Technologies Used

- Node.js
- Express.js
- Sequelize (PostgreSQL)
- dotenv
- uuid
- bcryptjs
- jsonwebtoken
- cors
- body-parser

## Getting Started

### Prerequisites

- Node.js
- PostgreSQL

### Installation

1. Clone the repository:
  ```sh
  git clone https://github.com/anmolrajsoni15/AltiusHub-Assignment.git
  ```
2. Navigate to the project directory:
  ```sh
  cd backend
  ```
3. Install dependencies:
  ```sh
  npm install
  ```
4. Create a `.env` file in the root directory and add your database configuration:
  ```env
  PORT=4100
  DB_NAME=altiusHub
  DB_USER=your_db_user
  DB_PASS=your_db_password
  DB_HOST=your_db_host
  DB_PORT=your_db_port
  ```

### Running the Application

Start the server:
```sh
npm start
```

For development mode with hot reloading:
```sh
npm run dev
```

The server will be running on the port specified in your `.env` file.

## API Endpoints

### Invoices

- `POST /api/invoices`: Create a new invoice.
- `PUT /api/invoices/:id`: Update an existing invoice.
- `DELETE /api/invoices/:id`: Delete an invoice.
- `GET /api/invoices/:id`: Retrieve a specific invoice.
- `GET /api/invoices`: List all invoices.

## Database Models

### Header

- `id`: UUID
- `date`: string (UTC)
- `invoiceNumber`: number (auto-increment)
- `customerName`: string
- `billingAddress`: string
- `shippingAddress`: string
- `gstin`: string
- `totalAmount`: decimal

### Items

- `id`: UUID
- `itemName`: string
- `quantity`: decimal
- `price`: decimal
- `amount`: decimal

### BillSundry

- `id`: UUID
- `billSundryName`: string
- `amount`: decimal

## Validation Rules

- **Invoice Items**:
  - Amount = Quantity x Price
  - Price, Quantity, and Amount must be greater than zero.
- **Bill Sundries**:
  - Amount can be negative or positive.
- **Invoice**:
  - TotalAmount = Sum(InvoiceItems’ Amount) + Sum(InvoiceBillSundry’s Amount)
  - InvoiceNumber should be auto-incremental and unique.

