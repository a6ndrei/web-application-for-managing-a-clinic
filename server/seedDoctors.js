import sequelize from "./lib/db.js";
import Users from "./models/Users.js";
import Medic from "./models/Medic.js";
import bcrypt from "bcrypt";

async function seed() {
  try {
    await sequelize.sync({ alter: true });
    const password = await bcrypt.hash("parola123", 10);

    const doctorsData = [
      { firstName: "Mihai", lastName: "Popescu", email: "mihai.popescu@vitamed.ro", specializare: "Cardiologie" },
      { firstName: "Sebastian", lastName: "Stoica", email: "sebastian.stoica@vitamed.ro", specializare: "Neurologie" },
      { firstName: "Andreea", lastName: "Dumitrescu", email: "andreea.dumitrescu@vitamed.ro", specializare: "Oftalmologie" },
      { firstName: "Ioana", lastName: "Marinescu", email: "ioana.marinescu@vitamed.ro", specializare: "Dermatologie" }
    ];

    for (const d of doctorsData) {
      const [user, created] = await Users.findOrCreate({
        where: { email: d.email },
        defaults: {
          firstName: d.firstName,
          lastName: d.lastName,
          email: d.email,
          parola: password,
          rol: "medic"
        }
      });

      if (created || user) {
        await Medic.findOrCreate({
          where: { id_user: user.id },
          defaults: {
            id_user: user.id,
            specializare: d.specializare
          }
        });
      }
    }

    console.log("Doctorii au fost adăugați cu succes!");
    process.exit(0);
  } catch (err) {
    console.error("Eroare la popularea bazei de date:", err);
    process.exit(1);
  }
}

seed();
