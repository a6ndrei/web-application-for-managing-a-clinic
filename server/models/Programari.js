import { DataTypes } from "sequelize";
import { sequelize } from "../lib/db.js";

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
  email_pacient: {
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
  email_medic: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

export default Programari;
