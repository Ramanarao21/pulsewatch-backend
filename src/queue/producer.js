import cron from "node-cron";
import { getActiveServices } from "../db/serviceDbService.js";
import { publishToQueue } from "./rabbitmq.js";

export const startProducer = () => {
  cron.schedule("* * * * *", async () => {
    const services = await getActiveServices();
    if (services.length === 0) return console.log("No active services to monitor.");

    console.log(`📤 Publishing ${services.length} service check(s) to queue...`);
    
    services.forEach((service) => {
      publishToQueue("service-checks", {
        serviceId: service.id,
        serviceName: service.name,
        serviceUrl: service.url,
        userId: service.userId,
      });
    });
  });
};
