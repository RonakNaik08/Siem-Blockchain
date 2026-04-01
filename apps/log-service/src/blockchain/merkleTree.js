import { sha256 } from "./hash.util.js";

export function buildMerkleRoot(logs) {
  if (!logs || logs.length === 0) return null;

  let leaves = logs.map((log) => sha256(JSON.stringify(log)));

  while (leaves.length > 1) {
    const nextLevel = [];

    for (let i = 0; i < leaves.length; i += 2) {
      if (i + 1 < leaves.length) {
        nextLevel.push(sha256(leaves[i] + leaves[i + 1]));
      } else {
        nextLevel.push(leaves[i]);
      }
    }

    leaves = nextLevel;
  }

  return leaves[0];
}