import Log from "../models/log.model.js";
import { generateHash } from "../utils/hash.util.js";
import { getHashFromChain } from "../blockchain.js";

export const verifyLog = async (req, res) => {
  try {
    const log = await Log.findById(req.params.id);
    if (!log) return res.status(404).json({ error: "Not found" });

    const currentHash = generateHash(log.logData);
    let chainHash = log.hash; // fallback to stored hash
    let isValid = false;

    try {
      chainHash = await getHashFromChain(log._id.toString());
      isValid = currentHash === chainHash;
    } catch {
      // Blockchain unavailable — compare against stored hash
      isValid = currentHash === log.hash;
    }

    if (!isValid) {
      await Log.findByIdAndUpdate(log._id, { verified: false });
      const io = req.app.get("io");
      if (io) {
        io.emit("alert:new", {
          id: Date.now().toString(),
          type: "TAMPER_DETECTED",
          severity: "CRITICAL",
          message: `Log integrity violation for ${log._id}`,
          logId: log._id,
          timestamp: Date.now(),
        });
      }
    }

    res.json({ isValid, currentHash, chainHash });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
