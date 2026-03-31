import { processRules } from "../processors/rule.processor.js";
import { processAI } from "../processors/ai.processor.js";
import { enrichLog } from "../processors/enrichment.processor.js";
import axios from "axios";

export const consumeLogs = () => {
  setInterval(async () => {
    const log = {
      id: Date.now(),
      message: "Unauthorized login attempt",
      ip: "192.168.1.10",
    };

    console.log("📥 Received log:", log.message);

    // 🔹 enrichment
    const enriched = enrichLog(log);

    // 🔹 rule engine
    const ruleResult = processRules(enriched);

    // 🔹 AI analysis
    const aiResult = processAI(enriched);

    if (ruleResult.isThreat || aiResult.isAnomaly) {
      console.log("🚨 Threat detected!");

      // 🔥 send to alert-service
      await axios.post("http://localhost:5001/alerts", {
        message: enriched.message,
        severity: "HIGH",
      });
    }

  }, 5000);
};