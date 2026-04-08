import express from "express";
import { analyzeLog } from "./scoring.engine.js";

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 5005;

app.post("/analyze", (req, res) => {
  const log = req.body;
  const analysis = analyzeLog(log);
  
  res.json({
    status: "success",
    analysis
  });
});

app.get("/health", (req, res) => res.json({ status: "ok" }));

app.listen(PORT, () => {
  console.log(`[AI-Threat-Service] Running on port ${PORT}`);
});
