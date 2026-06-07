import express from "express";
import Programari from "../models/Programari.js";
import Pacient from "../models/Pacient.js";
import { verifyToken } from "./authRoutes.js";

const router = express.Router();

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

export default router;
