import dotenv from "dotenv";
dotenv.config();

import type { Application, Request, Response } from 'express';
import { connectDB } from "./config/db";
import cors from "cors";

const express = require('express')

const app: Application = express();
const PORT = process.env.PORT

connectDB();

// Configuration CORS
app.use(cors({
  origin: "http://localhost:5174", // Ton frontend
  credentials: true, // Si tu utilises cookies/tokens dans headers
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

// Middleware to parse JSON bodies
app.use(express.json());

// Define a basic route
import authRoutes from "./routes/authRoutes";
import candidateRoutes from "./routes/candidateRoutes";
import { limiter } from "./middlewares/rateLimiter";

app.use(limiter);

app.use("/api/auth", authRoutes);
app.use("/api/candidates", candidateRoutes);

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${process.env.PORT}`);
});