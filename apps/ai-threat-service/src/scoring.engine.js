/**
 * Heuristic/AI Scoring Engine
 * Simulates threat detection for complex patterns
 */

const SUSPICIOUS_KEYWORDS = [
  "UNION SELECT", "DROP TABLE", "--", ";", // SQLi
  "../../", "/etc/passwd", "cmd.exe",    // Path Traversal
  "<script>", "alert(", "onload="       // XSS
];

export const analyzeLog = (log) => {
  let score = 0;
  let reason = [];

  const raw = JSON.stringify(log).toUpperCase();

  // 1. Keyword detection
  SUSPICIOUS_KEYWORDS.forEach(kw => {
    if (raw.includes(kw.toUpperCase())) {
      score += 30;
      reason.push(`Suspicious keyword: ${kw}`);
    }
  });

  // 2. Structural anomalies
  if (log.method === "POST" && (!log.body || Object.keys(log.body).length === 0)) {
    score += 15;
    reason.push("Empty POST body on sensitive route");
  }

  // 3. Rate-based (if passed in)
  if (log.requestsPerSecond > 50) {
    score += 20;
    reason.push("High requests per second detected by sensor");
  }

  // 4. User-agent anomalies
  const ua = (log.userAgent || "").toLowerCase();
  if (ua.includes("sqlmap") || ua.includes("nmap") || ua.includes("python-requests")) {
    score += 40;
    reason.push("Known attack tool/library string in User-Agent");
  }

  return {
    score: Math.min(score, 100),
    isAnomaly: score > 50,
    reasons: reason
  };
};
