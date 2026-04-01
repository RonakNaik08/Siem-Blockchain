import crypto from "crypto";

export const verifyLog = (req, res) => {
  const { log } = req.body;

  const recalculated = crypto
    .createHash("sha256")
    .update(JSON.stringify(log.data) + log.prevHash)
    .digest("hex");

  const valid = recalculated === log.hash;

  res.json({ verified: valid });
};