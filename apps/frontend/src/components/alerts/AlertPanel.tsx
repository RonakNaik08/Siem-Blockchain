export default function AlertPanel({ logs = [] }: any) {
  const alerts = logs.filter((l: any) => l.type === "ALERT");

  return (
    <div className="card p-4">
      <h2 className="text-lg mb-3">🚨 Live Alerts</h2>

      {alerts.length === 0 && (
        <p className="text-green-400">No alerts</p>
      )}

      {alerts.map((alert: any) => (
        <div
          key={alert.id}
          className="bg-red-500/10 border border-red-500 p-2 mb-2 rounded"
        >
          ⚠ {alert.message}
        </div>
      ))}
    </div>
  );
}