import { useState, useMemo } from "react";

export const useQuery = (logs: any[]) => {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    if (!query) return logs;

    return logs.filter((log) => {
      return query.split(" ").every((token) => {
        if (token.includes("=")) {
          const [key, value] = token.split("=");
          return log.logData?.[key] == value;
        }

        return JSON.stringify(log)
          .toLowerCase()
          .includes(token.toLowerCase());
      });
    });
  }, [logs, query]);

  return { query, setQuery, filtered };
};