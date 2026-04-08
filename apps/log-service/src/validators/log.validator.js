/**
 * Validates an incoming log payload.
 * Returns { error } if invalid, or { value } if clean.
 */
export function validateLog(data) {
  const errors = [];

  if (!data || typeof data !== "object") {
    return { error: "Payload must be a JSON object" };
  }

  if (data.message !== undefined && typeof data.message !== "string") {
    errors.push("message must be a string");
  }

  const validLevels = ["info", "warn", "error", "debug", "critical"];
  if (data.level && !validLevels.includes(data.level)) {
    errors.push(`level must be one of: ${validLevels.join(", ")}`);
  }

  const validSeverities = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];
  if (data.severity && !validSeverities.includes(data.severity)) {
    errors.push(`severity must be one of: ${validSeverities.join(", ")}`);
  }

  if (errors.length > 0) {
    return { error: errors.join("; ") };
  }

  // Sanitize and return clean value
  return {
    value: {
      message: data.message || "",
      level: data.level || "info",
      severity: data.severity || "LOW",
      source: data.source || "unknown",
      type: data.type || "GENERIC",
      ip: data.ip || null,
      timestamp: data.timestamp || Date.now(),
      ...data,
    },
  };
}

/**
 * Express middleware — validates req.body as a log payload.
 */
export function logValidationMiddleware(req, res, next) {
  const { error, value } = validateLog(req.body);
  if (error) {
    return res.status(400).json({ error });
  }
  req.body = value;
  next();
}
