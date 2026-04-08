import axios from "axios";

setInterval(() => {
  axios.post("http://localhost:5000/logs", {
    type: "FAILED_LOGIN",
    message: "Brute force attempt",
    ip: "192.168.1.100",
  });

  console.log("Attack log sent");
}, 2000);