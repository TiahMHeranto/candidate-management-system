// src/controllers/candidateController.ts
import { Request, Response } from "express";
import Candidate from "../models/Candidate";
import { log } from "../utils/logger";

export const validateCandidateJob = async (id: string) => {
  try {
    // simulation délai async (comme un vrai worker)
    await new Promise((resolve) => setTimeout(resolve, 2000));

    const candidate = await Candidate.findById(id);

    if (!candidate) return;

    await Candidate.findByIdAndUpdate(id, {
      status: "validated",
    });

    log("Candidate validated successfully", {
      event: "validation_completed",
      candidateId: id,
      email: candidate.email,
    });
  } catch (err: any) {
    log("Validation worker failed", {
      event: "validation_error",
      error: err.message,
      candidateId: id,
    });
  }
};

export const createCandidate = async (req: Request, res: Response) => {
  try {
    const candidate = await Candidate.create(req.body);
    
    // Log de succès
    log("Candidate created successfully", {
      event: "candidate_created",
      candidateId: candidate._id,
      email: candidate.email,
      position: candidate.position,
      ip: req.ip
    });
    
    res.status(201).json(candidate);
  } catch (err: any) {
    // Amélioration: message plus explicite selon le type d'erreur
    if (err.code === 11000) {
      // Log d'échec - doublon
      log("Candidate creation failed - duplicate email", {
        event: "candidate_creation_failed",
        reason: "duplicate_email",
        email: req.body.email,
        ip: req.ip
      });
      
      res.status(400).json({ message: "Un candidat avec cet email existe déjà" });
    } else if (err.name === "ValidationError") {
      // Log d'échec - validation
      log("Candidate creation failed - validation error", {
        event: "candidate_creation_failed",
        reason: "validation_error",
        errors: err.errors,
        ip: req.ip
      });
      
      res.status(400).json({ message: "Données invalides: " + err.message });
    } else {
      // Log d'erreur inattendue
      log("Candidate creation error", {
        event: "candidate_creation_error",
        error: err.message,
        stack: err.stack,
        ip: req.ip
      });
      
      res.status(400).json({ message: "Erreur lors de la création du candidat" });
    }
  }
};

export const getAllCandidates = async (req: Request, res: Response) => {
  try {
    const candidates = await Candidate.find({ isDeleted: false })
      .sort({ createdAt: -1 }); // Tri du plus récent au plus ancien
    
    // Log de succès
    log("Candidates retrieved successfully", {
      event: "candidates_retrieved",
      count: candidates.length,
      ip: req.ip
    });
    
    res.json({
      count: candidates.length,
      candidates
    });
  } catch (err: any) {
    // Log d'erreur
    log("Failed to retrieve candidates", {
      event: "candidates_retrieval_error",
      error: err.message,
      stack: err.stack,
      ip: req.ip
    });
    
    res.status(400).json({ message: "Erreur lors de la récupération des candidats" });
  }
};

export const getCandidate = async (req: Request, res: Response) => {
  try {
    const candidate = await Candidate.findById(req.params.id);
    
    if (!candidate) {
      // Log d'avertissement - non trouvé
      log("Candidate not found", {
        event: "get_candidate_failed",
        reason: "not_found",
        candidateId: req.params.id,
        ip: req.ip
      });
      
      return res.status(404).json({ message: "Candidat non trouvé" });
    }
    
    // Log de succès
    log("Candidate retrieved successfully", {
      event: "get_candidate_success",
      candidateId: candidate._id,
      email: candidate.email,
      ip: req.ip
    });
    
    res.json(candidate);
  } catch (err: any) {
    // Log d'erreur (ID invalide par exemple)
    log("Failed to retrieve candidate", {
      event: "get_candidate_error",
      error: err.message,
      candidateId: req.params.id,
      ip: req.ip
    });
    
    res.status(500).json({ message: "Erreur lors de la récupération du candidat" });
  }
};

export const updateCandidate = async (req: Request, res: Response) => {
  try {
    const candidate = await Candidate.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!candidate) {
      // Log d'avertissement - non trouvé
      log("Candidate not found for update", {
        event: "update_candidate_failed",
        reason: "not_found",
        candidateId: req.params.id,
        ip: req.ip
      });
      
      return res.status(404).json({ message: "Candidat non trouvé" });
    }
    
    // Log de succès
    log("Candidate updated successfully", {
      event: "candidate_updated",
      candidateId: candidate._id,
      email: candidate.email,
      changes: req.body,
      ip: req.ip
    });
    
    res.json(candidate);
  } catch (err: any) {
    // Log d'erreur
    log("Failed to update candidate", {
      event: "update_candidate_error",
      error: err.message,
      stack: err.stack,
      candidateId: req.params.id,
      ip: req.ip
    });
    
    res.status(500).json({ message: "Erreur lors de la mise à jour du candidat" });
  }
};

export const deleteCandidate = async (req: Request, res: Response) => {
  try {
    const candidate = await Candidate.findByIdAndUpdate(
      req.params.id, 
      { isDeleted: true, deletedAt: new Date() }
    );
    
    if (!candidate) {
      // Log d'avertissement - non trouvé
      log("Candidate not found for deletion", {
        event: "delete_candidate_failed",
        reason: "not_found",
        candidateId: req.params.id,
        ip: req.ip
      });
      
      return res.status(404).json({ message: "Candidat non trouvé" });
    }
    
    // Log de succès
    log("Candidate deleted successfully", {
      event: "candidate_deleted",
      candidateId: candidate._id,
      email: candidate.email,
      position: candidate.position,
      ip: req.ip
    });
    
    res.json({ message: "Candidat supprimé avec succès" });
  } catch (err: any) {
    // Log d'erreur
    log("Failed to delete candidate", {
      event: "delete_candidate_error",
      error: err.message,
      stack: err.stack,
      candidateId: req.params.id,
      ip: req.ip
    });
    
    res.status(500).json({ message: "Erreur lors de la suppression du candidat" });
  }
};

// async validation avec délai 2s
export const validateCandidate = async (req: Request, res: Response) => {
  try {
    const candidate = await Candidate.findById(req.params.id);

    if (!candidate) {
      log("Candidate not found for validation", {
        event: "validate_candidate_failed",
        reason: "not_found",
        candidateId: req.params.id,
        ip: req.ip,
      });

      return res.status(404).json({ message: "Candidat non trouvé" });
    }

    if (candidate.status === "validated") {
      log("Candidate already validated", {
        event: "validate_candidate_failed",
        reason: "already_validated",
        candidateId: candidate._id,
        email: candidate.email,
        ip: req.ip,
      });

      return res.status(400).json({ message: "Ce candidat est déjà validé" });
    }

    // 👉 marque "pending validation"
    await Candidate.findByIdAndUpdate(candidate._id, {
      status: "pending_validation",
    });

    log("Candidate validation queued", {
      event: "validation_queued",
      candidateId: candidate._id,
      email: candidate.email,
      ip: req.ip,
    });

    // 👉 envoie le job async
    process.nextTick(() => {
      validateCandidateJob(candidate._id.toString());
    });

    return res.json({
      message: "Validation en cours...",
      status: "pending",
    });
  } catch (err: any) {
    log("Failed to start validation", {
      event: "validate_candidate_error",
      error: err.message,
      stack: err.stack,
      candidateId: req.params.id,
      ip: req.ip,
    });

    return res.status(500).json({
      message: "Erreur lors du lancement de la validation",
    });
  }
};