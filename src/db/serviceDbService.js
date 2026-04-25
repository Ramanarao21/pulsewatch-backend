import { prisma } from "./prisma.js";

export const createService = (name, url, userId) =>
  prisma.service.create({ data: { name, url, userId } });

export const getAllServices = (userId) =>
  prisma.service.findMany({ where: { userId }, orderBy: { createdAt: "desc" } });

export const getActiveServices = () =>
  prisma.service.findMany({ where: { is_active: true } });

export const toggleService = (id, is_active, userId) =>
  prisma.service.update({ where: { id, userId }, data: { is_active } });

export const deleteService = (id, userId) =>
  prisma.service.delete({ where: { id, userId } });

export const updateLastChecked = (id) =>
  prisma.service.update({ where: { id }, data: { last_checked: new Date() } });
