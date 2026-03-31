import { processLog } from "../services/logProcessor.js";

router.post("/", async (req, res) => {
  const { message } = req.body;

  await processLog(message);

  res.json({ success: true });
});