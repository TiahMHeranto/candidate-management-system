// src/__tests__/models/candidate.model.test.ts
import mongoose from "mongoose";
import Candidate from "../../models/Candidate";
import { connectDB, clearDB, closeDB } from "../helpers/db";

// Données valides de base — on part de ça pour chaque test
const validData = {
  name: "Alice Dupont",
  email: "alice@example.com",
  phone: "0601020304",
  position: "Développeur",
  experience: 3,
  skills: ["TypeScript", "Node.js"],
};

beforeAll(async () => await connectDB());
afterEach(async () => await clearDB());
afterAll(async () => await closeDB());

// ─── VALEURS PAR DÉFAUT ──────────────────────────────────────────
describe("Valeurs par défaut", () => {
  it("status doit être 'pending' par défaut", async () => {
    const candidate = await Candidate.create(validData);
    expect(candidate.status).toBe("pending");
  });

  it("isDeleted doit être false par défaut", async () => {
    const candidate = await Candidate.create(validData);
    expect(candidate.isDeleted).toBe(false);
  });

  it("deletedAt doit être null par défaut", async () => {
    const candidate = await Candidate.create(validData);
    expect(candidate.deletedAt).toBeNull();
  });
});

// ─── CHAMP : name ────────────────────────────────────────────────
describe("Validation du champ name", () => {
  it("accepte un nom valide", async () => {
    const candidate = await Candidate.create(validData);
    expect(candidate.name).toBe("Alice Dupont");
  });

  it("rejette si name est absent", async () => {
    const { name, ...data } = validData;
    await expect(Candidate.create(data)).rejects.toThrow("Le nom est requis");
  });

  it("rejette si name est trop court (< 2 caractères)", async () => {
    await expect(
      Candidate.create({ ...validData, name: "A" })
    ).rejects.toThrow("au moins 2 caractères");
  });

  it("rejette si name dépasse 100 caractères", async () => {
    await expect(
      Candidate.create({ ...validData, name: "A".repeat(101) })
    ).rejects.toThrow("100 caractères");
  });
});

// ─── CHAMP : email ───────────────────────────────────────────────
describe("Validation du champ email", () => {
  it("accepte un email valide", async () => {
    const candidate = await Candidate.create(validData);
    expect(candidate.email).toBe("alice@example.com");
  });

  it("rejette si email est absent", async () => {
    const { email, ...data } = validData;
    await expect(Candidate.create(data)).rejects.toThrow("L'email est requis");
  });

  it("rejette un email sans @", async () => {
    await expect(
      Candidate.create({ ...validData, email: "pasunemail" })
    ).rejects.toThrow("email valide");
  });

  it("rejette un email dupliqué", async () => {
    await Candidate.create(validData);
    await expect(
      Candidate.create({ ...validData, name: "Bob" })
    ).rejects.toThrow();
  });

  it("convertit l'email en minuscules", async () => {
    const candidate = await Candidate.create({
      ...validData,
      email: "ALICE@EXAMPLE.COM",
    });
    expect(candidate.email).toBe("alice@example.com");
  });
});

// ─── CHAMP : phone ───────────────────────────────────────────────
describe("Validation du champ phone", () => {
  it("accepte un numéro valide", async () => {
    const candidate = await Candidate.create(validData);
    expect(candidate.phone).toBe("0601020304");
  });

  it("rejette si phone est absent", async () => {
    const { phone, ...data } = validData;
    await expect(Candidate.create(data)).rejects.toThrow(
      "numéro de téléphone est requis"
    );
  });

  it("rejette un numéro trop court (< 10 caractères)", async () => {
    await expect(
      Candidate.create({ ...validData, phone: "123" })
    ).rejects.toThrow("téléphone valide");
  });
});

// ─── CHAMP : experience ──────────────────────────────────────────
describe("Validation du champ experience", () => {
  it("accepte experience = 0", async () => {
    const candidate = await Candidate.create({ ...validData, experience: 0 });
    expect(candidate.experience).toBe(0);
  });

  it("rejette experience négative", async () => {
    await expect(
      Candidate.create({ ...validData, experience: -1 })
    ).rejects.toThrow("négative");
  });

  it("rejette experience > 50", async () => {
    await expect(
      Candidate.create({ ...validData, experience: 51 })
    ).rejects.toThrow("50 ans");
  });
});

// ─── CHAMP : skills ──────────────────────────────────────────────
describe("Validation du champ skills", () => {
  it("accepte un tableau avec une compétence", async () => {
    const candidate = await Candidate.create({
      ...validData,
      skills: ["JavaScript"],
    });
    expect(candidate.skills).toContain("JavaScript");
  });

  it("rejette un tableau vide", async () => {
    await expect(
      Candidate.create({ ...validData, skills: [] })
    ).rejects.toThrow("au moins une compétence");
  });
});

// ─── CHAMP : status ──────────────────────────────────────────────
describe("Validation du champ status", () => {
  it("accepte 'validated'", async () => {
    const candidate = await Candidate.create({
      ...validData,
      status: "validated",
    });
    expect(candidate.status).toBe("validated");
  });

  it("rejette une valeur hors enum", async () => {
    await expect(
      Candidate.create({ ...validData, status: "rejected" as any })
    ).rejects.toThrow("pending");
  });
});

// ─── SOFT DELETE ─────────────────────────────────────────────────
describe("Soft delete", () => {
  it("permet de marquer un candidat comme supprimé", async () => {
    const candidate = await Candidate.create(validData);
    candidate.isDeleted = true;
    candidate.deletedAt = new Date();
    await candidate.save();

    const found = await Candidate.findById(candidate._id);
    expect(found?.isDeleted).toBe(true);
    expect(found?.deletedAt).toBeInstanceOf(Date);
  });
});
