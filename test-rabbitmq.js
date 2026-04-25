import "dotenv/config";
import { connectRabbitMQ, publishToQueue, closeRabbitMQ } from "./src/queue/rabbitmq.js";

const testPublish = async () => {
  try {
    await connectRabbitMQ();
    console.log("✅ Connected to RabbitMQ");

    publishToQueue("service-checks", {
      serviceId: 1,      
      serviceName: "Test Service",
      serviceUrl: "https://httpstat.us/200",
      userId: 1,
    });

    console.log("📤 Test job published to queue");
    console.log("Check your main server logs to see it being processed");

    setTimeout(async () => {
      await closeRabbitMQ();
      process.exit(0);
    }, 2000);
  } catch (err) {
    console.error("❌ Test failed:", err.message);
    process.exit(1);
  }
};

testPublish();
