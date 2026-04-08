import { generateHash } from "../utils/hash.util.js";

let lastHash = "0";

export const createLogWithHash = (log) => {
  const dataToHash = {
    ...log,
    prevHash: lastHash,
  };

  const hash = generateHash(dataToHash);

  const result = {
    ...log,
    hash,
    prevHash: lastHash,
  };

  lastHash = hash;

  return result;
};