// Id: UUID
// itemName: string
// Quantity: decimal
// Price: decimal
// Amount: decimal

import { DataTypes, Model, Sequelize } from "sequelize";
import sequelize from "../config/db.js";
import Header from "./header.model.js";

class Items extends Model { }

Items.init(
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      allowNull: false,
    },
    itemName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    quantity: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
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
    modelName: "items",
    tableName: "items",
    timestamps: true,
    createdAt: "createdAt",
    updatedAt: "updatedAt"
  }
)

Header.hasMany(Items);
Items.belongsTo(Header);

Items.sync({alter: true});

export default Items;
