import axios from "axios";
import { correlate } from "./correlation.engine.js";

export const processLog = async (log) => {
  // 1. AI / severity scoring
  if (log.type === "FAILED_LOGIN") log.severity = "HIGH";
  if (log.requests > 300) log.severity = "CRITICAL";

  // 2. 🔥 CORRELATION ENGINE
  const alert = correlate(log);

  // 3. Send log to gateway (for real-time UI)
  await axios.post("http://localhost:5000/internal/emit", {
    event: "log:new",
    data: log,
  });

  // 4. 🚨 SEND ALERT (THIS IS YOUR LINE)
  if (alert) {
    await axios.post("http://localhost:5000/internal/emit", {
      event: "alert:new",
      data: alert,
    });
  }

  return log;
};