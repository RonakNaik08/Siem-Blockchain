export default function StatsCards({ logs }: any) {
  const total = logs.length;

  const threats = logs.filter((l: any) =>
    l.message.toLowerCase().includes("attack") ||
    l.message.toLowerCase().includes("failed")
  ).length;

  return (
    <div className="grid grid-cols-3 gap-4">

      <div className="card p-4 text-center">
        <p className="text-gray-400">Total Logs</p>
        <h2 className="text-2xl glow">{total}</h2>
      </div>

      <div className="card p-4 text-center">
        <p className="text-gray-400">Threats</p>
        <h2 className="text-2xl text-red-500">{threats}</h2>
      </div>

      <div className="card p-4 text-center">
        <p className="text-gray-400">System Health</p>
        <h2 className="text-2xl text-green-400">
          {threats === 0 ? "Safe" : "At Risk"}
        </h2>
      </div>

    </div>
  );
}