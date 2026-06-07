import express from "express";
import { fn, col } from "sequelize";
import Programari from "../models/Programari.js";
import Pacient from "../models/Pacient.js";
import Medic from "../models/Medic.js";
import Users from "../models/Users.js";
import { verifyToken } from "./authRoutes.js";

const router = express.Router();

router.get("/my-appointments", verifyToken, async (req, res) => {
  try {
    const pacient = await Pacient.findOne({ where: { id_user: req.userId } });
    if (!pacient) {
      return res.status(404).json({ message: "Pacientul nu a fost găsit." });
    }

    const appointments = await Programari.findAll({
      where: { id_pacient: pacient.id },
      include: [
        {
          model: Medic,
          include: [{ model: Users, attributes: ["firstName", "lastName"] }]
        }
      ],
      order: [["data_programare", "ASC"], ["ora_programare", "ASC"]]
    });
    res.status(200).json(appointments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get("/doctor", verifyToken, async (req, res) => {
  if (req.userRol !== "medic") {
    return res.status(403).json({ message: "Acces interzis." });
  }

  try {
    const medic = await Medic.findOne({ where: { id_user: req.userId } });
    if (!medic) {
      return res.status(404).json({ message: "Medicul nu a fost găsit." });
    }

    const appointments = await Programari.findAll({
      where: { id_medic: medic.id },
      include: [
        {
          model: Pacient,
          include: [{ model: Users, attributes: ["firstName", "lastName", "email"] }]
        }
      ],
      order: [["data_programare", "ASC"], ["ora_programare", "ASC"]]
    });
    res.status(200).json(appointments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get("/all", verifyToken, async (req, res) => {
  if (req.userRol !== "admin") {
    return res.status(403).json({ message: "Acces interzis. Doar administratorii pot vedea toate programările." });
  }

  try {
    const appointments = await Programari.findAll({
      include: [
        {
          model: Medic,
          include: [{ model: Users, attributes: ["firstName", "lastName"] }]
        },
        {
          model: Pacient,
          include: [{ model: Users, attributes: ["firstName", "lastName", "email"] }]
        }
      ],
      order: [["data_programare", "DESC"], ["ora_programare", "DESC"]]
    });
    res.status(200).json(appointments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put("/status/:id", verifyToken, async (req, res) => {
  if (req.userRol !== "admin") {
    return res.status(403).json({ message: "Acces interzis." });
  }

  const { status } = req.body;
  try {
    const appointment = await Programari.findByPk(req.params.id);
    if (!appointment) {
      return res.status(404).json({ message: "Programarea nu a fost găsită." });
    }

    await appointment.update({ status });
    res.status(200).json({ message: `Statusul programării a fost actualizat la ${status}.`, appointment });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete("/admin/:id", verifyToken, async (req, res) => {
  if (req.userRol !== "admin") {
    return res.status(403).json({ message: "Acces interzis." });
  }

  try {
    const appointment = await Programari.findByPk(req.params.id);
    if (!appointment) {
      return res.status(404).json({ message: "Programarea nu a fost găsită." });
    }

    await appointment.destroy();
    res.status(200).json({ message: "Programarea a fost ștearsă cu succes." });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete("/cancel/:id", verifyToken, async (req, res) => {
  try {
    const pacient = await Pacient.findOne({ where: { id_user: req.userId } });
    const appointment = await Programari.findByPk(req.params.id);

    if (!appointment) {
      return res.status(404).json({ message: "Programarea nu a fost găsită." });
    }

    if (appointment.id_pacient !== pacient.id) {
      return res.status(403).json({ message: "Nu aveți permisiunea de a anula această programare." });
    }

    await appointment.destroy();
    res.status(200).json({ message: "Programarea a fost anulată cu succes." });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post("/book", verifyToken, async (req, res) => {
  const { id_medic, specializare, tip_vizita, data_programare, ora_programare, notes } = req.body;
  const id_user = req.userId;

  try {
    const pacient = await Pacient.findOne({ where: { id_user } });
    if (!pacient) {
      return res.status(404).json({ message: "Pacientul nu a fost găsit." });
    }

    const id_pacient = pacient.id;

    const existing = await Programari.findOne({
      where: {
        id_medic,
        data_programare,
        ora_programare,
      },
    });

    if (existing) {
      return res.status(400).json({ message: "Acest interval orar este deja ocupat." });
    }

    const newAppointment = await Programari.create({
      id_medic,
      id_pacient,
      specializare,
      tip_vizita,
      data_programare,
      ora_programare,
      status: "Programată",
      notes,
    });

    res.status(201).json(newAppointment);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get("/busy-slots", async (req, res) => {
  const { id_medic, date } = req.query;
  try {
    const appointments = await Programari.findAll({
      where: {
        id_medic,
        data_programare: date,
      },
      attributes: ["ora_programare"],
    });
    res.status(200).json(appointments.map(a => a.ora_programare));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get("/recommend-slots", async (req, res) => {
  const { id_medic, date } = req.query;
  try {
    // 1. Găsim sloturile deja ocupate în acea zi
    const busyOnDate = await Programari.findAll({
      where: { id_medic, data_programare: date },
      attributes: ["ora_programare"],
    });
    const busyTimes = busyOnDate.map(a => a.ora_programare);

    // 2. Calculăm frecvența istorică a orelor pentru acest medic (pentru echilibrare)
    const historicalStats = await Programari.findAll({
      where: { id_medic },
      attributes: ["ora_programare", [fn("COUNT", col("id")), "count"]],
      group: ["ora_programare"],
    });

    const statsMap = {};
    historicalStats.forEach(s => {
      statsMap[s.ora_programare] = parseInt(s.get("count"));
    });

    // Toate orele posibile (corespunzătoare cu cele din frontend)
    const ALL_TIMES = [
      "8:00 AM", "8:30 AM", "9:00 AM", "9:30 AM", "10:00 AM", "10:30 AM",
      "11:00 AM", "11:30 AM", "1:00 PM", "1:30 PM", "2:00 PM", "2:30 PM",
      "3:00 PM", "3:30 PM", "4:00 PM", "4:30 PM"
    ];

    // 3. Filtrăm orele libere și le sortăm după popularitatea istorică inversă
    const recommended = ALL_TIMES
      .filter(t => !busyTimes.includes(t)) // Doar cele libere azi
      .map(t => ({
        time: t,
        score: statsMap[t] || 0 // Scor mic = mai liber istoric
      }))
      .sort((a, b) => a.score - b.score) // Cele mai libere primele
      .slice(0, 3) // Recomandăm top 3 cele mai libere ore
      .map(item => item.time);

    res.status(200).json(recommended);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
