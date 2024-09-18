const request = require("supertest");
const app = require("./index");

describe("GET /api/tunelist", () => {
  it("responds with json", async () => {
    await request(app)
      .get("/api/tunelist")
      .expect("Content-Type", /json/)
      .expect(200);
  });
});

describe("GET /api/tune/:id", () => {
  it("responds with json for existing id", async () => {
    const response = await request(app)
      .get("/api/tune/coffee") // Replace 1 with an existing id
      .expect("Content-Type", /json/)
      .expect(200);
  });
});
