import { useEffect, useState } from "react";
import { socket } from "../lib/socket";

export const useLogs = () => {
  const [logs, setLogs] = useState<any[]>([]);

  useEffect(() => {
    socket.on("new-log", (log) => {
      setLogs((prev) => [log, ...prev]);
    });

    return () => {
      socket.off("new-log");
    };
  }, []);

  return logs;
};