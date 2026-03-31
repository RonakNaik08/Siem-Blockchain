import { Queue } from "bullmq";
import { ENV } from "../config/env.js";

export const logQueue = new Queue("logs", {
  connection: { url: ENV.REDIS_URL }
});

export const addLogJob = async (data) => {
  await logQueue.add("processLog", data);
};