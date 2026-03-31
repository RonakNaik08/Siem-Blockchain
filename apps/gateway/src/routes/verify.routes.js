import express from "express";
import axios from "axios";

const router = express.Router();

router.get("/:id", async (req, res) => {
  const response = await axios.get(
    `http://localhost:5001/verify/${req.params.id}`
  );

  res.json(response.data);
});

export default router;