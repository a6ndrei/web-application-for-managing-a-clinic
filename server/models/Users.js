import { DataTypes } from "sequelize";
import sequelize from "../lib/db.js";
import Medic from "./Medic.js";
import Pacient from "./Pacient.js";

const Users = sequelize.define("Users", {
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

export default Users;
