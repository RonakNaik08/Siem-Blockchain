"use client";
import React from "react";
import { useState } from "react";
import { useLogStore } from "../../store/logStore";

import QueryBar from "../../components/search/QueryBar";
import Filters from "../../components/search/Filters";
import { parseQuery } from "../../components/search/QueryParser";

import LogTable from "../../components/logs/LogTable";

export default function LogsPage() {
  const logs = useLogStore((s: any) => s.logs);

  const [query, setQuery] = useState("");

  const filtered = parseQuery(logs, query);

  return (
    <div className="space-y-4">

      <QueryBar query={query} setQuery={setQuery} />

      <Filters />

      <LogTable logs={filtered} />

    </div>
  );
}