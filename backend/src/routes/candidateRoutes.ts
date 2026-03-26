// src/routes/candidateRoutes.ts
import { Router } from "express";
import {
  createCandidate,
  getCandidate,
  updateCandidate,
  deleteCandidate,
  validateCandidate,
} from "../controllers/candidateController";
import { protect } from "../middlewares/authMiddleware";

const router = Router();

router.post("/", protect, createCandidate);
router.get("/:id", protect, getCandidate);
router.put("/:id", protect, updateCandidate);
router.delete("/:id", protect, deleteCandidate);
router.post("/:id/validate", protect, validateCandidate);

export default router;