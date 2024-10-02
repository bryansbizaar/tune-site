const request = require("supertest");
const mongoose = require("mongoose");
const express = require("express");
const app = express();
const authRoutes = require("../routes/auth");
const UserModel = require("../models/userModel");

jest.setTimeout(10000); // Set timeout to 10 seconds

app.use(express.json());
app.use("/api/auth", authRoutes);

let server;

// Ensure MongoDB is connected before running tests
beforeAll(async () => {
  await new Promise((resolve) => setTimeout(resolve, 100)); // Add a small delay
  await mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
});

// Start server and clean up database before each test
beforeEach(async () => {
  server = app.listen();
  await UserModel.deleteMany(); // Clear users before each test
});

// Close server after each test
afterEach(async () => {
  if (server && server.close) {
    await server.close();
  }
});

// Close the MongoDB connection after all tests
afterAll(async () => {
  await mongoose.connection.close();
});

// describe("POST /signup", () => {
//   it("should create a new user and return 201", async () => {
//     const newUser = {
//       username: "testuser",
//       email: "testuser@example.com",
//       password: "password123",
//     };

//     const response = await request(app).post("/api/auth/signup").send(newUser);

//     // Expect a successful creation of the user
//     expect(response.status).toBe(201);
//     expect(response.body.message).toBe("User created successfully");
//   });
// });
describe("POST /signup", () => {
  it("should create a new user and return 201", async () => {
    const newUser = {
      username: "testuser",
      email: "testuser@example.com",
      password: "password123",
    };

    const response = await request(app).post("/api/auth/signup").send(newUser);

    expect(response.status).toBe(201);
    expect(response.body.message).toBe("User created successfully");
    expect(response.body.user).toHaveProperty("id");
    expect(response.body.user.username).toBe(newUser.username);
    expect(response.body.user.email).toBe(newUser.email);
    expect(response.body.user.role).toBe("user");
    expect(response.body).toHaveProperty("token");
  });

  it("should return 400 if required fields are missing", async () => {
    const incompleteUser = {
      username: "testuser",
      email: "testuser@example.com",
    };

    const response = await request(app)
      .post("/api/auth/signup")
      .send(incompleteUser);

    expect(response.status).toBe(400);
    expect(response.body.error).toBe("All fields are required");
  });

  it("should return 400 if user already exists", async () => {
    const existingUser = {
      username: "existinguser",
      email: "existing@example.com",
      password: "password123",
    };

    // Create a user first
    await request(app).post("/api/auth/signup").send(existingUser);

    // Try to create the same user again
    const response = await request(app)
      .post("/api/auth/signup")
      .send(existingUser);

    expect(response.status).toBe(400);
    expect(response.body.error).toBe("User already exists");
  });

  it("should hash the password before saving", async () => {
    const newUser = {
      username: "hashtest",
      email: "hashtest@example.com",
      password: "password123",
    };

    await request(app).post("/api/auth/signup").send(newUser);

    const savedUser = await UserModel.findOne({ email: newUser.email });
    expect(savedUser.password).not.toBe(newUser.password);
    expect(savedUser.password).toHaveLength(60); // bcrypt hash length
  });
});
describe("POST /login", () => {
  it("should login successfully with correct credentials", async () => {
    // First, create a user
    const user = {
      username: "testuser",
      email: "testuser@example.com",
      password: "password123",
    };
    await request(app).post("/api/auth/signup").send(user);

    // Now, attempt to login
    const loginResponse = await request(app)
      .post("/api/auth/login")
      .send({ email: user.email, password: user.password });

    expect(loginResponse.status).toBe(200);
    expect(loginResponse.body.message).toBe("Login successful");
    expect(loginResponse.body.user).toHaveProperty("id");
    expect(loginResponse.body.user.email).toBe(user.email);
    expect(loginResponse.body.user).toHaveProperty("role");
    expect(loginResponse.body).toHaveProperty("token");
  });
  it("should return 401 with incorrect password", async () => {
    // First, create a user
    const user = {
      username: "testuser",
      email: "testuser@example.com",
      password: "password123",
    };
    await request(app).post("/api/auth/signup").send(user);

    // Now, attempt to login with incorrect password
    const loginResponse = await request(app)
      .post("/api/auth/login")
      .send({ email: user.email, password: "wrongpassword" });

    expect(loginResponse.status).toBe(401);
    expect(loginResponse.body.error).toBe("Invalid email or password");
  });
  it("should return 401 with incorrect password", async () => {
    // First, create a user
    const user = {
      username: "testuser",
      email: "testuser@example.com",
      password: "password123",
    };
    await request(app).post("/api/auth/signup").send(user);

    // Now, attempt to login with incorrect password
    const loginResponse = await request(app)
      .post("/api/auth/login")
      .send({ email: user.email, password: "wrongpassword" });

    expect(loginResponse.status).toBe(401);
    expect(loginResponse.body.error).toBe("Invalid email or password");
  });
  it("should return 401 with incorrect password", async () => {
    // ... (previous incorrect password test remains unchanged)
  });

  it("should return 401 with non-existent email", async () => {
    const loginResponse = await request(app)
      .post("/api/auth/login")
      .send({ email: "nonexistent@example.com", password: "anypassword" });

    expect(loginResponse.status).toBe(401);
    expect(loginResponse.body.error).toBe("Invalid email or password");
  });
  it("should return 400 when email is missing", async () => {
    const loginResponse = await request(app)
      .post("/api/auth/login")
      .send({ password: "anypassword" });

    expect(loginResponse.status).toBe(400);
    expect(loginResponse.body.error).toBe("Email and password are required");
  });
  it("should return 400 when password is missing", async () => {
    const loginResponse = await request(app)
      .post("/api/auth/login")
      .send({ email: "test@example.com" });

    expect(loginResponse.status).toBe(400);
    expect(loginResponse.body.error).toBe("Email and password are required");
  });
});
