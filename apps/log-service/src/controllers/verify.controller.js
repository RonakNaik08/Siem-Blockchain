import { verifyLogIntegrity } from "../services/integrity.service.js";

export const verifyLog = async (req, res) => {
  const result = await verifyLogIntegrity(req.params.id);
  res.json(result);
};