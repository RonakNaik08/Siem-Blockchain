import crypto from "crypto";

function sha256(data) {
  return crypto.createHash("sha256").update(data).digest("hex");
}

/**
 * Build a Merkle root from an array of strings (hashes).
 */
export function buildMerkleRoot(items) {
  if (!items || items.length === 0) return null;

  let leaves = items.map((item) => sha256(JSON.stringify(item)));

  while (leaves.length > 1) {
    const next = [];
    for (let i = 0; i < leaves.length; i += 2) {
      if (i + 1 < leaves.length) {
        next.push(sha256(leaves[i] + leaves[i + 1]));
      } else {
        next.push(leaves[i]); // odd leaf carries up
      }
    }
    leaves = next;
  }

  return leaves[0];
}