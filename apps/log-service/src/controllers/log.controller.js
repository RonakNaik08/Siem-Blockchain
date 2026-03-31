import * as service from "../services/log.service.js";

export const createLog = async (req, res) => {
  const log = await service.addLog(req.body);
  res.json(log);
};

export const getLogs = async (req, res) => {
  const logs = await service.fetchLogs();
  res.json(logs);
};