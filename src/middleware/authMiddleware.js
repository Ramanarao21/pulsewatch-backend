import { verifyToken } from "../services/authService.js";

export const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.replace("Bearer ", "") || req.cookies?.token;

  if (!token) {
    return res.status(401).json({ success: false, error: "Unauthorized - No token provided" });
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    return res.status(401).json({ success: false, error: "Unauthorized - Invalid token" });
  }

  req.user = decoded; // { userId, email }
  next();
};
