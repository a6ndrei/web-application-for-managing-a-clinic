import express from "express";
import Medic from "../models/Medic.js";
import Users from "../models/Users.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const doctors = await Medic.findAll({
      include: [
        {
          model: Users,
          attributes: ["firstName", "lastName", "email"],
        },
      ],
    });
    res.status(200).json(doctors);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
