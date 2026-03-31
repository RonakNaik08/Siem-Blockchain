import React from "react";
export default function LogRow({ log, onClick }: any) {
    return (
      <tr onClick={() => onClick(log)} className="cursor-pointer hover:bg-gray-800">
        <td className="text-green-400">{log.logData.message}</td>
        <td>{log.verified ? "OK" : "THREAT"}</td>
        <td>{new Date(log.createdAt).toLocaleTimeString()}</td>
      </tr>
    );
  }