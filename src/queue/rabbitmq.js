import amqp from "amqplib";

let connection = null;
let channel = null;

export const connectRabbitMQ = async () => {
  try {
    connection = await amqp.connect(process.env.RMQ_URL);
    channel = await connection.createChannel();

    // Declare queues
    await channel.assertQueue("service-checks", { durable: true });
    await channel.assertQueue("incident-alerts", { durable: true });

    console.log("✅ Connected to RabbitMQ");
    return channel;
  } catch (err) {
    console.error("❌ RabbitMQ connection failed:", err.message);
    throw err;
  }
};

export const getChannel = () => {
  if (!channel) throw new Error("RabbitMQ channel not initialized");
  return channel;
};

export const closeRabbitMQ = async () => {
  if (channel) await channel.close();
  if (connection) await connection.close();
  console.log("RabbitMQ connection closed");
};

// Publish message to queue
export const publishToQueue = (queueName, message) => {
  const ch = getChannel();
  ch.sendToQueue(queueName, Buffer.from(JSON.stringify(message)), { persistent: true });
};

// Consume messages from queue
export const consumeQueue = (queueName, callback) => {
  const ch = getChannel();
  ch.consume(queueName, (msg) => {
    if (msg) {
      const data = JSON.parse(msg.content.toString());
      callback(data);
      ch.ack(msg);
    }
  });
};
