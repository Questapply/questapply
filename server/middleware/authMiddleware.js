import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || "your-secure-jwt-secret";
// Middleware for token verification
export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
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
