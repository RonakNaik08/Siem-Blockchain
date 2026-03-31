import dotenv from "dotenv";
dotenv.config();

export const ENV = {
  PORT: process.env.PORT || 5000,
  MONGO_URI: process.env.MONGO_URI,
  JWT_SECRET: process.env.JWT_SECRET || "secret",
  REDIS_URL: process.env.REDIS_URL || "redis://127.0.0.1:6379",
  ENCRYPTION_KEY: process.env.ENCRYPTION_KEY || "12345678901234567890123456789012",
  RPC_URL: process.env.RPC_URL || "http://127.0.0.1:8545",
  PRIVATE_KEY: process.env.PRIVATE_KEY,
  CONTRACT_ADDRESS: process.env.CONTRACT_ADDRESS,
};
