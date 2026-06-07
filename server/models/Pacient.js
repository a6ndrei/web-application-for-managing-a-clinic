import { DataTypes } from "sequelize";
import sequelize from "../lib/db.js";
import Medic from "./Medic.js";
import Users from "./Users.js";
import Programari from "./Programari.js";

const Pacient = sequelize.define("Pacient", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  id_user: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  parola: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

export default Pacient;
