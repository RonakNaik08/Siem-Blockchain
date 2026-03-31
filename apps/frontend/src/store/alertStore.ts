import { create } from "zustand";

type Alert = {
  id: string;
  message: string;
  severity: string;
};

type AlertState = {
  alerts: Alert[];
  addAlert: (alert: Alert) => void;
};

export const useAlertStore = create<AlertState>((set) => ({
  alerts: [],

  addAlert: (alert) =>
    set((state) => ({
      alerts: [alert, ...state.alerts]
    }))
}));