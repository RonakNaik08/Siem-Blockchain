import { Kafka } from "kafkajs";
import { broadcast } from "../websocket/socket.server.js";

const kafka = new Kafka({
  clientId: "log-service-consumer",
  brokers: [process.env.KAFKA_BROKERS || "localhost:9092"],
});

const consumer = kafka.consumer({ groupId: "siem-group" });

export const startConsumer = async () => {
  await consumer.connect();
  await consumer.subscribe({ topic: "logs", fromBeginning: false });

  console.log("✅ Kafka consumer connected");

  await consumer.run({
    eachMessage: async ({ message }) => {
      try {
        const log = JSON.parse(message.value.toString());

        // 🔥 SIMPLE DETECTION ENGINE
        const threat = detectThreat(log);

        const enrichedLog = {
          ...log,
          threat,
        };

        // 🚀 SEND TO FRONTEND (REAL-TIME)
        broadcast(enrichedLog);
      } catch (err) {
        console.error("❌ Error processing Kafka message:", err.message);
      }
    },
  });
};

function detectThreat(log) {
  if (log.message?.includes("failed")) return "brute-force";
  if (log.message?.includes("unauthorized")) return "intrusion";
  return null;
}