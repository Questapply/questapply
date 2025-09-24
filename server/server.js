import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, ".env") });
console.log("[env] PAYPAL_ENV =", process.env.PAYPAL_ENV);
console.log(
  "[env] PAYPAL_CLIENT_ID prefix =",
  (process.env.PAYPAL_CLIENT_ID || "").slice(0, 8)
);
console.log("[env] PAYPAL_SECRET set =", !!process.env.PAYPAL_SECRET);
import express from "express";
import cors from "cors";
import programRoutes from "./routes/programRoutes.js";
import professorRoutes from "./routes/professorsRoutes.js";
import resumeRoutes from "./routes/resumeRoutes.js";
import sopRoutes from "./routes/sopRoutes.js";
import lorRoutes from "./routes/lorRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import schoolRoutes from "./routes/schoolRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import statesRoutes from "./routes/statesRoutes.js";
import imageProxyRoutes from "./routes/imageProxyRoutes.js";
import submissionRoutes from "./routes/submissionRoutes.js";
import paymentsRouter from "./routes/paymentsRouter.js";
import { authenticateToken } from "./middleware/authMiddleware.js";

// dotenv.config();

const app = express();

app.use(
  cors({
    origin: [
      "http://localhost:8080",
      "http://localhost:3000",
      "http://localhost:5173",
    ],
    credentials: true,
  })
);
app.use(express.json());

// API endpoint for authentication
app.use("/api/auth", authRoutes);

// API endpoint for USER form
app.use("/api/user", userRoutes);
// Use program routes with authentication
// Add this line before defining other API endpoints
app.use(
  "/api/program-data",
  (req, res, next) => {
    // Public paths that don't require authentication
    if (
      req.path === "/program-categories" ||
      req.path.startsWith("/program/")
    ) {
      next();
    } else {
      authenticateToken(req, res, next);
    }
  },
  programRoutes
);

//Use Professors routes with authentication
app.use("/api/professor-data", professorRoutes);

//Use Resume routes with authentication
app.use("/api/resume-data", resumeRoutes);

//Use SOP routes with authentication
app.use("/api/sop", sopRoutes);

//Use LOR routes with authentication
app.use("/api", lorRoutes);

//Use School routes with authentication

app.use("/api", schoolRoutes);

//Use States routes with authentication
app.use("/api", statesRoutes);

// Use submission routes
app.use("/api", submissionRoutes);

app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// Use  Payments routes
app.use("/api", paymentsRouter);

//Use image Prroxy
app.use("/api", imageProxyRoutes);

app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
