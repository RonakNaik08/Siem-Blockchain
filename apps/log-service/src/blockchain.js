import { ethers } from "ethers";
import dotenv from "dotenv";
import { createRequire } from "module";

dotenv.config();

const require = createRequire(import.meta.url);
const ABI = require("../../blockchain/artifacts/contracts/LogIntegrity.sol/LogIntegrity.json");

let contract = null;

const init = () => {
  try {
    const rpcUrl = process.env.RPC_URL || "http://127.0.0.1:8545";
    const privateKey = process.env.PRIVATE_KEY;
    const contractAddress = process.env.CONTRACT_ADDRESS;

    if (!privateKey || !contractAddress) {
      console.warn("⚠ Blockchain env vars missing — blockchain features disabled");
      return;
    }

    const provider = new ethers.JsonRpcProvider(rpcUrl);
    const wallet = new ethers.Wallet(privateKey, provider);
    contract = new ethers.Contract(contractAddress, ABI.abi, wallet);
    console.log("✅ Blockchain connected:", contractAddress);
  } catch (err) {
    console.warn("⚠ Blockchain init failed:", err.message);
  }
};

init();

export const storeHashOnChain = async (logId, hash) => {
  if (!contract) throw new Error("Blockchain not connected");
  const tx = await contract.storeLog(logId, hash);
  const receipt = await tx.wait();
  return { txHash: receipt.hash, blockNumber: receipt.blockNumber };
};

export const getHashFromChain = async (logId) => {
  if (!contract) throw new Error("Blockchain not connected");
  const [hash] = await contract.getLog(logId);
  return hash;
};
