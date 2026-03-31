"use client";
import React from "react";
export default function QueryBar({ query, setQuery }: any) {
  return (
    <div className="flex gap-3 mb-4">
      <input
        className="input flex-1"
        placeholder="search logs | level=error user=admin"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />

      <select className="input w-40">
        <option>Last 15 min</option>
        <option>Last 1 hour</option>
        <option>Last 24 hours</option>
      </select>

      <button className="bg-blue-600 px-4 rounded">
        Search
      </button>
    </div>
  );
}