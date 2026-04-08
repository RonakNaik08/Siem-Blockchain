import express from "express";
import axios from "axios";

const router = express.Router();

// Proxy GET /api/logs → log-service
router.get("/", async (req, res) => {
  try {
    const { data } = await axios.get(
      `${process.env.LOG_SERVICE_URL || "http://localhost:4000"}/api/logs`
    );
    res.json(data);
  } catch (err) {
    res.status(502).json({ error: "Log service unavailable" });
  }
});

// Proxy POST /api/logs → log-service
router.post("/", async (req, res) => {
  try {
    const { data } = await axios.post(
      `${process.env.LOG_SERVICE_URL || "http://localhost:4000"}/api/logs`,
      req.body
    );
    res.json(data);
  } catch (err) {
    res.status(502).json({ error: "Log service unavailable" });
  }
});

export default router;