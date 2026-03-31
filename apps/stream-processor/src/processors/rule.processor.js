export const processRules = (log) => {
    const threatKeywords = ["unauthorized", "failed", "attack"];
  
    const isThreat = threatKeywords.some((word) =>
      log.message.toLowerCase().includes(word)
    );
  
    return { isThreat };
  };