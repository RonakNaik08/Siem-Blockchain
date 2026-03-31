import express from "express";
import axios from "axios";

const router = express.Router();

// forward logs to log-service
router.post("/", async (req, res) => {
  const response = await axios.post(
    "http://localhost:5001/logs",
    req.body
  );

  res.json(response.data);
});

export default router;