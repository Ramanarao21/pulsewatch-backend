import axios from "axios";
import cron from "node-cron";
import { prisma } from "../db/prisma.js";
import { emitToUser } from "../socket.js";
import { handleIncident } from "./incidentService.js";
import { getActiveServices, updateLastChecked } from "../db/serviceDbService.js";

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

const checkService = async (service) => {
  const start = Date.now();

  try {
    const response = await axios.get(service.url);
    const duration = Date.now() - start;

    await prisma.serviceLog.create({ data: { status: "UP", duration, serviceId: service.id } });
    await updateLastChecked(service.id);
    
    // Emit only to the service owner
    emitToUser(service.userId, "status-update", {
      serviceId: service.id,
      serviceName: service.name,
      status: "UP",
      responseTime: duration,
      time: new Date().toISOString(),
    });
    
    console.log(`🟢 [${service.name}] UP | ${duration} ms`);
    await handleIncident("UP", null, service);
  } catch (error) {
    const duration = Date.now() - start;
    const errorMessage = resolveError(error);

    await prisma.serviceLog.create({ data: { status: "DOWN", duration, errorMessage, serviceId: service.id } });
    await updateLastChecked(service.id);
    
    // Emit only to the service owner
    emitToUser(service.userId, "status-update", {
      serviceId: service.id,
      serviceName: service.name,
      status: "DOWN",
      responseTime: duration,
      time: new Date().toISOString(),
      errorMessage,
    });
    
    console.log(`🔴 [${service.name}] DOWN | ${duration} ms | ${errorMessage}`);
    await handleIncident("DOWN", errorMessage, service);
  }
};

export const startCron = () => {
  cron.schedule("* * * * *", async () => {
    const services = await getActiveServices();
    if (services.length === 0) return console.log("No active services to monitor.");
    console.log(`Checking ${services.length} service(s)...`);
    await Promise.all(services.map(checkService));
  });
};
