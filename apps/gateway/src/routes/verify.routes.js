import express from "express";
import axios from "axios";

const router = express.Router();

// POST /api/verify  body: { logId, hash }
router.post("/", async (req, res) => {
  try {
    const { data } = await axios.post(
      `${process.env.LOG_SERVICE_URL || "http://localhost:4000"}/blockchain/verify`,
      req.body
    );
    res.json(data);
  } catch (err) {
    res.status(502).json({ error: "Verification service unavailable" });
  }
});

export default router;