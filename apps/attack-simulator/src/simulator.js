import axios from "axios";

const sendLog = async (log) => {
  await axios.post("http://localhost:5000/api/logs", log);
};

// brute force attack
export const bruteForce = () => {
  return setInterval(() => {
    sendLog({
      type: "FAILED_LOGIN",
      message: "Invalid password",
      ip: "192.168.1.10",
      timestamp: Date.now()
    });
  }, 200);
};

// ddos attack
export const ddos = () => {
  return setInterval(() => {
    sendLog({
      type: "REQUEST",
      ip: "10.0.0.5",
      requests: Math.floor(Math.random() * 500),
      timestamp: Date.now()
    });
  }, 100);
};