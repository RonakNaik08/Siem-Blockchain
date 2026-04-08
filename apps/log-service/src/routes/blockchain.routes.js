import express from "express";
import {
  getChain,
  getBlockchainStatus,
  verifyOnChain,
  getChainRecord,
  getPending,
} from "../controllers/blockchain.controller.js";

const router = express.Router();

// GET  /blockchain           — full in-memory chain
router.get("/", getChain);

// GET  /blockchain/status    — chain length + validity
router.get("/status", getBlockchainStatus);

// GET  /blockchain/pending   — logs waiting in buffer
router.get("/pending", getPending);

// POST /blockchain/verify    — verify logId+hash on Ethereum
router.post("/verify", verifyOnChain);

// GET  /blockchain/chain-record/:logId — read record from contract
router.get("/chain-record/:logId", getChainRecord);

export default router;