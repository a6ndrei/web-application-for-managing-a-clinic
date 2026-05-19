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
Medic.hasMany(Programari, { foreignKey: "id_medic" });
Medic.hasMany(Pacient, { foreignKey: "id_medic" });

export default Medic;
