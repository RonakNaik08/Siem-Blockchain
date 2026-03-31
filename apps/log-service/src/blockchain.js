import { ethers } from "ethers";
import dotenv from "dotenv";

import ABI from "../../blockchain/artifacts/contracts/LogIntegrity.sol/LogIntegrity.json" assert { type: "json" };

dotenv.config();

const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);

const wallet = new ethers.Wallet(
  process.env.PRIVATE_KEY,
  provider
);

export const contract = new ethers.Contract(
  process.env.CONTRACT_ADDRESS,
  ABI.abi,
  wallet
);