// src/models/Candidate.ts
import mongoose, { Schema, Document } from "mongoose";

export interface ICandidate extends Document {
  name: string;
  email: string;
  status: "pending" | "validated";
  isDeleted: boolean;
}

const CandidateSchema = new Schema<ICandidate>(
  {
    name: {
      type: String,
      required: [true, "Nom requis"],
    },
    email: {
      type: String,
      required: [true, "Email requis"],
    },
    status: {
      type: String,
      enum: ["pending", "validated"],
      default: "pending",
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export default mongoose.model<ICandidate>("Candidate", CandidateSchema);