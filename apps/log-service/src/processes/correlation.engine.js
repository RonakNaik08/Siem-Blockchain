const memory = {
    loginFails: {},
  };
  
  export function detectThreat(log) {
    const alerts = [];
  
    const ip = log.source_ip;
  
    // 🚨 BRUTE FORCE DETECTION
    if (log.event_type === "login_fail") {
      if (!memory.loginFails[ip]) {
        memory.loginFails[ip] = [];
      }
  
      memory.loginFails[ip].push(Date.now());
  
      // keep last 1 min
      memory.loginFails[ip] = memory.loginFails[ip].filter(
        (t) => Date.now() - t < 60000
      );
  
      if (memory.loginFails[ip].length >= 5) {
        alerts.push({
          type: "BRUTE_FORCE",
          severity: "HIGH",
          message: `Multiple failed logins from ${ip}`,
        });
      }
    }
  
    // 🚨 PORT SCAN DETECTION
    if (log.event_type === "port_scan") {
      alerts.push({
        type: "PORT_SCAN",
        severity: "HIGH",
        message: `Port scan detected from ${ip}`,
      });
    }
  
    return alerts;
  }