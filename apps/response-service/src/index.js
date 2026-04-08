import express from "express";
import { handleAlert } from "./actions.js";

const app = express();
app.use(express.json());

const PORT = 5006;

app.post("/trigger", (req, res) => {
  const alert = req.body;
  const reactions = handleAlert(alert);
  
  res.json({
    status: "success",
    actionsTaken: reactions.length,
    timestamp: new Date().toISOString()
  });
});

app.listen(PORT, () => {
  console.log(`[Response-Service] SOAR Lite running on port ${PORT}`);
});
