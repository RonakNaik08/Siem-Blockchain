import { create } from "zustand";

type Log = {
  _id: string;
  logData: any;
  verified: boolean;
  createdAt: string;
};

type LogState = {
  logs: Log[];
  setLogs: (logs: Log[]) => void;
  addLog: (log: Log) => void;
};

export const useLogStore = create<LogState>((set) => ({
  logs: [],

  setLogs: (logs) => set({ logs }),

  addLog: (log) =>
    set((state) => ({
      logs: [log, ...state.logs]
    }))
}));