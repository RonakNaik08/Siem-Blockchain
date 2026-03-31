import React from "react";
export default function TxDetails({ tx }: any) {
    return (
      <div className="card p-4">
        <p className="text-xs break-all">TX: {tx.txHash}</p>
        <p>Block: {tx.blockNumber}</p>
      </div>
    );
  }