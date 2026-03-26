// src/models/Candidate.ts
import mongoose, { Schema, Document } from "mongoose";

export interface ICandidate extends Document {
  name: string;
  email: string;
  phone: string;
  position: string;
  experience: number;
  skills: string[];
  status: "pending" | "validated";
  isDeleted: boolean;
  deletedAt?: Date;
}

const CandidateSchema = new Schema<ICandidate>(
  {
    name: {
      type: String,
      required: [true, "Le nom est requis"],
      trim: true,
      minlength: [2, "Le nom doit contenir au moins 2 caractères"],
      maxlength: [100, "Le nom ne peut pas dépasser 100 caractères"],
    },
    email: {
      type: String,
      required: [true, "L'email est requis"],
      unique: [true, "Cet email est déjà utilisé"],
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, "Veuillez fournir un email valide (exemple: nom@domaine.com)"],
    },
    phone: {
      type: String,
      required: [true, "Le numéro de téléphone est requis"],
      trim: true,
      match: [/^[0-9+\-\s]{10,}$/, "Veuillez fournir un numéro de téléphone valide (chiffres, espaces, tirets, + acceptés)"],
    },
    position: {
      type: String,
      required: [true, "Le poste est requis"],
      trim: true,
      minlength: [2, "Le poste doit contenir au moins 2 caractères"],
    },
    experience: {
      type: Number,
      required: [true, "Les années d'expérience sont requises"],
      min: [0, "L'expérience ne peut pas être négative"],
      max: [50, "L'expérience ne peut pas dépasser 50 ans"],
    },
    skills: {
      type: [String],
      required: [true, "Au moins une compétence est requise"],
      validate: {
        validator: (v: string[]) => v.length > 0,
        message: "Ajoutez au moins une compétence",
      },
    },
    status: {
      type: String,
      enum: {
        values: ["pending", "validated"],
        message: "Le statut doit être 'pending' (en attente) ou 'validated' (validé)",
      },
      default: "pending",
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
  },
  { 
    timestamps: true
  }
);

// Index pour améliorer les performances des requêtes
CandidateSchema.index({ status: 1 });
CandidateSchema.index({ isDeleted: 1 });

export default mongoose.model<ICandidate>("Candidate", CandidateSchema);