import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { Op } from "sequelize";
import Users from "../models/Users.js";
import Pacient from "../models/Pacient.js";

const router = express.Router();

router.post("/forgot-password", async (req, res) => {
  const { email } = req.body;
  try {
    const user = await Users.findOne({ where: { email } });
    if (!user) {
      return res
        .status(404)
        .json({ message: "Nu există un cont cu această adresă de email." });
    }

    const token = crypto.randomBytes(20).toString("hex");
    const expires = Date.now() + 3600000; // 1 ora

    await user.update({
      resetPasswordToken: token,
      resetPasswordExpires: expires,
    });

    console.log(
      `Link resetare parolă: http://localhost:5173/reset-password/${token}`,
    );

    res
      .status(200)
      .json({ message: "Link-ul de resetare a fost trimis pe email." });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post("/reset-password/:token", async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  try {
    const user = await Users.findOne({
      where: {
        resetPasswordToken: token,
        resetPasswordExpires: { [Op.gt]: Date.now() },
      },
    });

    if (!user) {
      return res.status(400).json({ message: "Token invalid sau expirat." });
    }

    const hashPassword = await bcrypt.hash(password, 10);
    await user.update({
      parola: hashPassword,
      resetPasswordToken: null,
      resetPasswordExpires: null,
    });

    res.status(200).json({ message: "Parola a fost actualizată cu succes." });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post("/register", async (req, res) => {
  const { firstName, lastName, email, password } = req.body;
  try {
    const existingUser = await Users.findOne({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ message: "Utilizatorul există deja" });
    }

    const hashPassword = await bcrypt.hash(password, 10);
    const newUser = await Users.create({
      firstName,
      lastName,
      email,
      parola: hashPassword,
      rol: "pacient",
    });

    await Pacient.create({
      email,
      parola: hashPassword,
      id_user: newUser.id,
    });

    res
      .status(201)
      .json({ message: "Utilizator creat cu succes", user: newUser });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await Users.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ message: "Utilizatorul nu a fost găsit" });
    }

    const isMatch = await bcrypt.compare(password, user.parola);
    if (!isMatch) {
      return res.status(401).json({ message: "Parolă incorectă" });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, rol: user.rol },
      process.env.JWT_KEY,
      { expiresIn: "3h" },
    );

    res
      .status(200)
      .json({ 
        token, 
        user: { 
          id: user.id, 
          email: user.email, 
          rol: user.rol,
          firstName: user.firstName,
          lastName: user.lastName
        } 
      });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export const verifyToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(403).json({ message: "Nu a fost furnizat niciun token" });
  }

  jwt.verify(token, process.env.JWT_KEY, (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: "Neautorizat" });
    }
    req.userId = decoded.id;
    req.userRol = decoded.rol;
    next();
  });
};

router.get("/me", verifyToken, async (req, res) => {
  try {
    const user = await Users.findByPk(req.userId, {
      attributes: { exclude: ["parola"] },
    });
    if (!user) {
      return res.status(404).json({ message: "Utilizatorul nu a fost găsit" });
    }
    res.status(200).json({ user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
