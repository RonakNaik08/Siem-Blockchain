import { sendEmail } from "./channels/email.js";
import { sendSlack } from "./channels/slack.js";
import { sendWebhook } from "./channels/webhook.js";
import axios from "axios";

export const sendAlert = async (alert) => {
  console.log("🚨 ALERT:", alert.message);

  // 🔹 Send to channels
  await sendEmail(alert);
  await sendSlack(alert);
  await sendWebhook(alert);

  // 🔥 Send to your API gateway (for frontend)
  await axios.post("http://localhost:4000/alerts", {
    message: alert.message,
    type: "ALERT",
  });
};