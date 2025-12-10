// src/config/database.js (MODIFIÉ)
require("dotenv").config();
const { Sequelize } = require("sequelize");

// ✅ Utiliser DATABASE_URL si elle est définie (méthode Neon/URL)
const databaseUrl = process.env.DATABASE_URL;

const sequelize = databaseUrl
  ? new Sequelize(databaseUrl, {
      dialect: "postgres",
      protocol: "postgres",
      dialectOptions: {
        ssl: databaseUrl.includes("localhost")
          ? false // Pas de SSL pour localhost
          : {
              require: true, // SSL pour Neon ou base distante
              rejectUnauthorized: false,
            },
      },
      logging: false,
      schema: "membres", // Schéma pour le service membres
    })
  : new Sequelize(
      process.env.DB_NAME || "co_garden",
      process.env.DB_USER || "postgres",
      process.env.DB_PASSWORD || "password",
      {
        host: process.env.DB_HOST || "localhost",
        port: process.env.DB_PORT || 5432,
        dialect: "postgres",
        logging: false,
        schema: "membres", // Schéma pour le service membres
      }
    );

module.exports = sequelize;
