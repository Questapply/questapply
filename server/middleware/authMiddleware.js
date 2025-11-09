import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || "your-secure-jwt-secret";
// Middleware for token verification
const PUBLIC_PATHS = new Set([
  "/health",
  "/api/auth/login",
  "/api/auth/register",
  "/api/auth/forgot",
]);

export const authenticateToken = (req, res, next) => {
  if (req.method === "OPTIONS") return res.sendStatus(204);
  if (PUBLIC_PATHS.has(req.path)) return next();
  const authHeader = req.headers["authorization"] || "";

  const token = authHeader?.split(" ")[1];

  if (!token) {
    console.log("No token provided");
    return res.sendStatus(401);
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      console.log("0.5 Token verification failed:", err.message);
      return res.sendStatus(403);
    }
    console.log("0.6 Token verified successfully for user:", user.email);
    req.user = user;
    next();
  });
};

// NEW: optional
export const authenticateTokenOptional = (req, res, next) => {
  const authHeader = req.headers["authorization"] || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
  if (!token) {
    req.user = null;
    return next();
  }
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    // اگر توکن مشکل داشت، کاربر را مهمان فرض کن اما مسیر را نبند
    req.user = err ? null : user;
    next();
  });
};
