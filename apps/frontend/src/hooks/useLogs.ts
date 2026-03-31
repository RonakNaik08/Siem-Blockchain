"use client";

import { useEffect } from "react";
import { api } from "../services/api";
import { useLogStore } from "../store/logStore";

export const useLogs = () => {
  const setLogs = useLogStore((s: any) => s.setLogs);

  useEffect(() => {
    api.getLogs().then(setLogs);
  }, []);
};