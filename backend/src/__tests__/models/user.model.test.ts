import User from "../../models/User";
import { connectDB, clearDB, closeDB } from "../helpers/db";

const validData = {
  name: "John Doe",
  username: "john_doe",
  email: "john@example.com",
  password: "secret123",
  role: "user" as const,
};

beforeAll(async () => await connectDB());
afterEach(async () => await clearDB());
afterAll(async () => await closeDB());

describe("Hook pre-save : hashage du mot de passe", () => {
  it("hash le mot de passe avant sauvegarde", async () => {
    const user = await User.create(validData);
    expect(user.password).not.toBe("secret123");
    expect(user.password).toMatch(/^\$2/);
  });

  it("ne re-hash pas si le mot de passe n'a pas changé", async () => {
    const user = await User.create(validData);
    const hashAvant = user.password;
    user.name = "John Updated";
    await user.save();
    expect(user.password).toBe(hashAvant);
  });
});

describe("Méthode comparePassword()", () => {
  it("retourne true pour le bon mot de passe", async () => {
    const user = await User.create(validData);
    const result = await user.comparePassword("secret123");
    expect(result).toBe(true);
  });

  it("retourne false pour un mauvais mot de passe", async () => {
    const user = await User.create(validData);
    const result = await user.comparePassword("mauvais");
    expect(result).toBe(false);
  });
});

describe("Validation du champ username", () => {
  it("rejette un username avec caractères spéciaux", async () => {
    await expect(
      User.create({ ...validData, username: "john@doe!" })
    ).rejects.toThrow("lettres, chiffres et underscores");
  });

  it("rejette un username dupliqué", async () => {
    await User.create(validData);
    await expect(
      User.create({ ...validData, email: "autre@example.com" })
    ).rejects.toThrow();
  });
});

describe("Validation du champ role", () => {
  it("accepte le rôle 'admin'", async () => {
    const user = await User.create({ ...validData, role: "admin" });
    expect(user.role).toBe("admin");
  });

  it("rejette un rôle invalide", async () => {
    await expect(
      User.create({ ...validData, role: "superuser" as any })
    ).rejects.toThrow("user");
  });

  it("role est 'user' par défaut", async () => {
    const { role, ...data } = validData;
    const user = await User.create(data);
    expect(user.role).toBe("user");
  });
});
