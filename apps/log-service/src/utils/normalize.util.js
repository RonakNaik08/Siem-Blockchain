export function normalizeLog(raw) {
    return {
      id: raw.id || crypto.randomUUID(),
      timestamp: raw.timestamp || new Date().toISOString(),
      source_ip: raw.source_ip || raw.ip || "unknown",
      event_type: raw.event_type || raw.type || "generic",
      severity: raw.severity || "low",
      message: raw.message || raw.msg || JSON.stringify(raw),
    };
  }