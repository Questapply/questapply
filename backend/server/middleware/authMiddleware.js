import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || "your-secure-jwt-secret";

const PUBLIC_PATHS = new Set([
  "/health",
  "/api/auth/login",
  "/api/auth/register",
  "/api/auth/forgot",
]);

// سخت‌گیر (بدون مهمان)
export const authenticateToken = (req, res, next) => {
  if (req.method === "OPTIONS") return res.sendStatus(204);
  if (PUBLIC_PATHS.has(req.path)) return next();

  const authHeader = req.headers["authorization"] || "";
  const token = authHeader?.split(" ")[1];

  if (!token) {
    console.log("[auth] No token provided");
    return res.sendStatus(401);
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      console.log("[auth] Token verification failed:", err.message);
      return res.sendStatus(403);
    }

    req.user = {
      id: user.id || user.user_id || user.ID || null,
      email: user.email || user.user_email || null,
    };

    console.log("[auth] Token verified for:", req.user.email);
    next();
  });
};

// اختیاری (guest مجاز)
export const authenticateTokenOptional = (req, res, next) => {
  if (req.method === "OPTIONS") return res.sendStatus(204);
  if (PUBLIC_PATHS.has(req.path)) {
    req.user = null;
    return next();
  }

  const authHeader = req.headers["authorization"] || "";
  const token = authHeader?.split(" ")[1];

  if (!token) {
    console.log("[authOptional] No token → guest");
    req.user = null;
    return next();
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      console.log("[authOptional] Token failed → guest:", err.message);
      req.user = null;
      return next();
    }

    req.user = {
      id: user.id || user.user_id || user.ID || null,
      email: user.email || user.user_email || null,
    };

    console.log("[authOptional] Token OK for:", req.user.email);
    next();
  });
};
