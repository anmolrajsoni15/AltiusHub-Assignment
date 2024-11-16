// Id: UUID
// billSundryName: string
// Amount: decimal

import { DataTypes, Model, Sequelize } from "sequelize";
import sequelize from "../config/db.js";
import Header from "./header.model.js";

class BillSundry extends Model { }

BillSundry.init(
  {
    id: {
      type: DataTypes.UUID,
      allowNull: false,
      primaryKey: true
    },
    billSundryName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    amount: {
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
    modelName: "billsundry",
    tableName: "billsundry",
    timestamps: true,
    createdAt: "createdAt",
    updatedAt: "updatedAt"
  }
)

Header.hasMany(BillSundry);
BillSundry.belongsTo(Header);

BillSundry.sync({alter: true});

export default BillSundry;
