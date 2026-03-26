// src/controllers/candidateController.ts
import { Request, Response } from "express";
import Candidate from "../models/Candidate";

export const createCandidate = async (req: Request, res: Response) => {
  try {
    const candidate = await Candidate.create(req.body);
    res.status(201).json(candidate);
  } catch (err: any) {
    // Amélioration: message plus explicite selon le type d'erreur
    if (err.code === 11000) {
      res.status(400).json({ message: "Un candidat avec cet email existe déjà" });
    } else if (err.name === "ValidationError") {
      res.status(400).json({ message: "Données invalides: " + err.message });
    } else {
      res.status(400).json({ message: "Erreur lors de la création du candidat" });
    }
  }
};

export const getAllCandidates = async (req: Request, res: Response) => {
  try {
    const candidates = await Candidate.find({ isDeleted: false })
      .sort({ createdAt: -1 }); // Tri du plus récent au plus ancien
    
    res.json({
      count: candidates.length,
      candidates
    });
  } catch (err: any) {
    res.status(400).json({ message: "Erreur lors de la récupération des candidats" });
  }
};

export const getCandidate = async (req: Request, res: Response) => {
  const candidate = await Candidate.findById(req.params.id);
  
  if (!candidate) {
    return res.status(404).json({ message: "Candidat non trouvé" });
  }
  
  res.json(candidate);
};

export const updateCandidate = async (req: Request, res: Response) => {
  const candidate = await Candidate.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  );
  
  if (!candidate) {
    return res.status(404).json({ message: "Candidat non trouvé" });
  }
  
  res.json(candidate);
};

export const deleteCandidate = async (req: Request, res: Response) => {
  const candidate = await Candidate.findByIdAndUpdate(req.params.id, { isDeleted: true });
  
  if (!candidate) {
    return res.status(404).json({ message: "Candidat non trouvé" });
  }
  
  res.json({ message: "Candidat supprimé avec succès" });
};

// async validation avec délai 2s
export const validateCandidate = async (req: Request, res: Response) => {
  const candidate = await Candidate.findById(req.params.id);
  
  if (!candidate) {
    return res.status(404).json({ message: "Candidat non trouvé" });
  }
  
  if (candidate.status === "validated") {
    return res.status(400).json({ message: "Ce candidat est déjà validé" });
  }
  
  setTimeout(async () => {
    await Candidate.findByIdAndUpdate(req.params.id, {
      status: "validated",
    });
  }, 2000);

  res.json({ message: "Validation en cours..." });
};