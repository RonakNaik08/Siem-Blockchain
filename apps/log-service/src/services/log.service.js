import * as repo from "../repositories/log.repository.js";
import { generateHash } from "../utils/hash.util.js";

export const addLog = async (logData) => {
  const hash = generateHash(logData);

  const log = await repo.createLog({
    logData,
    hash,
    verified: true
  });

  return log;
};

export const fetchLogs = async () => repo.getLogs();