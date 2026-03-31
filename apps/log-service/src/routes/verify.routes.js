import express from "express";
import { verifyLog } from "../controllers/verify.controller.js";

const router = express.Router();

router.get("/:id", verifyLog);

export default router;