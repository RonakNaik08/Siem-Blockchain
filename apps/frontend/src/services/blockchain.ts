/**
 * Blockchain service — read-only access to the LogIntegrity smart contract
 * via a JSON-RPC provider (no wallet required for reads).
 */
import { ethers } from "ethers";

// ABI (only the read functions we need on the frontend)
const ABI = [
  "function getLog(string logId) view returns (string, uint256)",
  "function verifyLog(string logId, string hash) view returns (bool)",
];

const RPC_URL =
  process.env.NEXT_PUBLIC_RPC_URL || "http://127.0.0.1:8545";
const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "";

let _provider: ethers.JsonRpcProvider | null = null;
let _contract: ethers.Contract | null = null;

const getContract = (): ethers.Contract | null => {
  if (!CONTRACT_ADDRESS) return null;
  if (!_provider) {
    _provider = new ethers.JsonRpcProvider(RPC_URL);
  }
  if (!_contract) {
    _contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, _provider);
  }
  return _contract;
};

/** Read a log record directly from the chain */
export const getLogFromChain = async (
  logId: string
): Promise<{ hash: string; timestamp: number } | null> => {
  try {
    const contract = getContract();
    if (!contract) return null;
    const [hash, ts] = await contract.getLog(logId);
    return { hash: hash as string, timestamp: Number(ts) };
  } catch {
    return null;
  }
};

/** Verify a log hash directly on-chain (bypasses backend) */
export const verifyLogOnChain = async (
  logId: string,
  hash: string
): Promise<boolean> => {
  try {
    const contract = getContract();
    if (!contract) return false;
    return await contract.verifyLog(logId, hash);
  } catch {
    return false;
  }
};
