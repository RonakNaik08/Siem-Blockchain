import express from "express";
import { createLog, getLogs } from "../controllers/log.controller.js";

const router = express.Router();

router.get("/", getLogs);
router.post("/", createLog); // ✅ THIS HANDLES POST /logs

export default router;