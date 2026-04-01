import axios from "axios";

const URL = "http://localhost:5000/api/logs";

// 🚨 BRUTE FORCE SIMULATION
async function bruteForce() {
  for (let i = 0; i < 10; i++) {
    await axios.post(URL, {
      ip: "192.168.1.100",
      type: "login_fail",
      message: "Invalid password",
    });
  }
}

// 🚨 PORT SCAN
async function portScan() {
  await axios.post(URL, {
    ip: "10.0.0.5",
    type: "port_scan",
    message: "Scanning ports",
  });
}

// RUN
bruteForce();
setTimeout(portScan, 3000);