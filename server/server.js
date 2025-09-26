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

dotenv.config();

const app = express();
console.log("[BOOT] mailer-fix v3");

const DEFAULT_ORIGINS = [
  "http://localhost:5173",
  "http://localhost:3000",
  "http://localhost:8080",
];

// پنل PaaS: مثلا CORS_ORIGIN=https://app-react-533nd.apps.teh2.abrhapaas.com
const ENV_ORIGINS = (process.env.CORS_ORIGIN || "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

const ALLOWED_ORIGINS = [...new Set([...DEFAULT_ORIGINS, ...ENV_ORIGINS])];
console.log("[CORS] allowed =", ALLOWED_ORIGINS);

const originFn = (origin, cb) => {
  // درخواست‌های بدون Origin (curl/Postman/health) را آزاد کن
  if (!origin) return cb(null, true);
  if (ALLOWED_ORIGINS.includes(origin)) return cb(null, true);
  return cb(new Error("CORS_NOT_ALLOWED"));
};

// هدر Vary برای کش/CDN
app.use((req, res, next) => {
  res.header("Vary", "Origin");
  next();
});

// خود CORS باید قبل از همه‌ی روت‌ها باشد
app.use(
  cors({
    origin: originFn,
    credentials: true,
    methods: ["GET", "HEAD", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// پاسخ به preflight برای همه مسیرها
app.options(/.*/, cors({ origin: originFn, credentials: true }));

// اگر originFn خطا داد، این هندلر جلوی Crash را می‌گیرد
app.use((err, req, res, next) => {
  if (err?.message === "CORS_NOT_ALLOWED") {
    return res.status(403).json({ error: "CORS blocked" });
  }
  next(err);
});
// ---- پایان CORS ----

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
