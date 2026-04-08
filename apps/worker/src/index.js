import dotenv from "dotenv";
dotenv.config();

import { Worker } from "bullmq";
import { processLog } from "./processors/log.processor.js";

const connection = {
  host: process.env.REDIS_HOST || "127.0.0.1",
  port: parseInt(process.env.REDIS_PORT || "6379"),
};

const worker = new Worker(
  "logs",
  async (job) => {
    console.log(`⚙️  Processing job ${job.id}:`, job.data.message || "(no message)");
    await processLog(job.data);
  },
  { connection }
);

worker.on("completed", (job) => {
  console.log(`✅ Job ${job.id} completed`);
});

worker.on("failed", (job, err) => {
  console.error(`❌ Job ${job?.id} failed:`, err.message);
});

console.log("🚀 Worker running — listening to 'logs' queue on Redis...");
