import { Router } from "express";
import { getRecentLogs, getUptimeStats, getLogsByUserId, getUptimeStatsByUserId, getLogsByServiceId } from "../db/logService.js";
import { getAllIncidents, getActiveIncident, getIncidentsByUserId, getActiveIncidentByUserId, getIncidentsByServiceId } from "../db/incidentService.js";
import { createService, getAllServices, toggleService, deleteService } from "../db/serviceDbService.js";
import { authenticate } from "../middleware/authMiddleware.js";

const router = Router();

router.get("/", (req, res) => {
  res.send("Monitoring running...");
});

// Public routes (all logs/incidents across all users)
router.get("/api/logs", async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 20;
    const logs = await getRecentLogs(limit);
    res.json({ success: true, data: logs });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get("/api/stats", async (req, res) => {
  try {
    const stats = await getUptimeStats();
    res.json({ success: true, data: stats });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get("/api/incidents", async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 20;
    const incidents = await getAllIncidents(limit);
    res.json({ success: true, data: incidents });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get("/api/incidents/active", async (req, res) => {
  try {
    const incident = await getActiveIncident();
    res.json({ success: true, data: incident });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Protected routes (user-specific data)
router.get("/api/services", authenticate, async (req, res) => {
  try {
    const services = await getAllServices(req.user.userId);
    res.json({ success: true, data: services });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post("/api/services", authenticate, async (req, res) => {
  try {
    const { name, url } = req.body;
    if (!name || !url) return res.status(400).json({ success: false, error: "name and url are required" });
    const service = await createService(name, url, req.user.userId);
    res.status(201).json({ success: true, data: service });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.patch("/api/services/:id/toggle", authenticate, async (req, res) => {
  try {
    const { is_active } = req.body;
    const service = await toggleService(parseInt(req.params.id), is_active, req.user.userId);
    res.json({ success: true, data: service });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.delete("/api/services/:id", authenticate, async (req, res) => {
  try {
    await deleteService(parseInt(req.params.id), req.user.userId);
    res.json({ success: true, message: "Service deleted" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// User-specific logs
router.get("/api/user/logs", authenticate, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 20;
    const logs = await getLogsByUserId(req.user.userId, limit);
    res.json({ success: true, data: logs });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Logs for a specific service
router.get("/api/services/:id/logs", authenticate, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 20;
    const logs = await getLogsByServiceId(parseInt(req.params.id), limit);
    res.json({ success: true, data: logs });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// User-specific stats
router.get("/api/user/stats", authenticate, async (req, res) => {
  try {
    const stats = await getUptimeStatsByUserId(req.user.userId);
    res.json({ success: true, data: stats });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// User-specific incidents
router.get("/api/user/incidents", authenticate, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 20;
    const incidents = await getIncidentsByUserId(req.user.userId, limit);
    res.json({ success: true, data: incidents });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Incidents for a specific service
router.get("/api/services/:id/incidents", authenticate, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 20;
    const incidents = await getIncidentsByServiceId(parseInt(req.params.id), limit);
    res.json({ success: true, data: incidents });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Active incident for user
router.get("/api/user/incidents/active", authenticate, async (req, res) => {
  try {
    const incident = await getActiveIncidentByUserId(req.user.userId);
    res.json({ success: true, data: incident });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
