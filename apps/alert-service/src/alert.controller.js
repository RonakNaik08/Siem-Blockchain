import { sendAlert } from "./alert.service.js";

export const createAlert = async (req, res) => {
  try {
    const alert = req.body;

    await sendAlert(alert);

    res.json({ success: true });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Alert failed" });
  }
};