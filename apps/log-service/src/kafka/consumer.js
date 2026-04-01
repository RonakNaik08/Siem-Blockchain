import { Kafka } from "kafkajs";
import { broadcast } from "../../websocket-client.js";

const kafka = new Kafka({
  clientId: "stream-processor",
  brokers: ["localhost:9092"],
});

const consumer = kafka.consumer({ groupId: "siem-group" });

export const startConsumer = async () => {
  await consumer.connect();
  await consumer.subscribe({ topic: "logs", fromBeginning: false });

  await consumer.run({
    eachMessage: async ({ message }) => {
      const log = JSON.parse(message.value.toString());

      // 🔥 SIMPLE DETECTION ENGINE
      const threat = detectThreat(log);

      const enrichedLog = {
        ...log,
        threat,
      };

      // 🚀 SEND TO FRONTEND (REAL-TIME)
      broadcast(enrichedLog);
    },
  });
};

function detectThreat(log) {
  if (log.message.includes("failed")) return "brute-force";
  if (log.message.includes("unauthorized")) return "intrusion";
  return null;
}