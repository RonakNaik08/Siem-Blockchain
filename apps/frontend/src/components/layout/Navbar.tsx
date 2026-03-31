"use client";

import React from "react";

export default function Navbar() {
  return (
    <div className="h-14 bg-gray-950 border-b border-gray-800 flex items-center justify-between px-6">
      
      {/* LEFT */}
      <div className="flex items-center gap-3">
        <div className="text-xl font-bold text-blue-400">
          SIEM-X
        </div>
        <span className="text-sm text-gray-400 hidden md:block">
          Security Dashboard
        </span>
      </div>

      {/* CENTER */}
      <div className="hidden md:flex items-center gap-4">
        <input
          placeholder="Search logs, IP, events..."
          className="bg-gray-800 px-3 py-1.5 rounded-lg text-sm w-80 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>

      {/* RIGHT */}
      <div className="flex items-center gap-4">
        <div className="text-sm text-gray-400">
          Admin
        </div>
        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm">
          R
        </div>
      </div>
    </div>
  );
}