// src/controllers/candidateController.ts
import { Request, Response } from "express";
import Candidate from "../models/Candidate";

export const createCandidate = async (req: Request, res: Response) => {
  try {
    const candidate = await Candidate.create(req.body);
    res.status(201).json(candidate);
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};

export const getCandidate = async (req: Request, res: Response) => {
  const candidate = await Candidate.findById(req.params.id);
  res.json(candidate);
};

export const updateCandidate = async (req: Request, res: Response) => {
  const candidate = await Candidate.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  );
  res.json(candidate);
};

export const deleteCandidate = async (req: Request, res: Response) => {
  await Candidate.findByIdAndUpdate(req.params.id, { isDeleted: true });
  res.json({ message: "Deleted (soft)" });
};

// async validation avec délai 2s
export const validateCandidate = async (req: Request, res: Response) => {
  setTimeout(async () => {
    await Candidate.findByIdAndUpdate(req.params.id, {
      status: "validated",
    });
  }, 2000);

  res.json({ message: "Validation en cours..." });
};