import { Router } from "express";
import upload from "../config/multer.js";
import {
  deleteStudent,
  fetchAllSubject,
  Login,
  Logout,
  registerStudent,
  sendSignupOTPStudent,
  verifySignupOTPStudent,
  updateStudent,
  googleAuthStudent,
} from "../controllers/student.controllers.js";
import { studentAuth } from "../authentication/auth.js";
import {
  forgotPasswordStudent,
  sendForgotPasswordOTPStudent,
} from "../controllers/forgotPassword.controllers.js";

const studentRouter = Router();

/**
 * @swagger
 * /api/v1/students/register:
 *   post:
 *     summary: Register a new student
 *     tags: [Student]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               otherName:
 *                 type: string
 *               level:
 *                 type: string
 *               parent_guardian:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *               confirmPassword:
 *                 type: string
 *               profilePicture:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Student registered successfully, OTP sent to email
 *       400:
 *         description: Bad request
 */
studentRouter.post(
  "/register",
  upload.single("profilePicture"),
  registerStudent
);

/**
 * @swagger
 * /api/v1/students/login:
 *   post:
 *     summary: Login a student
 *     tags: [Student]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Student logged in successfully
 *       401:
 *         description: Invalid credentials
 */
studentRouter.post("/login", Login);

/**
 * @swagger
 * /api/v1/students/logout:
 *   post:
 *     summary: Logout a student
 *     tags: [Student]
 *     responses:
 *       200:
 *         description: Student logged out successfully
 */
studentRouter.post("/logout", Logout);

/**
 * @swagger
 * /api/v1/students/google-auth:
 *   post:
 *     summary: Authenticate a student using Google OAuth
 *     tags: [Student]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               idToken:
 *                 type: string
 *                 description: Google OAuth ID Token for authentication
 *     responses:
 *       200:
 *         description: Student authenticated successfully
 *       401:
 *         description: Invalid Google ID token
 */
studentRouter.post("/google-auth", googleAuthStudent);

/**
 * @swagger
 * /api/v1/students/update-student/{studentId}:
 *   put:
 *     summary: Update student information
 *     tags: [Student]
 *     parameters:
 *       - name: studentId
 *         in: path
 *         required: true
 *         description: The ID of the student to update
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               otherName:
 *                 type: string
 *               parent_guardian:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *     responses:
 *       200:
 *         description: Student information updated successfully
 *       400:
 *         description: Bad request or invalid student ID
 */
studentRouter.put("/update-student/:studentId", studentAuth, updateStudent);

/**
 * @swagger
 * /api/v1/students/delete-student/{studentId}:
 *   delete:
 *     summary: Delete a student account
 *     tags: [Student]
 *     parameters:
 *       - name: studentId
 *         in: path
 *         required: true
 *         description: The ID of the student to delete
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Student account deleted successfully
 *       400:
 *         description: Bad request or invalid student ID
 */
studentRouter.delete("/delete-student/:studentId", studentAuth, deleteStudent);

/**
 * @swagger
 * /api/v1/students/get-all-subject:
 *   get:
 *     summary: Fetch all subjects available for students
 *     tags: [Student]
 *     responses:
 *       200:
 *         description: A list of all subjects
 *       401:
 *         description: Unauthorized (token required)
 */
studentRouter.get("/get-all-subject", studentAuth, fetchAllSubject);

/**
 * @swagger
 * /api/v1/students/send-forgot-password-otp:
 *   post:
 *     summary: Send OTP for password reset (Student)
 *     tags: [Student]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *     responses:
 *       200:
 *         description: OTP sent successfully
 *       404:
 *         description: Student not found
 */
studentRouter.post("/send-forgot-password-otp", sendForgotPasswordOTPStudent);

/**
 * @swagger
 * api/v1/students/send-signup-otp:
 *   post:
 *     summary: Send OTP for email verification
 *     description: Sends an OTP to the student's email address after signup.
 *     tags: [Student]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: The student's email address.
 *     responses:
 *       200:
 *         description: OTP sent successfully .
 *       400:
 *         description: Email address is missing or invalid.
 *       404:
 *         description: Student not found.
 *       500:
 *         description: Internal server error.
 */
studentRouter.post("/send-signup-otp", sendSignupOTPStudent);

/**
 * @swagger
 * api/v1/students/verify-signup-otp:
 *   post:
 *     summary: Verify the OTP sent to the student's email
 *     description: Verifies the OTP entered by the student to activate their account.
 *     tags: [Student]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - OTP
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: The student's email address.
 *               OTP:
 *                 type: string
 *                 description: The OTP has been sent to the student's email.
 *     responses:
 *       200:
 *         description: OTP verified successfully and student's account activated.
 *       400:
 *         description: Missing required fields or invalid input.
 *       401:
 *         description: Invalid or expired OTP.
 *       404:
 *         description: Student not found.
 *       500:
 *         description: Internal server error.
 */
studentRouter.post("/verify-signup-otp", verifySignupOTPStudent);

/**
 * @swagger
 * /api/v1/students/forgot-password:
 *   post:
 *     summary: Reset student password using OTP
 *     tags: [Student]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               otp:
 *                 type: string
 *               newPassword:
 *                 type: string
 *     responses:
 *       200:
 *         description: Password reset successful
 *       400:
 *         description: Invalid OTP or request
 */
studentRouter.post("/forgot-password", forgotPasswordStudent);

export default studentRouter;
