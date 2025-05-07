import request from "supertest";
import app from "../server.js";
import studentModel from "../model/studentModel.js";

describe("Student Routes", () => {
  
  // Test the signup route
  describe("POST api/v1/students/register", () => {
    it("should sign up a new student and send OTP", async () => {
      const studentData = {
        email: "student@example.com",
        password: "password123",
      };

      const response = await request(app)
        .post("api/v1/students/signup")
        .send(studentData);

      expect(response.status).toBe(201);
      expect(response.body.message).toBe("Signup successful and OTP sent");

      // Checks if the student was saved in the database
      const student = await studentModel.findOne({ email: studentData.email });
      expect(student).not.toBeNull();
      expect(student.email).toBe(studentData.email);
    });

    it("should return 400 if email is missing", async () => {
      const response = await request(app)
        .post("/students/signup")
        .send({ password: "password123" });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("E-mail and password are required");
    });
  });

  // Test the OTP sending route
  describe("POST api/v1/students/send-signup-otp", () => {
    it("should send an OTP to the student's email", async () => {
      const studentData = {
        email: "student@example.com",
      };

      const response = await request(app)
        .post("/students/send-signup-otp")
        .send(studentData);

      expect(response.status).toBe(200); // OTP should be sent
      expect(response.body.message).toBe("OTP sent successfully to your E-mail address");

      // Check if OTP was generated and saved in the database
      const student = await studentModel.findOne({ email: studentData.email });
      expect(student.forgotPasswordOTP).not.toBeNull();
    });

    it("should return 404 if student is not found", async () => {
      const studentData = { email: "nonexistent@example.com" };

      const response = await request(app)
        .post("api/v1/students/send-signup-otp")
        .send(studentData);

      expect(response.status).toBe(404); // Student not found
      expect(response.body.message).toBe("Student not found");
    });
  });

  // Test the OTP verification route
  describe("POST api/v1/students/verify-signup-otp", () => {
    let student;
    beforeAll(async () => {
      student = await studentModel.create({
        email: "student@example.com",
        password: "password123",
        forgotPasswordOTP: "123456", // Mock OTP
        forgotPasswordOTPExpireAt: Date.now() + 15 * 60 * 1000, // 15 minutes from now
      });
    });

    it("should verify OTP and activate account", async () => {
      const otpData = {
        email: student.email,
        OTP: "123456",
      };

      const response = await request(app)
        .post("api/v1/students/verify-signup-otp")
        .send(otpData);

      expect(response.status).toBe(200); // OTP verification should be successful
      expect(response.body.message).toBe("OTP verified and account activated");

      // Check if student account is activated (Assuming an `isActivated` flag in the model)
      const updatedStudent = await studentModel.findOne({ email: student.email });
      expect(updatedStudent.isActivated).toBe(true);
    });

    it("should return 401 if OTP is invalid", async () => {
      const otpData = {
        email: student.email,
        OTP: "wrongOTP",
      };

      const response = await request(app)
        .post("api/v1/students/verify-signup-otp")
        .send(otpData);

      expect(response.status).toBe(401); // Invalid OTP
      expect(response.body.message).toBe("Invalid OTP. Please try again");
    });

    it("should return 401 if OTP is expired", async () => {
      student.forgotPasswordOTPExpireAt = Date.now() - 1; // Expired OTP
      await student.save();

      const otpData = {
        email: student.email,
        OTP: student.forgotPasswordOTP,
      };

      const response = await request(app)
        .post("api/v1/students/verify-signup-otp")
        .send(otpData);

      expect(response.status).toBe(401); // OTP expired
      expect(response.body.message).toBe("Expired OTP. Please try again");
    });
  });

});
