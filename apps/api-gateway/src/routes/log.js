import express from "express";
import { broadcast } from "../socket.js";

const router = express.Router();

router.post("/", (req, res) => {
  const log = {
    id: Date.now(),
    message: req.body.message,
  };

  broadcast(log);

  res.json({ success: true });
});

export default router;