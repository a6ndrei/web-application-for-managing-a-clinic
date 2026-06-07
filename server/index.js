import express from "express";
import cors from "cors";
import sequelize from "./lib/db.js";
import Users from "./models/Users.js";
import Programari from "./models/Programari.js";
import Medic from "./models/Medic.js";
import Pacient from "./models/Pacient.js";

Users.hasOne(Medic, { foreignKey: "id_user" });
Medic.belongsTo(Users, { foreignKey: "id_user" });

Users.hasOne(Pacient, { foreignKey: "id_user" });
Pacient.belongsTo(Users, { foreignKey: "id_user" });

Medic.hasMany(Programari, { foreignKey: "id_medic" });
Programari.belongsTo(Medic, { foreignKey: "id_medic" });

Pacient.hasMany(Programari, { foreignKey: "id_pacient" });
Programari.belongsTo(Pacient, { foreignKey: "id_pacient" });

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

async function startServer() {
  try {
    await sequelize.authenticate();
    console.log("Conexiunea la baza de date a fost realizată cu succes");
    await sequelize.sync({ alter: true });
    console.log("Toate modelele au fost sincronizate.");

    app.listen(PORT, () => {
      console.log(`Serverul rulează pe portul ${PORT}`);
    });
  } catch (error) {
    console.error("Nu s-a putut conecta la baza de date:", error);
  }
}

startServer();
