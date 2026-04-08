import { getBlockchain, verifyBlockchain } from "../blockchain/index.js";
import { verifyLogOnChain, fetchLogFromChain } from "../services/blockchain.service.js";
import { getPendingLogs } from "../services/batch.service.js";

/**
 * GET /blockchain
 * Returns the full in-memory chain.
 */
export const getChain = (req, res) => {
  const chain = getBlockchain();
  res.json(chain);
};

/**
 * GET /blockchain/status
 * Returns chain length and local validity.
 */
export const getBlockchainStatus = (req, res) => {
  const chain = getBlockchain();
  const isValid = verifyBlockchain();
  res.json({
    chainLength: chain.length,
    isValid,
    latestBlock: chain[chain.length - 1] ?? null,
  });
};

/**
 * GET /blockchain/pending
 * Returns logs currently in the buffer (waiting for 5 logs to anchor).
 */
export const getPending = (req, res) => {
  const pending = getPendingLogs();
  res.json(pending);
};

/**
 * POST /blockchain/verify
 * Body: { logId: string, hash: string }
 * Verifies a log hash both on-chain (Ethereum) and locally.
 */
export const verifyOnChain = async (req, res) => {
  try {
    const { logId, hash } = req.body;

    if (!logId || !hash) {
      return res.status(400).json({ error: "logId and hash are required" });
    }

    // On-chain verification via smart contract
    // We update this to allow searching by just hash if logId is missing or "FILE_UPLOAD"
    const onChain = await verifyLogOnChain(logId, hash);

    res.json({
      success: true,
      verified: onChain.verified,
      data: onChain,
      onChain,
    });
  } catch (err) {
    console.error("❌ Verify error:", err.message);
    res.status(500).json({ error: err.message });
  }
};

/**
 * GET /blockchain/chain-record/:logId
 * Read a log record directly from the smart contract.
 */
export const getChainRecord = async (req, res) => {
  try {
    const { logId } = req.params;
    const record = await fetchLogFromChain(logId);

    if (!record || !record.hash) {
      return res.status(404).json({ error: "Record not found on chain" });
    }

    res.json({ logId, ...record });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
