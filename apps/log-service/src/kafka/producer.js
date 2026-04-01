import { Kafka } from "kafkajs";

const kafka = new Kafka({
  clientId: "log-service",
  brokers: ["localhost:9092"],
});

export const producer = kafka.producer();

export const connectProducer = async () => {
  await producer.connect();
  console.log("✅ Kafka Producer Connected");
};

export const sendLog = async (log) => {
  await producer.send({
    topic: "logs",
    messages: [
      {
        value: JSON.stringify(log),
      },
    ],
  });
};