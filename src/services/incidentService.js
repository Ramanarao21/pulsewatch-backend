import { prisma } from "../db/prisma.js";
import { emitToUser } from "../socket.js";
import { sendEmail } from "./emailService.js";
import { incidentCreatedTemplate, incidentResolvedTemplate } from "../templates/emailTemplates.js";

export const handleIncident = async (currentStatus, errorMessage, service) => {
  const lastThree = await prisma.serviceLog.findMany({
    where: { serviceId: service.id },
    orderBy: { checkedAt: "desc" },
    take: 3,
    select: { status: true },
  });

  const allDown =
    lastThree.length === 3 && lastThree.every((r) => r.status === "DOWN");

  const activeIncident = await prisma.incident.findFirst({
    where: { serviceId: service.id, resolvedAt: null },
  });

  if (allDown && !activeIncident) {
    const incident = await prisma.incident.create({ data: { status: "ONGOING", serviceId: service.id } });
    const time = incident.startedAt.toISOString();
    console.log(`🚨 INCIDENT CREATED [${service.name}]`);

    // Emit only to the service owner
    emitToUser(service.userId, "incident-created", {
      id: incident.id,
      serviceId: service.id,
      serviceName: service.name,
      status: "ONGOING",
      startedAt: time,
      resolvedAt: null,
    });

    await sendEmail(incidentCreatedTemplate({ errorMessage, time, serviceUrl: service.url, serviceName: service.name }));
  }

  if (currentStatus === "UP" && activeIncident) {
    const resolvedAt = new Date();
    await prisma.incident.updateMany({
      where: { serviceId: service.id, resolvedAt: null },
      data: { status: "RESOLVED", resolvedAt },
    });
    console.log(`✅ INCIDENT RESOLVED [${service.name}]`);

    // Emit only to the service owner
    emitToUser(service.userId, "incident-resolved", {
      id: activeIncident.id,
      serviceId: service.id,
      serviceName: service.name,
      status: "RESOLVED",
      startedAt: activeIncident.startedAt,
      resolvedAt: resolvedAt.toISOString(),
    });

    await sendEmail(
      incidentResolvedTemplate({
        startedAt: activeIncident.startedAt,
        resolvedAt: resolvedAt.toISOString(),
        serviceUrl: service.url,
        serviceName: service.name,
      })
    );
  }
};
