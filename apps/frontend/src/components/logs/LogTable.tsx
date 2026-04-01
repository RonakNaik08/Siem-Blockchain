"use client";

import React, { useEffect, useRef, useState } from "react";
import Badge from "../ui/Badge";
import VerifyButton from "./VerifyButton";
import ProofModal from "../blockchain/ProofModal";
import { socket } from "../../lib/socket";

interface Log {
  id?: string;
  _id?: string;
  level?: string;
  message?: string;
  timestamp?: number | string;
  verified?: boolean;
  severity?: string;
  type?: string;
  ip?: string;
  hash?: string;
  txHash?: string | null;
  blockNumber?: number | null;
  createdAt?: string;

  logData?: {
    message?: string;
    level?: string;
    severity?: string;
    type?: string;
    ip?: string;
    timestamp?: number;
  };
}

// 🔥 NORMALIZER (FIXED)
const normalize = (log: Log) => ({
  id: log.id || log._id || "",
  message: log.message || log.logData?.message || "No message",
  level: log.level || log.logData?.level || "info",
  severity: log.severity || log.logData?.severity || "LOW",
  type: log.type || log.logData?.type || "",
  ip: log.ip || log.logData?.ip || null,
  timestamp:
    log.timestamp ||
    log.logData?.timestamp ||
    (log.createdAt ? new Date(log.createdAt).getTime() : Date.now()),
  verified: log.verified,
  hash: log.hash,
  txHash: log.txHash ?? null,
  blockNumber: log.blockNumber ?? null,
});

export default function LogTable({ logs: externalLogs = [] }: { logs?: Log[] }) {
  const [logs, setLogs] = useState<any[]>([]);
  const [filter, setFilter] = useState<string>("ALL");
  const [selectedLog, setSelectedLog] = useState<any | null>(null);
  const tableRef = useRef<HTMLDivElement | null>(null);

  // 🔥 ALWAYS STORE NORMALIZED LOGS
  useEffect(() => {
    const normalized = externalLogs.map(normalize);
    setLogs(normalized);
  }, [externalLogs]);

  // 🔥 SOCKET FALLBACK (SAFE)
  useEffect(() => {
    const onNew = (raw: Log) => {
      const log = normalize(raw);

      setLogs((prev) => {
        if (prev.find((l) => l.id === log.id)) return prev;
        return [log, ...prev.slice(0, 199)];
      });
    };

    socket.on("new_log", onNew);

    return () => {
      socket.off("new_log", onNew);
    };
  }, []);

  // ⛓ BLOCKCHAIN UPDATE
  useEffect(() => {
    const onConfirmed = ({ _id, txHash, blockNumber }: any) => {
      setLogs((prev) =>
        prev.map((l) =>
          l.id === _id
            ? { ...l, txHash, blockNumber }
            : l
        )
      );
    };

    socket.on("log:confirmed", onConfirmed);

    return () => {
      socket.off("log:confirmed", onConfirmed);
    };
  }, []);

  // 🔥 AUTO SCROLL
  useEffect(() => {
    if (tableRef.current) {
      tableRef.current.scrollTop = 0;
    }
  }, [logs]);

  // 🎨 COLORS
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

  const filtered = logs.filter(
    (log) => filter === "ALL" || log.level === filter
  );

  return (
    <>
      <div className="bg-gray-900 rounded-2xl p-4 shadow-lg">

        {/* HEADER */}
        <div className="flex justify-between mb-3 items-center">
          <h2 className="text-lg font-semibold">Live Logs</h2>

          <div className="flex items-center gap-3">
            <span className="flex items-center gap-2 text-sm text-green-400">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              LIVE
            </span>

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
                <th className="p-2 text-center">⛓ Chain</th>
                <th className="p-2 text-center">Verify</th>
              </tr>
            </thead>

            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center p-4 text-gray-500">
                    Waiting for live logs…
                  </td>
                </tr>
              ) : (
                filtered.map((log, i) => {
                  const isThreat =
                    log.severity === "HIGH" ||
                    log.severity === "CRITICAL";

                  return (
                    <tr
                      key={log.id || i}
                      className={`border-t border-gray-800 ${
                        isThreat
                          ? "bg-red-900/20 hover:bg-red-900/40"
                          : "hover:bg-gray-800/50"
                      }`}
                    >
                      <td className="p-2">
                        <Badge className={getLevelColor(log.level)}>
                          {log.level}
                        </Badge>
                      </td>

                      <td className="p-2 font-mono text-xs truncate max-w-[240px]">
                        {log.message}
                      </td>

                      <td className="p-2 text-gray-400">
                        {new Date(Number(log.timestamp)).toLocaleTimeString()}
                      </td>

                      <td className={`p-2 ${getSeverityColor(log.severity)}`}>
                        {log.severity}
                      </td>

                      <td className="p-2 text-center">
                        {log.txHash ? (
                          <button
                            onClick={() => setSelectedLog(log)}
                            className="text-blue-400 text-xs hover:underline"
                          >
                            #{log.blockNumber}
                          </button>
                        ) : (
                          <span className="text-gray-600 text-xs">⏳</span>
                        )}
                      </td>

                      <td className="p-2 text-center">
                        <VerifyButton log={log} />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* FOOTER */}
        <div className="flex justify-between mt-3 text-xs text-gray-400">
          <span>Total: {logs.length}</span>
          <span>
            Threats:{" "}
            {
              logs.filter(
                (l) =>
                  l.severity === "HIGH" ||
                  l.severity === "CRITICAL"
              ).length
            }
          </span>
          <span>
            On-chain: {logs.filter((l) => l.txHash).length} / {logs.length}
          </span>
        </div>
      </div>

      {selectedLog && (
        <ProofModal
          log={selectedLog}
          onClose={() => setSelectedLog(null)}
        />
      )}
    </>
  );
}