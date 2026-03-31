export const enrichLog = (log) => {
    return {
      ...log,
      location: "India",
      timestamp: new Date().toISOString(),
    };
  };