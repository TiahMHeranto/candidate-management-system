// src/controllers/authController.ts
import { Request, Response } from "express";
import User from "../models/User";
import jwt from "jsonwebtoken";

export const register = async (req: Request, res: Response) => {
  try {
    const user = await User.create(req.body);
    res.status(201).json(user);
  } catch (err: any) {
    // Amélioration: messages plus explicites selon le type d'erreur
    if (err.code === 11000) {
      const field = Object.keys(err.keyPattern)[0];
      if (field === 'email') {
        return res.status(400).json({ message: "Cet email est déjà utilisé" });
      }
      if (field === 'username') {
        return res.status(400).json({ message: "Ce nom d'utilisateur est déjà pris" });
      }
      return res.status(400).json({ message: "Un compte avec ces informations existe déjà" });
    }
    
    if (err.name === "ValidationError") {
      return res.status(400).json({ message: "Données invalides: " + err.message });
    }
    
    res.status(400).json({ message: "Erreur lors de l'inscription" });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) return res.status(404).json({ message: "Aucun compte associé à cet email" });

    const isMatch = await user.comparePassword(req.body.password);
    if (!isMatch) return res.status(401).json({ message: "Mot de passe incorrect" });

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET as string,
      { expiresIn: "1d" }
    );

    res.json({ token });
  } catch (err: any) {
    res.status(500).json({ message: "Erreur lors de la connexion" });
  }
};

export const getUser = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const user = await User.findById(userId).select("-password");
    
    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }
    
    res.json(user);
  } catch (err: any) {
    res.status(500).json({ message: "Erreur lors de la récupération du profil" });
  }
};