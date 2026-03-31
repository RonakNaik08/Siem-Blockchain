export const parseQuery = (logs: any[], query: string) => {
    if (!query) return logs;
  
    const parts = query.split(" ");
  
    return logs.filter((log) => {
      return parts.every((p) => {
        if (p.includes("=")) {
          const [key, value] = p.split("=");
          return log.logData?.[key] == value;
        }
  
        return JSON.stringify(log)
          .toLowerCase()
          .includes(p.toLowerCase());
      });
    });
  };