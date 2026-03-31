"use client";
import React from "react";
export default function ProofModal({ log, onClose }: any) {
  return (
    <div className="fixed inset-0 bg-black/80 flex justify-center items-center z-50">
      <div className="card w-[400px] p-5">

        <h2 className="mb-3 text-lg">Blockchain Proof</h2>

        <p className="text-xs break-all mb-2">
          TX: {log.txHash || "N/A"}
        </p>

        <p className="text-sm mb-2">
          Block: {log.blockNumber || "-"}
        </p>

        {log.txHash && (
          <a
            href={`https://sepolia.etherscan.io/tx/${log.txHash}`}
            target="_blank"
            className="text-blue-400 text-sm"
          >
            View on Explorer
          </a>
        )}

        <button
          onClick={onClose}
          className="mt-4 bg-gray-700 px-3 py-1 rounded"
        >
          Close
        </button>
      </div>
    </div>
  );
}