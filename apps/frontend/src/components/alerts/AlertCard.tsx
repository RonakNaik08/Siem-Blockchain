import React from "react";
export default function AlertCard({ alert }: any) {
    return (
      <div className="card border-l-4 border-red-500 p-3 flex justify-between items-center">
        <div>
          <p className="text-sm">{alert.message}</p>
          <span className="text-xs text-gray-400">
            Severity: {alert.severity}
          </span>
        </div>
  
        <span className="text-red-400 text-xs">
          ⚠
        </span>
      </div>
    );
  }