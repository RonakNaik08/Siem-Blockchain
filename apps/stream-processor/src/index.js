import { startConsumer } from "./kafka/consumer.js";

await startConsumer();

console.log("🚀 Stream Processor Running");