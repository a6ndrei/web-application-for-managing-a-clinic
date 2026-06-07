import { DataTypes } from "sequelize";
import sequelize from "../lib/db.js";
import Users from "./Users.js";
import Medic from "./Medic.js";
import Pacient from "./Pacient.js";

const Programari = sequelize.define("Programari", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  id_medic: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  id_pacient: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  specializare: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  tip_vizita: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  data_programare: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  ora_programare: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  status: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  notes: {
    type: DataTypes.STRING,
    allowNull: true,
  },
});

export default Programari;
