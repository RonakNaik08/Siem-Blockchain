"use client";

import { useEffect } from "react";
import { socket } from "../services/socket";
import { useLogStore } from "../store/logStore";

export const useWebSocket = () => {
  const addLog = useLogStore((s: any) => s.addLog);

  useEffect(() => {
    socket.on("new_log", (log: any) => {
      addLog(log);
    });

    return () => {
      socket.off("new_log");
    };
  }, []);
};