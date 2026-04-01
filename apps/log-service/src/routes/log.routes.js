import express from "express";
import { createLog, getLogs } from "../controllers/log.controller.js";
import { verifyLog } from "../controllers/verify.controller.js";

const router = express.Router();

// ----------------------------------
// 📥 GET all logs
// ----------------------------------
router.get("/", getLogs);

// ----------------------------------
// 📤 CREATE new log (MAIN ENTRY)
// ----------------------------------
router.post("/", createLog);

// ----------------------------------
// 🔍 VERIFY log integrity
// ----------------------------------
router.get("/:id/verify", verifyLog);

export default router;