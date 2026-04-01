"use client";

import { useEffect, useState } from "react";
import { getSocket } from "../lib/socket"; // ✅ FIXED
import toast from "react-hot-toast";

export interface Alert {
  type: string;
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  message?: string;
  ip?: string;
  timestamp?: number;
}

export const useAlerts = () => {
  const [alerts, setAlerts] = useState<Alert[]>([]);

  useEffect(() => {
    const socket = getSocket(); // ✅ SINGLETON

    const onNewAlert = (alert: Alert) => {
      console.log("🚨 Alert received:", alert);

      // 🔔 Toast for critical
      if (alert.severity === "CRITICAL") {
        toast.error(`🚨 ${alert.type}`);
      }

      const enriched = {
        ...alert,
        timestamp: Date.now(),
      };

      setAlerts((prev) => [enriched, ...prev.slice(0, 99)]);
    };

    socket.on("alert:new", onNewAlert);

    return () => {
      socket.off("alert:new", onNewAlert); // ✅ SAFE CLEANUP
    };
  }, []);

  return { alerts };
};
