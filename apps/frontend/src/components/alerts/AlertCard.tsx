"use client";

import React from "react";

interface Alert {
  type: string;
  severity: string;
  message?: string;
  ip?: string;
  timestamp?: number;
}

export default function AlertCard({ alert }: { alert: Alert }) {
  const getColor = () => {
    switch (alert.severity) {
      case "CRITICAL":
        return "border-red-500 bg-red-900/30";
      case "HIGH":
        return "border-orange-400 bg-orange-900/20";
      case "MEDIUM":
        return "border-yellow-400 bg-yellow-900/20";
      default:
        return "border-green-400 bg-green-900/20";
    }
  };

  return (
    <div
      className={`border-l-4 p-3 rounded-lg mb-2 transition ${getColor()}`}
    >
      <div className="flex justify-between items-center">
        <span className="font-semibold">{alert.type}</span>
        <span className="text-xs text-gray-400">
          {new Date(alert.timestamp || 0).toLocaleTimeString()}
        </span>
      </div>

      <div className="text-sm mt-1 text-gray-300">
        {alert.message || "Suspicious activity detected"}
      </div>

      {alert.ip && (
        <div className="text-xs text-gray-400 mt-1">
          IP: {alert.ip}
        </div>
      )}
    </div>
  );
}