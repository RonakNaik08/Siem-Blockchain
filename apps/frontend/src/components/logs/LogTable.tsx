"use client";

import React, { useEffect, useRef } from "react";
import Badge from "../ui/Badge";
import VerifyButton from "./VerifyButton";

interface Log {
  id?: string;
  _id?: string;
  level?: string;
  message?: string;
  timestamp?: string;
  verified?: boolean;
}

export default function LogTable({ logs = [] }: { logs?: Log[] }) {
  const tableRef = useRef<HTMLDivElement | null>(null);

  // Auto-scroll like Splunk
  useEffect(() => {
    if (tableRef.current) {
      tableRef.current.scrollTop = 0;
    }
  }, [logs]);

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

  return (
    <div className="bg-gray-900 rounded-2xl p-4 shadow-lg">
      
      {/* Header */}
      <div className="flex justify-between mb-3">
        <h2 className="text-lg font-semibold">Live Logs</h2>
        <span className="flex items-center gap-2 text-sm text-green-400">
          <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
          LIVE
        </span>
      </div>

      {/* Table */}
      <div
        ref={tableRef}
        className="max-h-[400px] overflow-y-auto border border-gray-800 rounded-lg"
      >
        <table className="w-full text-sm">
          <thead className="sticky top-0 bg-gray-800">
            <tr>
              <th className="p-2 text-left">Level</th>
              <th className="p-2 text-left">Message</th>
              <th className="p-2 text-left">Time</th>
              <th className="p-2 text-center">Verify</th>
            </tr>
          </thead>

          <tbody>
            {logs.length === 0 ? (
              <tr>
                <td colSpan={4} className="text-center p-4 text-gray-500">
                  No logs available
                </td>
              </tr>
            ) : (
              logs.map((log, i) => (
                <tr
                  key={log._id || log.id || i}
                  className="border-t border-gray-800 hover:bg-gray-800/50 transition"
                >
                  {/* Level */}
                  <td className="p-2">
                    <Badge className={getLevelColor(log.level)}>
                      {log.level || "info"}
                    </Badge>
                  </td>

                  {/* Message */}
                  <td className="p-2 font-mono text-xs">
                    {log.message || "No message"}
                  </td>

                  {/* Time */}
                  <td className="p-2 text-gray-400">
                    {log.timestamp
                      ? new Date(log.timestamp).toLocaleTimeString()
                      : "--"}
                  </td>

                  {/* Verify */}
                  <td className="p-2 text-center">
                    <VerifyButton log={log} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}