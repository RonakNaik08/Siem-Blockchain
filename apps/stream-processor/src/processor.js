import axios from "axios";
import { correlate } from "./correlation.engine.js";

export const processLog = async (log) => {
  // 1. AI Analysis Call
  let anomalyResult = { analysis: { score: 0, isAnomaly: false } };
  try {
    const response = await axios.post("http://localhost:5005/analyze", log).catch(() => null);
    if (response) anomalyResult = response.data;
  } catch (e) {
    console.error("AI Service Unavailable");
  }

  log.anomaly_score = anomalyResult.analysis.score;
  log.is_anomaly = anomalyResult.analysis.isAnomaly;

  // 2. 🔥 CORRELATION ENGINE
  const correlationAlert = correlate(log);

  // 3. 🚨 AI ALERT GENERATION
  const aiAlert = log.is_anomaly ? {
    type: "AI_ANOMALY_DETECTED",
    severity: log.anomaly_score > 80 ? "CRITICAL" : "HIGH",
    details: anomalyResult.analysis.reasons.join(", "),
    ip: log.ip,
    score: log.anomaly_score
  } : null;

  const finalAlert = correlationAlert || aiAlert;

  // 4. Send to visual gateway (for real-time UI)
  await axios.post("http://localhost:5000/internal/emit", {
    event: "log:new",
    data: log,
  }).catch(() => null);

  // 5. Send to log-service (for database & blockchain persistence)
  await axios.post("http://localhost:4000/api/ingest", log)
    .catch(e => console.error("Persistence Service Unavailable (Check port 4000)"));

  // 6. 🚨 SEND ALERT
  if (finalAlert) {
    // 6.1 Send to Dashboard
    await axios.post("http://localhost:5000/internal/emit", {
      event: "alert:new",
      data: finalAlert,
    }).catch(e => console.error("Gateway UI update failed"));

    // 6.2 Trigger SOAR Response
    await axios.post("http://localhost:5006/trigger", finalAlert)
      .catch(e => console.error("Response Service Unavailable (Check port 5006)"));
  }

  return log;
};