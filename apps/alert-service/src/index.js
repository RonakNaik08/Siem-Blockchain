import express from "express";
import cors from "cors";
import { createAlert } from "./alert.controller.js";

const app = express();

app.use(cors());
app.use(express.json());

app.post("/alerts", createAlert);

app.listen(5001, () => {
  console.log("🚀 Alert Service running on 5001");
});