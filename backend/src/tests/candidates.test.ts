import request from "supertest";
import app from "../app";

describe("Candidates Routes", () => {

  let token: string;
  let candidateId: string;

  const user = {
    email: "admin@test.com",
    password: "123456"
  };

  const candidate = {
    name: "John Doe",
    email: "john@test.com",
    phone: "+261331234567",
    position: "Developer",
    experience: 3,
    skills: ["React", "Node"]
  };

  beforeAll(async () => {
    // login to get token
    const res = await request(app)
      .post("/api/auth/login")
      .send(user);

    token = res.body.token;
  });

  it("should create candidate", async () => {
    const res = await request(app)
      .post("/api/candidates")
      .set("Authorization", `Bearer ${token}`)
      .send(candidate);

    expect(res.status).toBe(201);
    expect(res.body.name).toBe(candidate.name);

    candidateId = res.body._id;
  });

  it("should get all candidates", async () => {
    const res = await request(app)
      .get("/api/candidates")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it("should get candidate by id", async () => {
    const res = await request(app)
      .get(`/api/candidates/${candidateId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body._id).toBe(candidateId);
  });

  it("should update candidate", async () => {
    const res = await request(app)
      .put(`/api/candidates/${candidateId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        position: "Senior Developer"
      });

    expect(res.status).toBe(200);
    expect(res.body.position).toBe("Senior Developer");
  });

  it("should validate candidate", async () => {
    const res = await request(app)
      .post(`/api/candidates/${candidateId}/validate`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
  });

  it("should delete candidate", async () => {
    const res = await request(app)
      .delete(`/api/candidates/${candidateId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
  });

});