import { useEffect } from "react";
import { useAlertStore } from "../store/alertStore";

export const useAlerts = () => {
  const addAlert = useAlertStore((s: any) => s.addAlert);

  useEffect(() => {
    const interval = setInterval(() => {
      addAlert({
        id: Date.now(),
        message: "Suspicious activity detected",
        severity: "high"
      });
    }, 15000);

    return () => clearInterval(interval);
  }, []);
};