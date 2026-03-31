const memory = {};

export const correlate = (log) => {
  const key = log.ip || "global";

  if (!memory[key]) {
    memory[key] = { failed: 0, success: 0 };
  }

  if (log.type === "FAILED_LOGIN") {
    memory[key].failed++;
  }

  if (log.type === "LOGIN_SUCCESS") {
    memory[key].success++;
  }

  // 🚨 detection logic
  if (memory[key].failed >= 5 && memory[key].success >= 1) {
    return {
      type: "BRUTE_FORCE_SUCCESS",
      severity: "CRITICAL",
      ip: key
    };
  }

  return null;
};