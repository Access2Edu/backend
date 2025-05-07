import request from "supertest";
import app from "../server"; 
import path from "path";
import adminModel from "../model/adminModel";

// Mocking nodemailer or any other external modules if necessary
jest.mock("../utils/nodemailer.js");

describe("Admin API", () => {
  const adminData = {
    firstName: "Admin",
    lastName: "User",
    email: "admin@example.com",
    password: "securePass123",
    confirmPassword: "securePass123"
  };

  let cookie;

  afterAll(async () => {
    // Cleanup after tests
    await adminModel.deleteMany({});
  });

  describe("POST /api/v1/admin/register-admin", () => {
    it("should register a new admin", async () => {
      const response = await request(app)
        .post("/api/v1/admin/register-admin")
        .field("firstName", adminData.firstName)
        .field("lastName", adminData.lastName)
        .field("email", adminData.email)
        .field("password", adminData.password)
        .field("confirmPassword", adminData.confirmPassword)
        .attach("profilePicture", path.resolve(__dirname, "test-image.jpg"));

      expect(response.status).toBe(201);
      expect(response.body.message).toMatch(/successfully/i);
    });
  });

  describe("POST /api/v1/admin/login", () => {
    it("should login an existing admin", async () => {
      const response = await request(app)
        .post("/api/v1/admin/login")
        .send({
          email: adminData.email,
          password: adminData.password
        });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe("Admin logged in successfully");
      cookie = response.headers["set-cookie"];
    });

    it("should return 401 for wrong credentials", async () => {
      const response = await request(app)
        .post("/api/v1/admin/login")
        .send({
          email: adminData.email,
          password: "wrongPassword"
        });

      expect(response.status).toBe(401);
      expect(response.body.message).toBe("Invalid credentials");
    });
  });

  describe("POST /api/v1/admin/logout", () => {
    it("should logout the admin", async () => {
      const response = await request(app)
        .post("/api/v1/admin/logout")
        .set("Cookie", cookie);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe("Admin logged out successfully");
    });
  });

  describe("POST /api/v1/admin/send-forgot-password-otp", () => {
    it("should send OTP if admin exists", async () => {
      const response = await request(app)
        .post("/api/v1/admin/send-forgot-password-otp")
        .send({ email: adminData.email });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe("OTP sent successfully");
    });

    it("should return 404 for nonexistent admin", async () => {
      const response = await request(app)
        .post("/api/v1/admin/send-forgot-password-otp")
        .send({ email: "nonexistent@example.com" });

      expect(response.status).toBe(404);
      expect(response.body.message).toBe("Admin not found");
    });
  });

  describe("POST /api/v1/admin/forgot-password", () => {
    let admin;
    beforeAll(async () => {
      admin = await adminModel.findOne({ email: adminData.email });
      admin.forgotPasswordOTP = "123456";
      admin.forgotPasswordOTPExpireAt = Date.now() + 10 * 60 * 1000;
      await admin.save();
    });

    it("should reset the password with valid OTP", async () => {
      const response = await request(app)
        .post("/api/v1/admin/forgot-password")
        .send({
          email: admin.email,
          otp: "123456",
          newPassword: "newStrongPass123"
        });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe("Password reset successful");
    });

    it("should return 400 for invalid OTP", async () => {
      const response = await request(app)
        .post("/api/v1/admin/forgot-password")
        .send({
          email: admin.email,
          otp: "wrongOTP",
          newPassword: "anything"
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("Invalid OTP or request");
    });
  });
});
