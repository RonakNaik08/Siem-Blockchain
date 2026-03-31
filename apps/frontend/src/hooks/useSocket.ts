"use client";

import { useEffect } from "react";

export const useSocket = (onMessage: any) => {
  useEffect(() => {
    const ws = new WebSocket("ws://localhost:4000");

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      onMessage(data);
    };

    return () => ws.close();
  }, []);
};