import crypto from "crypto";
import { emitAlert } from "../websocket/socket.server.js";

export function processAlerts(alerts, log) {
  alerts.forEach((alert) => {
    const alertData = {
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      ...alert,
      source_ip: log.source_ip,
    };

    console.log("🚨 ALERT:", alertData);

    // 🔥 send to frontend
    emitAlert(alertData);
  });
}