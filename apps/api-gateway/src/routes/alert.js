import express from "express";
import { broadcast } from "../socket.js";

const router = express.Router();

router.post("/", (req, res) => {
  const alert = {
    id: Date.now(),
    message: req.body.message,
    type: "ALERT",
  };

  // 🔥 send to frontend
  broadcast(alert);

  res.json({ success: true });
});

export default router;