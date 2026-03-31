"use client";
import React from "react";

import { useAlerts } from "../../hooks/useAlerts";
import { useAlertStore } from "../../store/alertStore";

import AlertPanel from "../../components/alerts/AlertPanel";

export default function AlertsPage() {
  useAlerts();

  const alerts = useAlertStore((s: any) => s.alerts);

  return (
    <div className="space-y-4">

      <h2 className="text-xl font-semibold">
        Security Alerts
      </h2>

      <AlertPanel alerts={alerts} />

    </div>
  );
}