import express from "express";
import { Op, fn, col } from "sequelize";
import Programari from "../models/Programari.js";
import { verifyToken } from "./authRoutes.js";

const router = express.Router();

// Middleware pentru a verifica dacă utilizatorul este admin
const isAdmin = (req, res, next) => {
  if (req.userRol !== "admin") {
    return res.status(403).json({ message: "Acces interzis. Doar administratorii pot vedea statistici." });
  }
  next();
};

router.get("/global", verifyToken, isAdmin, async (req, res) => {
  try {
    const totalAppointments = await Programari.count();
    
    const byStatus = await Programari.findAll({
      attributes: ["status", [fn("COUNT", col("id")), "count"]],
      group: ["status"],
    });

    const bySpecialty = await Programari.findAll({
      attributes: ["specializare", [fn("COUNT", col("id")), "count"]],
      group: ["specializare"],
    });

    const byHour = await Programari.findAll({
      attributes: ["ora_programare", [fn("COUNT", col("id")), "count"]],
      group: ["ora_programare"],
      order: [[col("ora_programare"), "ASC"]]
    });

    res.status(200).json({
      totalAppointments,
      byStatus,
      bySpecialty,
      byHour
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get("/predictions", verifyToken, isAdmin, async (req, res) => {
  try {
    // Luăm ultimele 30 de zile pentru a calcula o medie
    const today = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(today.getDate() - 30);
    
    const appointments = await Programari.findAll({
      where: {
        data_programare: {
          [Op.gte]: thirtyDaysAgo.toISOString().split("T")[0]
        }
      },
      attributes: ["data_programare"]
    });

    // Calculăm volumul zilnic
    const countsPerDay = {};
    appointments.forEach(a => {
      countsPerDay[a.data_programare] = (countsPerDay[a.data_programare] || 0) + 1;
    });

    const totalIn30Days = appointments.length;
    const dailyAverage = totalIn30Days / 30;
    const predictedNextWeek = Math.round(dailyAverage * 7);

    // Predicție pe zilele săptămânii bazată pe istoric
    const weekdayCounts = [0, 0, 0, 0, 0, 0, 0]; // Sun-Sat
    appointments.forEach(a => {
      const d = new Date(a.data_programare);
      weekdayCounts[d.getDay()]++;
    });

    const totalWeekdays = weekdayCounts.reduce((a, b) => a + b, 0);
    const weekdayWeights = weekdayCounts.map(c => totalWeekdays > 0 ? c / totalWeekdays : 1/7);

    const next7Days = [];
    for (let i = 1; i <= 7; i++) {
      const nextDate = new Date();
      nextDate.setDate(today.getDate() + i);
      const weight = weekdayWeights[nextDate.getDay()];
      next7Days.push({
        date: nextDate.toISOString().split("T")[0],
        dayName: nextDate.toLocaleDateString("ro-RO", { weekday: "short" }),
        predictedCount: Math.round(predictedNextWeek * weight)
      });
    }

    res.status(200).json({
      predictedNextWeek,
      dailyAverage: dailyAverage.toFixed(2),
      next7Days
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
