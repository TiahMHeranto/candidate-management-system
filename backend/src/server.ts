import dotenv from "dotenv";
dotenv.config();

import type { Application, Request, Response } from 'express';
import { connectDB } from "./config/db";

const express = require('express')

const app: Application = express();
const PORT = process.env.PORT

connectDB();

// Middleware to parse JSON bodies
app.use(express.json());

// Define a basic route
app.get('/', (req: Request, res: Response) => {
  res.send('Hello, TypeScript + Express Server!');
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${process.env.PORT}`);
});
