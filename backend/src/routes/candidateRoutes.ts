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
import { limiter } from "../middlewares/rateLimiter";
import { validate, validateRequest } from "../middlewares/validation";
import { z } from "zod";

const router = Router();

// Schemas de validation
const createCandidateSchema = z.object({
  name: z.string().min(2, "Le nom doit contenir au moins 2 caractères").max(100, "Le nom ne peut pas dépasser 100 caractères").trim(),
  email: z.string().email("Email invalide").toLowerCase().trim(),
  phone: z.string().regex(/^[0-9+\-\s]{10,}$/, "Numéro de téléphone invalide (minimum 10 caractères)").trim(),
  position: z.string().min(2, "Le poste doit contenir au moins 2 caractères").trim(),
  experience: z.number().min(0, "L'expérience ne peut pas être négative").max(50, "L'expérience ne peut pas dépasser 50 ans"),
  skills: z.array(z.string()).min(1, "Au moins une compétence est requise"),
  status: z.enum(["pending", "validated"]).optional(),
});

const updateCandidateSchema = createCandidateSchema.partial();

const idParamSchema = z.object({
  id: z.string().regex(/^[0-9a-fA-F]{24}$/, "ID de candidat invalide"),
});

// Appliquer auth et rate limiting à toutes les routes
router.use(protect);
router.use(limiter);

// Routes avec validation
router.post("/", validate(createCandidateSchema), createCandidate);
router.get("/:id", validateRequest({ params: idParamSchema }), getCandidate);
router.put("/:id", validateRequest({ 
  params: idParamSchema, 
  body: updateCandidateSchema 
}), updateCandidate);
router.delete("/:id", validateRequest({ params: idParamSchema }), deleteCandidate);
router.post("/:id/validate", validateRequest({ params: idParamSchema }), validateCandidate);

export default router;