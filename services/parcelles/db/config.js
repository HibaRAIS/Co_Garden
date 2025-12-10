import { Sequelize } from "sequelize";
import dotenv from "dotenv";

dotenv.config();

const databaseUrl = process.env.DATABASE_URL;

export const sequelize = databaseUrl
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
      schema: "parcelles", // Schéma pour le service parcelles
    })
  : new Sequelize(
      process.env.DB_DATABASE,
      process.env.DB_USER,
      process.env.DB_PASSWORD,
      {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        dialect: "postgres",
        logging: false,
        schema: "parcelles", // Schéma pour le service parcelles
      }
    );

sequelize
  .authenticate()
  .then(() =>
    console.log("✅ Connecté à PostgreSQL via Sequelize (schéma: parcelles)")
  )
  .catch((err) => console.error("❌ Erreur Sequelize:", err));
