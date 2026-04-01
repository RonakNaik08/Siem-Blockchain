import Log from "../models/log.model.js";
import { generateHash } from "../utils/hash.util.js";

// ✅ NEW blockchain import (internal system)
import { addLog } from "../blockchain/index.js";

// OPTIONAL: keep if you're using Ethereum
import { storeHashOnChain } from "../blockchain.js";

// In-memory brute-force tracker
const tracker = new Map();
const BRUTE_THRESHOLD = 5;
const BRUTE_WINDOW_MS = 30_000;

const checkBruteForce = (ip, type, io) => {
  if (type !== "FAILED_LOGIN" || !ip) return;

  const now = Date.now();
  const entry = tracker.get(ip) || {
    count: 0,
    firstSeen: now,
    alerted: false
  };

  if (now - entry.firstSeen > BRUTE_WINDOW_MS) {
    tracker.set(ip, { count: 1, firstSeen: now, alerted: false });
    return;
  }

  entry.count++;
  tracker.set(ip, entry);

  if (entry.count >= BRUTE_THRESHOLD && !entry.alerted) {
    entry.alerted = true;
    tracker.set(ip, entry);

    if (io) {
      io.emit("alert:new", {
        id: Date.now().toString(),
        type: "BRUTE_FORCE",
        severity: "HIGH",
        message: `Brute force detected: ${entry.count} failed logins from ${ip}`,
        ip,
        timestamp: Date.now()
      });
    }
  }
};

export const createLog = async (req, res) => {
  try {
    const logData = { ...req.body };

    // -------------------------------
    // 🔐 ENRICH LOG (SIEM LOGIC)
    // -------------------------------
    const type = logData.type || "";
    let severity = "LOW";
    let level = "info";

    if (["FAILED_LOGIN", "BRUTE_FORCE"].includes(type)) {
      severity = "HIGH";
      level = "error";
    } else if (
      ["INJECTION", "TAMPER_DETECTED", "CRITICAL_ERROR"].includes(type)
    ) {
      severity = "CRITICAL";
      level = "error";
    } else if ((logData.requests || 0) > 100 || type === "DDOS") {
      severity = "MEDIUM";
      level = "warn";
    }

    if (!logData.severity) logData.severity = severity;
    if (!logData.level) logData.level = level;
    if (!logData.timestamp) logData.timestamp = Date.now();

    // -------------------------------
    // 🔐 HASH LOG
    // -------------------------------
    const hash = generateHash(logData);

    const saved = await Log.create({
      logData,
      hash,
      verified: true
    });

    // -------------------------------
    // ⚡ REAL-TIME EMIT (UI)
    // -------------------------------
    const emitPayload = {
      _id: saved._id.toString(),
      message: logData.message || "",
      level: logData.level,
      severity: logData.severity,
      type: logData.type,
      ip: logData.ip || null,
      requests: logData.requests || null,
      timestamp: logData.timestamp,
      verified: true,
      hash,
      txHash: null,
      blockNumber: null,
      createdAt: saved.createdAt
    };

    const io = req.app.get("io");
    if (io) io.emit("log:new", emitPayload);

    // -------------------------------
    // 🔗 NEW: INTERNAL BLOCKCHAIN
    // -------------------------------
    const blockchainResult = addLog(logData, io);

    // If tampering detected → emit alert
    if (blockchainResult.tamperAlert?.alert && io) {
      io.emit("alert:new", {
        id: Date.now().toString(),
        type: "BLOCKCHAIN_TAMPER",
        severity: "CRITICAL",
        message: "Blockchain integrity compromised!",
        timestamp: Date.now()
      });
    }

    // -------------------------------
    // ⛓ OPTIONAL: ETHEREUM STORAGE
    // -------------------------------
    storeHashOnChain(saved._id.toString(), hash)
      .then(({ txHash, blockNumber }) => {
        Log.findByIdAndUpdate(saved._id, {
          txHash,
          blockNumber
        }).exec();

        if (io) {
          io.emit("log:confirmed", {
            _id: saved._id.toString(),
            txHash,
            blockNumber
          });
        }

        console.log(
          `⛓ Chain confirmed: block=${blockNumber} tx=${txHash.slice(0, 10)}...`
        );
      })
      .catch((err) =>
        console.warn("⚠ Blockchain (external) skipped:", err.message)
      );

    // -------------------------------
    // 🚨 BRUTE FORCE DETECTION
    // -------------------------------
    checkBruteForce(logData.ip, logData.type, io);

    res.status(201).json({
      success: true,
      blockchain: blockchainResult,
      data: saved
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getLogs = async (req, res) => {
  try {
    const logs = await Log.find()
      .sort({ createdAt: -1 })
      .limit(200);

    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};