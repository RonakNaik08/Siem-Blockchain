"use client";
import React from "react";
export default function Filters() {
  return (
    <div className="flex gap-2 mb-2">

      <button className="bg-gray-800 px-3 py-1 rounded text-xs">
        Error
      </button>

      <button className="bg-gray-800 px-3 py-1 rounded text-xs">
        Warn
      </button>

      <button className="bg-gray-800 px-3 py-1 rounded text-xs">
        Info
      </button>

    </div>
  );
}