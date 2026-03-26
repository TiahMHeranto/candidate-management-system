import type { Application, Request, Response } from 'express';

const express = require('express')

const app: Application = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse JSON bodies (optional)
app.use(express.json());

// Define a basic route
app.get('/', (req: Request, res: Response) => {
  res.send('Hello, TypeScript + Express Server!');
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
