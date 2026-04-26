import "dotenv/config";
import express from "express";
import http from "http";
import cors from "cors";
import cookieParser from "cookie-parser";
import { initSocket } from "./src/socket.js";
import { connectRabbitMQ, closeRabbitMQ } from "./src/queue/rabbitmq.js";
import { startProducer } from "./src/queue/producer.js";
import { startConsumer } from "./src/queue/consumer.js";
import routes from "./src/routes/index.js";
import authRoutes from "./src/routes/authRoutes.js";

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 4000;

initSocket(server);

app.use(cors({ origin: "*" }));
app.use(express.json());
app.use(cookieParser());
app.use("/auth", authRoutes);
app.use("/", routes);

// Initialize RabbitMQ and start producer/consumer
connectRabbitMQ()
  .then(() => {
    startProducer(); 
    startConsumer(); 
  })
  .catch((err) => {
    console.error("Failed to start RabbitMQ:", err);
    process.exit(1);
  });

// Graceful shutdown
process.on("SIGINT", async () => {
  console.log("Shutting down...");
  await closeRabbitMQ();
  process.exit(0);
});

server.listen(PORT, () => {
  console.log(`Monitoring server running on port ${PORT}`);
});
