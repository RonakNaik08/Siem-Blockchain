import axios from "axios";

const SLACK_WEBHOOK_URL = process.env.SLACK_WEBHOOK_URL;

const SEVERITY_EMOJI = {
  CRITICAL: "🚨",
  HIGH: "⚠️",
  MEDIUM: "🔔",
  LOW: "ℹ️",
};

/**
 * Sends a Slack notification for a security alert.
 * Only fires when SLACK_WEBHOOK_URL is set in .env
 */
export const sendSlackAlert = async ({ type, severity, message, ip, logId }) => {
  if (!SLACK_WEBHOOK_URL) return; // silently skip if not configured

  const emoji = SEVERITY_EMOJI[severity] || "🔔";
  const color = severity === "CRITICAL" ? "#ef4444"
    : severity === "HIGH" ? "#f97316"
    : severity === "MEDIUM" ? "#eab308"
    : "#22d3ee";

  const payload = {
    attachments: [
      {
        color,
        blocks: [
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: `${emoji} *${severity} ALERT — ${type.replace(/_/g, " ")}*\n${message || "Suspicious activity detected"}`,
            },
          },
          {
            type: "context",
            elements: [
              ip && { type: "mrkdwn", text: `🌐 *IP:* \`${ip}\`` },
              logId && { type: "mrkdwn", text: `🔗 *Log ID:* \`${logId}\`` },
              { type: "mrkdwn", text: `🕐 *Time:* ${new Date().toISOString()}` },
            ].filter(Boolean),
          },
          {
            type: "divider",
          },
        ],
      },
    ],
  };

  try {
    await axios.post(SLACK_WEBHOOK_URL, payload, { timeout: 3000 });
    console.log(`📣 Slack alert sent: [${severity}] ${type}`);
  } catch (err) {
    console.warn("⚠ Slack alert failed:", err.message);
  }
};

/**
 * Sends a Slack digest of a batch of logs (e.g. on Merkle anchor).
 */
export const sendSlackDigest = async ({ merkleRoot, logCount, txHash }) => {
  if (!SLACK_WEBHOOK_URL) return;

  const payload = {
    text: `📦 *Blockchain Batch Anchored*\n• ${logCount} logs sealed\n• Merkle root: \`${merkleRoot?.slice(0, 20)}…\`${txHash ? `\n• TX: \`${txHash}\`` : ""}`,
  };

  try {
    await axios.post(SLACK_WEBHOOK_URL, payload, { timeout: 3000 });
  } catch (err) {
    console.warn("⚠ Slack digest failed:", err.message);
  }
};
