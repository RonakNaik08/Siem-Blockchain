const memory = {
  ips: {},      // IP based tracking
  users: {},    // User based tracking
  volume: {},   // Total volume per IP
};

export const correlate = (log) => {
  const ip = log.ip || "unknown";
  const user = log.userId || log.username || "anonymous";
  const timestamp = new Date(log.timestamp || Date.now()).getTime();

  // Initialize storage
  if (!memory.ips[ip]) memory.ips[ip] = { failed: 0, success: 0, lastSeen: timestamp, resources: new Set() };
  if (!memory.users[user]) memory.users[user] = { lastIp: ip, lastSeen: timestamp, resources: new Set() };
  if (!memory.volume[ip]) memory.volume[ip] = { bytes: 0, lastReset: timestamp };

  // --- Rule 1: Brute Force Success (Improved) ---
  if (log.type === "FAILED_LOGIN") memory.ips[ip].failed++;
  if (log.type === "LOGIN_SUCCESS") {
    if (memory.ips[ip].failed >= 5) {
      memory.ips[ip].failed = 0; // reset
      return { type: "BRUTE_FORCE_SUCCESS", severity: "CRITICAL", ip, user, details: "Multiple failures followed by success" };
    }
  }

  // --- Rule 2: Impossible Travel ---
  if (memory.users[user].lastIp && memory.users[user].lastIp !== ip) {
    const timeDiff = (timestamp - memory.users[user].lastSeen) / 1000; // seconds
    // Simulating "Impossible" if IP changes in < 60 seconds (across different subnets usually)
    if (timeDiff < 60 && timeDiff > 0) {
      return { 
        type: "IMPOSSIBLE_TRAVEL", 
        severity: "HIGH", 
        user, 
        details: `User moved from ${memory.users[user].lastIp} to ${ip} in ${Math.round(timeDiff)}s` 
      };
    }
  }
  memory.users[user].lastIp = ip;
  memory.users[user].lastSeen = timestamp;

  // --- Rule 3: Data Exfiltration ---
  const bytes = parseInt(log.bytesSent || 0);
  const FIVE_MINUTES = 5 * 60 * 1000;
  if (timestamp - memory.volume[ip].lastReset > FIVE_MINUTES) {
    memory.volume[ip].bytes = 0;
    memory.volume[ip].lastReset = timestamp;
  }
  memory.volume[ip].bytes += bytes;
  
  if (memory.volume[ip].bytes > 1024 * 1024 * 1024) { // 1GB threshold
    return { type: "DATA_EXFILTRATION", severity: "CRITICAL", ip, details: "Over 1GB transferred in 5 minutes" };
  }

  // --- Rule 4: Lateral Movement ---
  if (log.resourceId) {
    memory.users[user].resources.add(log.resourceId);
    if (memory.users[user].resources.size > 10) {
      return { type: "LATERAL_MOVEMENT", severity: "HIGH", user, details: "Extensive resource access detected" };
    }
  }

  return null;
};