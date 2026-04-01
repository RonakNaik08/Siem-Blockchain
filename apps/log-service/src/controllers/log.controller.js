import Log from "../models/log.model.js";

// ❌ REMOVE THIS (weak hashing)
// import { generateHash } from "../utils/hash.util.js";

// ✅ USE HASH CHAIN
import { createLogWithHash } from "../services/hashChain.service.js";

// ✅ INTERNAL BLOCKCHAIN
import { addLog } from "../blockchain/index.js";

// OPTIONAL Ethereum
import { storeHashOnChain } from "../blockchain.js";

// -------------------------------
// 🚨 BRUTE FORCE TRACKER
// -------------------------------
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

// -------------------------------
// 🚀 CREATE LOG (MAIN FUNCTION)
// -------------------------------
export const createLog = async (req, res) => {
  try {
    const logData = { ...req.body };

    // -------------------------------
    // 🔐 ENRICH LOG
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
    // 🔐 HASH CHAIN (FIXED)
    // -------------------------------
    const chainedLog = createLogWithHash(logData);

    // -------------------------------
    // 💾 SAVE DB
    // -------------------------------
    const saved = await Log.create({
      logData,
      hash: chainedLog.hash,
      prevHash: chainedLog.prevHash,
      verified: true
    });

    // -------------------------------
    // ⚡ REAL-TIME EMIT (FIXED)
    // -------------------------------
    const emitPayload = {
      id: saved._id.toString(), // ✅ IMPORTANT
      message: logData.message || "",
      level: logData.level,
      severity: logData.severity,
      source_ip: logData.ip || "unknown",
      timestamp: logData.timestamp,
      hash: chainedLog.hash,
      prevHash: chainedLog.prevHash
    };

    const io = req.app.get("io");

    if (io) {
      console.log("📤 Emitting log:", emitPayload); // 🔥 DEBUG
      io.emit("new-log", emitPayload); // ✅ FIXED EVENT NAME
    }

    // -------------------------------
    // 🔗 INTERNAL BLOCKCHAIN (FIXED)
    // -------------------------------
    const blockchainResult = await addLog(chainedLog, io);

    // 🚨 Tamper alert fix
    if (blockchainResult.tamperAlert?.isTampered && io) {
      io.emit("alert:new", {
        id: Date.now().toString(),
        type: "BLOCKCHAIN_TAMPER",
        severity: "CRITICAL",
        message: "Blockchain integrity compromised!",
        timestamp: Date.now()
      });
    }

    // -------------------------------
    // ⛓ OPTIONAL ETHEREUM
    // -------------------------------
    storeHashOnChain(saved._id.toString(), chainedLog.hash)
      .then(({ txHash, blockNumber }) => {
        Log.findByIdAndUpdate(saved._id, {
          txHash,
          blockNumber
        }).exec();

        if (io) {
          io.emit("log:confirmed", {
            id: saved._id.toString(),
            txHash,
            blockNumber
          });
        }

        console.log(
          `⛓ Chain confirmed: block=${blockNumber} tx=${txHash?.slice(0, 10)}...`
        );
      })
      .catch((err) =>
        console.warn("⚠ Blockchain skipped:", err.message)
      );

    // -------------------------------
    // 🚨 BRUTE FORCE
    // -------------------------------
    checkBruteForce(logData.ip, logData.type, io);

    res.status(201).json({
      success: true,
      blockchain: blockchainResult,
      data: saved
    });

  } catch (err) {
    console.error("❌ ERROR:", err);
    res.status(500).json({ error: err.message });
  }
};

// -------------------------------
// 📥 GET LOGS
// -------------------------------
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