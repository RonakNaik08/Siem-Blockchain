export const buildMerkleRoot = (hashes) => {
    if (hashes.length === 1) return hashes[0];
  
    let next = [];
  
    for (let i = 0; i < hashes.length; i += 2) {
      const left = hashes[i];
      const right = hashes[i + 1] || left;
      next.push(left + right);
    }
  
    return buildMerkleRoot(next);
  };