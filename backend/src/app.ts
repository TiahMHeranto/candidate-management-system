import express, { Application } from "express";
import cors from "cors";
import authRoutes from "./routes/authRoutes";
import candidateRoutes from "./routes/candidateRoutes";
import { limiter } from "./middlewares/rateLimiter";

const app: Application = express();

// Middleware
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json());
app.use(limiter);

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/candidates", candidateRoutes);

export default app;