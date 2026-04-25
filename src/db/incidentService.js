import { prisma } from "./prisma.js";

export const getAllIncidents = (limit = 20) =>
  prisma.incident.findMany({
    orderBy: { startedAt: "desc" },
    take: limit,
  });

export const getIncidentsByUserId = async (userId, limit = 20) => {
  const userServices = await prisma.service.findMany({
    where: { userId },
    select: { id: true },
  });
  const serviceIds = userServices.map((s) => s.id);

  return prisma.incident.findMany({
    where: { serviceId: { in: serviceIds } },
    orderBy: { startedAt: "desc" },
    take: limit,
    include: { service: { select: { name: true, url: true } } },
  });
};

export const getIncidentsByServiceId = (serviceId, limit = 20) =>
  prisma.incident.findMany({
    where: { serviceId },
    orderBy: { startedAt: "desc" },
    take: limit,
  });

export const getActiveIncident = () =>
  prisma.incident.findFirst({ where: { resolvedAt: null } });

export const getActiveIncidentByUserId = async (userId) => {
  const userServices = await prisma.service.findMany({
    where: { userId },
    select: { id: true },
  });
  const serviceIds = userServices.map((s) => s.id);

  return prisma.incident.findFirst({
    where: { serviceId: { in: serviceIds }, resolvedAt: null },
    include: { service: { select: { name: true, url: true } } },
  });
};
