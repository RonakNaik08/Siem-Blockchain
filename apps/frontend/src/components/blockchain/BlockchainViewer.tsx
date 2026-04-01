"use client";

import React, { useEffect, useState } from "react";
import { io } from "socket.io-client";

const socket = io("http://localhost:5000");

interface Block {
  index: number;
  timestamp: number;
  hash: string;
  previousHash: string;
  merkleRoot: string;
}

export default function BlockchainViewer() {
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [valid, setValid] = useState(true);

  // Fetch initial blockchain
  useEffect(() => {
    fetch("http://localhost:5000/blockchain")
      .then((res) => res.json())
      .then((data) => setBlocks(data))
      .catch(console.error);
  }, []);

  // WebSocket updates
  useEffect(() => {
    socket.on("new_block", (block: Block) => {
      setBlocks((prev) => [...prev, block]);
    });

    socket.on("alert", (alert) => {
      if (alert.type === "BLOCKCHAIN_TAMPER") {
        setValid(false);
      }
    });

    return () => {
      socket.off("new_block");
      socket.off("alert");
    };
  }, []);

  return (
    <div className="p-4 bg-gray-900 text-white rounded-2xl shadow-lg">
      <h2 className="text-2xl font-bold mb-4">🔗 Blockchain Viewer</h2>

      <div className="mb-4">
        Status:{" "}
        <span
          className={`font-bold ${
            valid ? "text-green-400" : "text-red-500"
          }`}
        >
          {valid ? "VALID ✅" : "TAMPERED ❌"}
        </span>
      </div>

      <div className="space-y-4 max-h-[500px] overflow-y-auto">
        {blocks.map((block) => (
          <div
            key={block.index}
            className="bg-gray-800 p-4 rounded-xl border border-gray-700"
          >
            <div className="text-sm text-gray-400">
              Block #{block.index}
            </div>

            <div className="mt-2 text-xs break-all">
              <p>
                <strong>Hash:</strong> {block.hash}
              </p>
              <p>
                <strong>Prev:</strong> {block.previousHash}
              </p>
              <p>
                <strong>Merkle:</strong> {block.merkleRoot}
              </p>
            </div>

            <div className="text-xs text-gray-500 mt-2">
              {new Date(block.timestamp).toLocaleString()}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}