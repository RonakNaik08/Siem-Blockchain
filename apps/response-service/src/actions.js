/**
 * Response Actions
 * Simulates real-world security orchestration actions
 */

export const actions = {
  BLOCK_IP: (data) => {
    console.log(`[SOAR] 🛡️ ACTION: Blocking IP ${data.ip} on Firewall`);
    return { success: true, timestamp: new Date().toISOString() };
  },
  ISOLATE_USER: (data) => {
    console.log(`[SOAR] 👤 ACTION: Isolating user ${data.user} - killing all sessions`);
    return { success: true, timestamp: new Date().toISOString() };
  },
  MFA_RESET: (data) => {
    console.log(`[SOAR] 🔑 ACTION: Forcing MFA reset for ${data.user}`);
    return { success: true, timestamp: new Date().toISOString() };
  }
};

export const handleAlert = (alert) => {
  const tasks = [];

  if (alert.severity === "CRITICAL") {
    if (alert.ip) tasks.push(actions.BLOCK_IP(alert));
    if (alert.user) tasks.push(actions.ISOLATE_USER(alert));
  } else if (alert.severity === "HIGH") {
    if (alert.user) tasks.push(actions.MFA_RESET(alert));
  }

  return tasks;
};
