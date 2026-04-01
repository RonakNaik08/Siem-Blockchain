import express from "express";
import { getBlockchain } from "../blockchain/index.js";

const router = express.Router();

router.get("/", (req, res) => {
  res.json(getBlockchain());
});

export default router;