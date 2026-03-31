import EventEmitter from "events";

class LogEmitter extends EventEmitter {}
export const logEmitter = new LogEmitter();

logEmitter.on("log.created", (log) => {
  console.log("📢 Log created:", log._id);
});

logEmitter.on("log.tampered", (log) => {
  console.error("🚨 Tampered log:", log._id);
});