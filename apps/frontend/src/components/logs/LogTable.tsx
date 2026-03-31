"use client";

import React, { useEffect, useRef, useState } from "react";
import Badge from "../ui/Badge";
import VerifyButton from "./VerifyButton";
import { socket } from "../../utils/socket";

interface Log {
  id?: string;
  _id?: string;
  level?: string;
  message?: string;
  timestamp?: string;
  verified?: boolean;
  severity?: string;
}

export default function LogTable() {
  const [logs, setLogs] = useState<Log[]>([]);
  const [filter, setFilter] = useState<string>("ALL");
  const tableRef = useRef<HTMLDivElement | null>(null);

  // ✅ REAL-TIME SOCKET CONNECTION
  useEffect(() => {
    socket.on("log:new", (log: Log) => {
      setLogs((prev) => [log, ...prev.slice(0, 199)]); // limit to 200 logs
    });

    return () => {
      socket.off("log:new");
    };
  }, []);

  // ✅ AUTO SCROLL (new logs on top)
  useEffect(() => {
    if (tableRef.current) {
      tableRef.current.scrollTop = 0;
    }
  }, [logs]);

  // 🎯 LEVEL COLORS
  const getLevelColor = (level?: string) => {
    switch (level) {
      case "error":
        return "bg-red-500 text-white";
      case "warn":
        return "bg-yellow-500 text-black";
      default:
        return "bg-green-500 text-white";
    }
  };

  // 🚨 SEVERITY COLORS (AI-based)
  const getSeverityColor = (severity?: string) => {
    switch (severity) {
      case "CRITICAL":
        return "text-red-500 font-bold";
      case "HIGH":
        return "text-orange-400";
      case "MEDIUM":
        return "text-yellow-400";
      default:
        return "text-green-400";
    }
  };

  // 🔍 FILTER LOGS
  const filteredLogs =
    filter === "ALL"
      ? logs
      : logs.filter((log) => log.level === filter);

  return (
    <div className="bg-gray-900 rounded-2xl p-4 shadow-lg">

      {/* HEADER */}
      <div className="flex justify-between mb-3 items-center">
        <h2 className="text-lg font-semibold">Live Logs</h2>

        <div className="flex items-center gap-3">
          {/* LIVE INDICATOR */}
          <span className="flex items-center gap-2 text-sm text-green-400">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
            LIVE
          </span>

          {/* FILTER */}
          <select
            className="bg-gray-800 text-sm p-1 rounded"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="ALL">All</option>
            <option value="error">Error</option>
            <option value="warn">Warn</option>
            <option value="info">Info</option>
          </select>
        </div>
      </div>

      {/* TABLE */}
      <div
        ref={tableRef}
        className="max-h-[400px] overflow-y-auto border border-gray-800 rounded-lg"
      >
        <table className="w-full text-sm">
          <thead className="sticky top-0 bg-gray-800 z-10">
            <tr>
              <th className="p-2 text-left">Level</th>
              <th className="p-2 text-left">Message</th>
              <th className="p-2 text-left">Time</th>
              <th className="p-2 text-left">Severity</th>
              <th className="p-2 text-center">Verify</th>
            </tr>
          </thead>

          <tbody>
            {filteredLogs.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center p-4 text-gray-500">
                  No logs available
                </td>
              </tr>
            ) : (
              filteredLogs.map((log, i) => {
                const isThreat =
                  log.severity === "HIGH" || log.severity === "CRITICAL";

                return (
                  <tr
                    key={log._id || log.id || i}
                    className={`border-t border-gray-800 transition ${
                      isThreat
                        ? "bg-red-900/20 hover:bg-red-900/40"
                        : "hover:bg-gray-800/50"
                    }`}
                  >
                    {/* LEVEL */}
                    <td className="p-2">
                      <Badge className={getLevelColor(log.level)}>
                        {log.level || "info"}
                      </Badge>
                    </td>

                    {/* MESSAGE */}
                    <td className="p-2 font-mono text-xs break-all">
                      {log.message || "No message"}
                    </td>

                    {/* TIME */}
                    <td className="p-2 text-gray-400">
                      {log.timestamp
                        ? new Date(log.timestamp).toLocaleTimeString()
                        : "--"}
                    </td>

                    {/* SEVERITY */}
                    <td className={`p-2 ${getSeverityColor(log.severity)}`}>
                      {log.severity || "LOW"}
                    </td>

                    {/* VERIFY */}
                    <td className="p-2 text-center">
                      {log.verified === undefined ? (
                        <VerifyButton log={log} />
                      ) : log.verified ? (
                        <span className="text-green-400">✔</span>
                      ) : (
                        <span className="text-red-500">✖</span>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* FOOTER STATS */}
      <div className="flex justify-between mt-3 text-xs text-gray-400">
        <span>Total Logs: {logs.length}</span>
        <span>
          Threats:{" "}
          {
            logs.filter(
              (l) => l.severity === "HIGH" || l.severity === "CRITICAL"
            ).length
          }
        </span>
      </div>
    </div>
  );
}