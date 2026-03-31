"use client";

import { useEffect, useRef } from "react";
import { socket } from "../utils/socket";

/**
 * Subscribe to real-time "log:new" events from the Socket.IO server.
 * Uses the shared singleton in utils/socket.ts (connects to NEXT_PUBLIC_SOCKET_URL).
 */
export const useSocket = (onNewLog: (log: any) => void) => {
  // stable ref so we don't add/remove the listener on every render
  const cbRef = useRef(onNewLog);
  cbRef.current = onNewLog;

  useEffect(() => {
    const handler = (log: any) => cbRef.current(log);
    socket.on("log:new", handler);
    return () => {
      socket.off("log:new", handler);
    };
  }, []);
};
