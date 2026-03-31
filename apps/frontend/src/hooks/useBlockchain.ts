import { useState } from "react";

export function useBlockchain() {
  const addLog = async (logText: string) => {
    // Simulate adding a log to the blockchain
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          logId: Math.random().toString(36).substring(7),
          hash: Math.random().toString(36).substring(7),
        });
      }, 1000);
    });
  };

  return { addLog };
}