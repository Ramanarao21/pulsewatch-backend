import axios from "axios";
import { prisma } from "../db/prisma.js";
import { emitToUser } from "../socket.js";
import { handleIncident } from "../services/incidentService.js";
import { updateLastChecked } from "../db/serviceDbService.js";
import { consumeQueue } from "./rabbitmq.js";

const resolveError = (error) => {
  if (error.response) return `HTTP ${error.response.status} - ${error.response.statusText}`;
  const codeMap = {
    ECONNREFUSED: "Connection refused - service not running",
    ETIMEDOUT: "Request timed out",
    ENOTFOUND: "DNS lookup failed - host not found",
    ECONNRESET: "Connection reset by server",
  };
  return codeMap[error.code] || error.message || "Unknown error";
};

const checkService = async (job) => {
  const { serviceId, serviceName, serviceUrl, userId } = job;
  const start = Date.now();

  try {
    const response = await axios.get(serviceUrl);
    const duration = Date.now() - start;

    await prisma.serviceLog.create({ data: { status: "UP", duration, serviceId } });
    await updateLastChecked(serviceId);

    emitToUser(userId, "status-update", {
      serviceId,
      serviceName,
      status: "UP",
      responseTime: duration,
      time: new Date().toISOString(),
    });

    console.log(`🟢 [${serviceName}] UP | ${duration} ms`);
    await handleIncident("UP", null, { id: serviceId, name: serviceName, url: serviceUrl, userId });
  } catch (error) {
    const duration = Date.now() - start;
    const errorMessage = resolveError(error);

    await prisma.serviceLog.create({ data: { status: "DOWN", duration, errorMessage, serviceId } });
    await updateLastChecked(serviceId);

    emitToUser(userId, "status-update", {
      serviceId,
      serviceName,
      status: "DOWN",
      responseTime: duration,
      time: new Date().toISOString(),
      errorMessage,
    });

    console.log(`🔴 [${serviceName}] DOWN | ${duration} ms | ${errorMessage}`);
    await handleIncident("DOWN", errorMessage, { id: serviceId, name: serviceName, url: serviceUrl, userId });
  }
};

export const startConsumer = () => {
  consumeQueue("service-checks", (job) => {
    console.log(`📥 Processing check for: ${job.serviceName}`);
    checkService(job);
  });
  console.log("✅ Consumer started, waiting for jobs...");
};
