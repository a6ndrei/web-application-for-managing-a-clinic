import express from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

const router = express.Router();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const systemPrompt = `
Ești asistentul virtual inteligent al clinicii medicale VitaMed. 
Misiunea ta este să ajuți pacienții cu informații despre clinică, medici și programări.
Informații despre clinică:
- Adresă: Aleea Cămpul cu flori, nr.14, București.
- Telefon: +40 734 832 256.
- Program: Luni–Vineri 8:00–20:00, Sâmbătă 9:00–14:00.
- Specialități: Cardiologie (Dr. Popescu Mihai), Neurologie (Dr. Stoica Sebastian), Dermatologie (Dr. Marinescu Ioana), Oftalmologie (Dr. Dumitrescu Andreea).
- Programări: Se pot face online prin secțiunea "Rezervări" sau telefonic.

Reguli:
1. Răspunde politicos, empatic și profesionist în limba română.
2. Dacă nu știi un răspuns medical specific, recomandă întotdeauna consultarea unui medic specialist din clinică.
3. Nu inventa servicii pe care clinica nu le are.
4. Fii concis, dar de ajutor.
`;

router.post("/", async (req, res) => {
  const { message, history } = req.body;

  if (!process.env.GEMINI_API_KEY || 
      process.env.GEMINI_API_KEY === "YOUR_GEMINI_API_KEY_HERE" || 
      process.env.GEMINI_API_KEY === "YOUR_GEMINI_API_KEY") {
    console.error("Gemini API Key missing or using placeholder.");
    return res.status(500).json({ 
      error: "Cheia API Gemini nu este configurată. Vă rugăm să adăugați o cheie validă în fișierul .env (variabila GEMINI_API_KEY)." 
    });
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });
    
    const chat = model.startChat({
      history: [
        { role: "user", parts: [{ text: systemPrompt }] },
        { role: "model", parts: [{ text: "Am înțeles. Sunt asistentul VitaMed și sunt gata să ajut pacienții conform instrucțiunilor tale." }] },
        ...history.map(msg => ({
          role: msg.sender === 'user' ? 'user' : 'model',
          parts: [{ text: msg.text }]
        }))
      ],
    });

    const result = await chat.sendMessage(message);
    const response = await result.response;
    const text = response.text();

    res.json({ reply: text });
  } catch (error) {
    console.error("Gemini API Error:", error);
    const detailedError = error.message || "A apărut o eroare la procesarea mesajului tău.";
    res.status(500).json({ error: `Gemini API Error: ${detailedError}` });
  }
});

export default router;
