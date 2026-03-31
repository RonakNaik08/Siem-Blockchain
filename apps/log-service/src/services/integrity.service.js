import * as repo from "../repositories/log.repository.js";
import { generateHash } from "../utils/hash.util.js";

export const verifyLogIntegrity = async (id) => {
  const log = await repo.getLogById(id);

  if (!log) throw new Error("Log not found");

  const recalculated = generateHash(log.logData);

  const isValid = recalculated === log.hash;

  if (!isValid) {
    await repo.updateLog(id, { verified: false });
  }

  return { isValid };
};