export function detectTampering(blockchain) {
    const valid = blockchain.isValid();
  
    if (!valid) {
      return {
        alert: true,
        type: "BLOCKCHAIN_TAMPER",
        severity: "CRITICAL",
        message: "Blockchain integrity compromised"
      };
    }
  
    return { alert: false };
  }