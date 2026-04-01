"use client";

import { useEffect, useState } from "react";
import { socket } from "../lib/socket"; // Update the path to the correct location of the socket module
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
  socket.on("alert:new", (alert) => {
    if (alert.severity === "CRITICAL") {
      toast.error(`🚨 ${alert.type}`);
    }
  });

  useEffect(() => {
    socket.on("alert:new", (alert: Alert) => {
      const enriched = {
        ...alert,
        timestamp: Date.now(),
      };

      setAlerts((prev) => [enriched, ...prev.slice(0, 99)]);
    });

    return () => {
      socket.off("alert:new");
    };
  }, []);

  return { alerts };
};



