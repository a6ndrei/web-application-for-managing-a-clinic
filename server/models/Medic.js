import { DataTypes } from "sequelize";
import sequelize from "../lib/db.js";
import Users from "./Users.js";
import Programari from "./Programari.js";

const Medic = sequelize.define("Medic", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  id_user: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  specializare: {
    type: DataTypes.STRING,
    allowNull: false,
  }
});

export default Medic;
