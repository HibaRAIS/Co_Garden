const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const bcrypt = require("bcrypt");

const Member = sequelize.define(
  "Member",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    first_name: {
      type: DataTypes.STRING(50),
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    last_name: {
      type: DataTypes.STRING(50),
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    phone: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    password_hash: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    role: {
      type: DataTypes.ENUM("admin", "membre"),
      defaultValue: "membre",
      allowNull: false,
    },
    join_date: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    skills: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    schema: "membres", // ✅ Ajout du schéma
    tableName: "members",
    timestamps: true,
    // ✅ Supprimer les hooks problématiques
  }
);

// Méthode pour vérifier le mot de passe
Member.prototype.checkPassword = async function (password) {
  return await bcrypt.compare(password, this.password_hash);
};

// Méthode pour sérialiser sans le hash
Member.prototype.toSafeObject = function () {
  const { password_hash, ...safeMember } = this.toJSON();
  return safeMember;
};

module.exports = Member;
