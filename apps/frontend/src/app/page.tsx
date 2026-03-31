import React from "react";
import Link from "next/link";

export default function HomePage() {
  return (
    <div className="flex items-center justify-center h-full">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold">
          SIEM Dashboard
        </h1>

        <p className="text-gray-400">
          Blockchain Log Integrity + Real-time Monitoring
        </p>

        <div className="flex gap-4 justify-center">
          <Link href="/dashboard" className="bg-primary px-4 py-2 rounded">
            Open Dashboard
          </Link>

          <Link href="/logs" className="bg-gray-700 px-4 py-2 rounded">
            View Logs
          </Link>
        </div>
      </div>
    </div>
  );
}