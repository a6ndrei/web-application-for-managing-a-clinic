import { DataTypes } from "sequelize";
import { sequelize } from "../lib/db.js";

const Medic = sequelize.define("Medic", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  parola: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  rol: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

export default Medic;
