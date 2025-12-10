// models/plot.js
import { DataTypes } from "sequelize";
import { sequelize } from "../db/config.js";

export const Plot = sequelize.define(
  "plots",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING, allowNull: false },
    surface: { type: DataTypes.FLOAT, allowNull: false },
    status: { type: DataTypes.STRING, defaultValue: "available" },
    soil_type: { type: DataTypes.STRING },
    image: { type: DataTypes.STRING },
    current_plant: { type: DataTypes.STRING },
    plant_emoji: { type: DataTypes.STRING },
    occupant: { type: DataTypes.STRING },
    occupantid: { type: DataTypes.INTEGER, allowNull: true },
    history: { type: DataTypes.ARRAY(DataTypes.STRING) },
  },
  {
    schema: "parcelles", // ✅ Ajout du schéma
    freezeTableName: true,
    timestamps: false,
  }
);
