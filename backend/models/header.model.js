// Id: UUID
// Date: string (UTC)
// InvoiceNumber: number
// CustomerName: string
// BillingAddress: string
// ShippingAddress: string
// GSTIN: string
// TotalAmount: Decimal

import { DataTypes, Model, Sequelize } from "sequelize";
import sequelize from "../config/db.js";

class Header extends Model { }

Header.init(
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      allowNull: false,
    },
    date: {
      type: DataTypes.STRING,
      allowNull: false
    },
    invoiceNumber: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true,
      autoIncrement: true,
      defaultValue: 1
    },
    customerName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    billingAddress: {
      type: DataTypes.STRING,
      allowNull: false
    },
    shippingAddress: {
      type: DataTypes.STRING,
      allowNull: false
    },
    gstin: {
      type: DataTypes.STRING,
      allowNull: false
    },
    totalAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: Sequelize.NOW,
    },
    updatedAt: {
      type: DataTypes.DATE,
      defaultValue: Sequelize.NOW,
    }
  },
  {
    sequelize,
    modelName: "header",
    tableName: "header",
    timestamps: true,
    createdAt: "createdAt",
    updatedAt: "updatedAt"
  }
)


Header.sync({alter: true});

export default Header;
