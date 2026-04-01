import express from "express";
import http from "http";
import cors from "cors";

import { connectDB } from "./config/db.js";
import { ENV } from "./config/env.js";
import routes from "./routes/log.routes.js";
import { errorHandler } from "./middlewares/error.middleware.js";
import { logger } from "./utils/logger.util.js";
import { initSocket } from "./websocket/socket.server.js";

const app = express();
const server = http.createServer(app);

// 🔥 INIT SOCKET HERE (clean way)
initSocket(server);

// Middlewares
app.use(cors());
app.use(express.json());

// Request logging
app.use((req, res, next) => {
  logger.info({ url: req.url, method: req.method });
  next();
});

// Routes
app.use("/api/logs", routes);

// Error handler
app.use(errorHandler);

// DB connection
connectDB();

// Start server
server.listen(ENV.PORT, () => {
  console.log(`🚀 Server running on ${ENV.PORT}`);
});