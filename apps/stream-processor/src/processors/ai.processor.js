export const processAI = (log) => {
    const anomalyScore = Math.random();
  
    return {
      isAnomaly: anomalyScore > 0.7,
      score: anomalyScore,
    };
  };