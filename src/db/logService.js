import { prisma } from "./prisma.js";

export const getRecentLogs = (limit = 20) =>
  prisma.serviceLog.findMany({
    orderBy: { checkedAt: "desc" },
    take: limit,
  });

export const getLogsByUserId = async (userId, limit = 20) => {
  const userServices = await prisma.service.findMany({
    where: { userId },
    select: { id: true },
  });
  const serviceIds = userServices.map((s) => s.id);

  return prisma.serviceLog.findMany({
    where: { serviceId: { in: serviceIds } },
    orderBy: { checkedAt: "desc" },
    take: limit,
    include: { service: { select: { name: true, url: true } } },
  });
};

export const getLogsByServiceId = (serviceId, limit = 20) =>
  prisma.serviceLog.findMany({
    where: { serviceId },
    orderBy: { checkedAt: "desc" },
    take: limit,
  });

export const getUptimeStats = async () => {
  const total = await prisma.serviceLog.count();
  const up = await prisma.serviceLog.count({ where: { status: "UP" } });
  const avgDuration = await prisma.serviceLog.aggregate({ _avg: { duration: true } });

  return {
    total,
    up,
    down: total - up,
    uptimePercent: total === 0 ? 100 : parseFloat(((up / total) * 100).toFixed(2)),
    avgResponseTime: Math.round(avgDuration._avg.duration ?? 0),
  };
};

export const getUptimeStatsByUserId = async (userId) => {
  const userServices = await prisma.service.findMany({
    where: { userId },
    select: { id: true },
  });
  const serviceIds = userServices.map((s) => s.id);

  const total = await prisma.serviceLog.count({ where: { serviceId: { in: serviceIds } } });
  const up = await prisma.serviceLog.count({ where: { serviceId: { in: serviceIds }, status: "UP" } });
  const avgDuration = await prisma.serviceLog.aggregate({
    where: { serviceId: { in: serviceIds } },
    _avg: { duration: true },
  });

  return {
    total,
    up,
    down: total - up,
    uptimePercent: total === 0 ? 100 : parseFloat(((up / total) * 100).toFixed(2)),
    avgResponseTime: Math.round(avgDuration._avg.duration ?? 0),
  };
};
