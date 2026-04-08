import Log from "../models/log.model.js";
import { createLogWithHash } from "../services/hashChain.service.js";
import { addLog } from "../blockchain/index.js";
import { storeLogOnChain } from "../services/blockchain.service.js";
import { sendSlackAlert } from "../services/slack.service.js";

// -------------------------------
// 🚨 BRUTE FORCE TRACKER
// -------------------------------
const tracker = new Map();
const BRUTE_THRESHOLD = 5;
const BRUTE_WINDOW_MS = 30000;

const checkBruteForce = (ip, type, io) => {
  if (type !== "FAILED_LOGIN" || !ip) return;

  const now = Date.now();
  const entry = tracker.get(ip) || {
    count: 0,
    firstSeen: now,
    alerted: false,
  };

  if (now - entry.firstSeen > BRUTE_WINDOW_MS) {
    tracker.set(ip, { count: 1, firstSeen: now, alerted: false });
    return;
  }

  entry.count++;
  tracker.set(ip, entry);

  if (entry.count >= BRUTE_THRESHOLD && !entry.alerted) {
    entry.alerted = true;

    io?.emit("alert:new", {
      id: Date.now().toString(),
      type: "BRUTE_FORCE",
      severity: "HIGH",
      message: `Brute force detected from ${ip}`,
      ip,
      timestamp: now,
    });
  }
};

// -------------------------------
// 🚀 CREATE LOG
// -------------------------------
export const createLog = async (req, res) => {
  try {
    const logData = { ...req.body };

    // 🔐 ENRICH
    const type = logData.type || "";

    let severity = "LOW";
    let level = "info";

    if (["FAILED_LOGIN", "BRUTE_FORCE"].includes(type)) {
      severity = "HIGH";
      level = "error";
    }

    if (!logData.severity) logData.severity = severity;
    if (!logData.level) logData.level = level;
    if (!logData.timestamp) logData.timestamp = Date.now();

    // 🔐 HASH CHAIN
    const chainedLog = createLogWithHash(logData);

    // 💾 SAVE CLEAN STRUCTURE
    const saved = await Log.create({
      ...chainedLog,
      verified: true,
    });

    const io = req.app.get("io");

    // ⚡ REAL-TIME EMIT (FIXED STRUCTURE)
    const payload = {
      id: saved._id.toString(),
      type: saved.type,
      message: saved.message,
      severity: saved.severity,
      level: saved.level,
      ip: saved.ip,
      timestamp: saved.timestamp,
      hash: saved.hash,
    };

    io?.emit("new-log", payload);

    // 🔗 BLOCKCHAIN
    const blockchainResult = await addLog(saved, io);

    if (blockchainResult.tamperAlert?.isTampered) {
      const alert = {
        id: Date.now().toString(),
        type: "BLOCKCHAIN_TAMPER",
        severity: "CRITICAL",
        message: "Blockchain hash-chain compromised — potential log tampering detected",
        logId: saved._id.toString(),
        timestamp: Date.now(),
      };
      io?.emit("alert:new", alert);
      sendSlackAlert(alert).catch(() => {}); // 🔕 fire-and-forget
    }

    // 🚨 Slack for HIGH/CRITICAL logs
    if (saved.severity === "CRITICAL" || saved.severity === "HIGH") {
      sendSlackAlert({
        type: saved.type || "SECURITY_EVENT",
        severity: saved.severity,
        message: saved.message,
        ip: saved.ip,
        logId: saved._id.toString(),
      }).catch(() => {});
    }

    // ⛓ ETHEREUM (ASYNC SAFE)
    storeLogOnChain(saved._id.toString(), saved.hash)
      .then((r) => {
        if (!r.success) return;

        Log.findByIdAndUpdate(saved._id, {
          txHash: r.txHash,
          blockNumber: r.blockNumber,
        }).exec();

        io?.emit("log:confirmed", {
          id: saved._id.toString(),
          txHash: r.txHash,
        });
      })
      .catch(() => {});

    // 🚨 ATTACK DETECTION
    checkBruteForce(saved.ip, saved.type, io);

    res.status(201).json({
      success: true,
      data: saved,
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

// -------------------------------
// 📥 GET LOGS
// -------------------------------
export const getLogs = async (req, res) => {
  const logs = await Log.find().sort({ createdAt: -1 }).limit(100);
  res.json(logs);
};