import { Router } from "express";
import { signup, login } from "../services/authService.js";

const router = Router();

// POST /auth/signup
router.post("/signup", async (req, res) => {
  try {
    const { email, password, name } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, error: "Email and password required" });
    }
    const result = await signup(email, password, name);
    res.status(201).json({ success: true, data: result });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// POST /auth/login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, error: "Email and password required" });
    }
    const result = await login(email, password);
    res.json({ success: true, data: result });
  } catch (err) {
    res.status(401).json({ success: false, error: err.message });
  }
});

// GET /auth/me (protected)
router.get("/me", async (req, res) => {
  const token = req.headers.authorization?.replace("Bearer ", "");
  if (!token) return res.status(401).json({ success: false, error: "No token" });

  const { verifyToken } = await import("../services/authService.js");
  const decoded = verifyToken(token);
  if (!decoded) return res.status(401).json({ success: false, error: "Invalid token" });

  res.json({ success: true, data: { userId: decoded.userId, email: decoded.email } });
});

export default router;
