import { DataTypes } from "sequelize";
import { sequelize } from "../db/config.js";
import { Plot } from "./plot.js";

export const AssignmentRequest = sequelize.define(
  "assignment_requests",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    plotId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: "plot_id", // 🔧 Mapping vers snake_case
      references: {
        model: Plot,
        key: "id",
      },
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: "user_id", // 🔧 Mapping vers snake_case
    },
    status: {
      type: DataTypes.ENUM("pending", "approved", "rejected"),
      defaultValue: "pending",
      allowNull: false,
    },
    motivation: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: "motivation",
    },
    requestedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      field: "requested_at", // 🔧 Mapping vers snake_case
    },
    reviewedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: "reviewed_at", // 🔧 Mapping vers snake_case
    },
  },
  {
    schema: "parcelles",
    timestamps: false,
    freezeTableName: true,
  }
);

// Créer la relation
Plot.hasMany(AssignmentRequest, { foreignKey: "plotId" });
AssignmentRequest.belongsTo(Plot, { foreignKey: "plotId" });
