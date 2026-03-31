import Log from "../models/log.model.js";
import { generateHash } from "../utils/hash.util.js";
import { storeHashOnChain } from "../blockchain.js";

// In-memory brute-force tracker: ip -> { count, firstSeen, alerted }
const tracker = new Map();
const BRUTE_THRESHOLD = 5;
const BRUTE_WINDOW_MS = 30_000;

const checkBruteForce = (ip, type, io) => {
  if (type !== "FAILED_LOGIN" || !ip) return;
  const now = Date.now();
  const entry = tracker.get(ip) || { count: 0, firstSeen: now, alerted: false };

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
        timestamp: Date.now(),
      });
    }
  }
};

export const createLog = async (req, res) => {
  try {
    const logData = { ...req.body };

    // Enrich with severity + level based on type
    const type = logData.type || "";
    let severity = "LOW";
    let level = "info";
    if (["FAILED_LOGIN", "BRUTE_FORCE"].includes(type)) {
      severity = "HIGH"; level = "error";
    } else if (["INJECTION", "TAMPER_DETECTED", "CRITICAL_ERROR"].includes(type)) {
      severity = "CRITICAL"; level = "error";
    } else if ((logData.requests || 0) > 100 || type === "DDOS") {
      severity = "MEDIUM"; level = "warn";
    }
    if (!logData.severity) logData.severity = severity;
    if (!logData.level)    logData.level    = level;
    if (!logData.timestamp) logData.timestamp = Date.now();

    const hash = generateHash(logData);
    const saved = await Log.create({ logData, hash, verified: true });

    // Flatten log for real-time emission (UI expects flat structure)
    const emitPayload = {
      _id: saved._id.toString(),
      message: logData.message || "",
      level: logData.level || "info",
      severity: logData.severity || "LOW",
      type: logData.type || "",
      ip: logData.ip || null,
      requests: logData.requests || null,
      timestamp: logData.timestamp,
      verified: true,
      hash,
      txHash: null,
      blockNumber: null,
      createdAt: saved.createdAt,
    };

    const io = req.app.get("io");
    if (io) io.emit("log:new", emitPayload);

    // Store hash on blockchain (non-blocking, best-effort)
    storeHashOnChain(saved._id.toString(), hash)
      .then(({ txHash, blockNumber }) => {
        Log.findByIdAndUpdate(saved._id, { txHash, blockNumber }).exec();
        // Notify frontend of blockchain confirmation
        if (io) {
          io.emit("log:confirmed", {
            _id: saved._id.toString(),
            txHash,
            blockNumber,
          });
        }
        console.log(`⛓  Chain confirmed: block=${blockNumber} tx=${txHash.slice(0,10)}...`);
      })
      .catch((err) => console.warn("⚠ Blockchain storage skipped:", err.message));

    // Brute-force alert check
    checkBruteForce(logData.ip, logData.type, io);

    res.status(201).json(saved);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getLogs = async (req, res) => {
  try {
    const logs = await Log.find().sort({ createdAt: -1 }).limit(200);
    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
