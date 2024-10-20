const request = require("supertest");
const mongoose = require("mongoose");
const app = require("./index");
const fs = require("fs").promises;

jest.setTimeout(10000);

let server;
let testDbName;

describe("API Tests", () => {
  beforeAll(async () => {
    testDbName = "test_index_" + Math.round(Math.random() * 1000);
    await mongoose.connect(process.env.MONGODB_URI + testDbName);
  });

  beforeEach(async () => {
    server = app.listen(0);
  });

  afterEach(async () => {
    await new Promise((resolve) => server.close(resolve));
  });

  afterAll(async () => {
    await mongoose.connection.db.dropDatabase();
    await mongoose.connection.close();
  });

  describe("GET /api/tuneList", () => {
    it("responds with json", async () => {
      const response = await request(app)
        .get("/api/tuneList")
        .expect("Content-Type", /json/)
        .expect(200);

      expect(Array.isArray(response.body)).toBeTruthy();
      expect(response.body.length).toBeGreaterThan(0);
    });

    it("handles server errors", async () => {
      const originalReadFile = fs.readFile;
      fs.readFile = jest.fn().mockRejectedValue(new Error("Mocked error"));

      const response = await request(app)
        .get("/api/tuneList")
        .expect(500)
        .expect("Content-Type", /json/);

      expect(response.body).toHaveProperty(
        "message",
        "Error reading tune list"
      );
      expect(response.body).toHaveProperty("error");

      fs.readFile = originalReadFile;
    });
  });

  describe("GET /api/tune/:id", () => {
    it("responds with json for existing id", async () => {
      const response = await request(app)
        .get("/api/tune/coffee")
        .expect("Content-Type", /json/)
        .expect(200);

      expect(response.body).toHaveProperty("id", "coffee");
    });

    it("responds with 404 for non-existing id", async () => {
      const response = await request(app)
        .get("/api/tune/does-not-exist")
        .expect(404)
        .expect("Content-Type", /json/);

      expect(response.body).toHaveProperty("message", "Tune not found");
      expect(response.body).toHaveProperty("error");
    });

    it("handles ids with special characters", async () => {
      const response = await request(app)
        .get("/api/tune/special!@#$%^&*()_+")
        .expect(404)
        .expect("Content-Type", /json/);

      expect(response.body).toHaveProperty("message", "Tune not found");
      expect(response.body).toHaveProperty("error");
    });

    it("handles very long ids", async () => {
      const longId = "a".repeat(1000);
      const response = await request(app)
        .get(`/api/tune/${longId}`)
        .expect(404)
        .expect("Content-Type", /json/);

      expect(response.body).toHaveProperty("message", "Tune not found");
      expect(response.body).toHaveProperty("error");
    });
  });

  describe("GET /api/chords/:id", () => {
    it("responds with json for existing id", async () => {
      const response = await request(app)
        .get("/api/chords/coffee")
        .expect("Content-Type", /json/)
        .expect(200);

      expect(response.body).toHaveProperty("id", "coffee");
      expect(response.body).toHaveProperty("chords");
    });

    it("responds with 404 for non-existing id", async () => {
      const response = await request(app)
        .get("/api/chords/does-not-exist")
        .expect(404)
        .expect("Content-Type", /json/);

      expect(response.body).toHaveProperty("message", "Chords not found");
      expect(response.body).toHaveProperty("error");
    });
  });

  describe("Static file serving", () => {
    it("serves static files from /images", async () => {
      await request(app)
        .get("/images/instruments.jpg")
        .expect(200)
        .expect("Content-Type", /image\/jpeg/);
    });

    it("returns 404 for non-existent images", async () => {
      await request(app).get("/images/non-existent-image.jpg").expect(404);
    });
  });
});
