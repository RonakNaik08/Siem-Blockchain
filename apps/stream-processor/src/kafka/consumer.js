import { Kafka } from "kafkajs";
import { processLog } from "../processor.js";

const kafka = new Kafka({
  clientId: "stream-processor",
  brokers: [process.env.KAFKA_BROKERS?.split(",") || ["localhost:9092"]],
});

const consumer = kafka.consumer({ groupId: "siem-stream-group" });

export const startConsumer = async () => {
  await consumer.connect();
  await consumer.subscribe({ topic: "logs", fromBeginning: false });

  console.log("✅ Kafka consumer connected — listening on topic: logs");

  await consumer.run({
    eachMessage: async ({ message }) => {
      try {
        const log = JSON.parse(message.value.toString());
        await processLog(log);
      } catch (err) {
        console.error("❌ Error processing Kafka message:", err.message);
      }
    },
  });
};
