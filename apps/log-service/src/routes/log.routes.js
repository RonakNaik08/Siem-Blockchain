import express from "express";
import { createLog, getLogs } from "../controllers/log.controller.js";
import { verifyLog } from "../controllers/verify.controller.js";

const router = express.Router();

router.get("/", getLogs);
router.post("/", createLog);
router.get("/:id/verify", verifyLog);

export default router;
