import { Router } from "express";
import upload from "../config/multer.js";
import {
  Login,
  Logout,
  registerAdmin,
} from "../controllers/admin.controllers.js";
import {
  forgotPasswordAdmin,
  sendForgotPasswordOTPAdmin,
} from "../controllers/forgotPassword.controllers.js";

const adminRouter = Router();

/**
 * @swagger
 * /api/v1/admin/register-admin:
 *   post:
 *     summary: Register a new admin
 *     tags: [Admin]
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
 *         description: Admin registered successfully
 *       400:
 *         description: Bad request
 */

adminRouter.post(
  "/register-admin",
  upload.single("profilePicture"),
  registerAdmin
);

/**
 * @swagger
 * /api/v1/admin/login:
 *   post:
 *     summary: Login an admin
 *     tags: [Admin]
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
 *         description: Admin logged in successfully
 *       401:
 *         description: Invalid credentials
 */
adminRouter.post("/login", Login);

/**
 * @swagger
 * /api/v1/admin/logout:
 *   post:
 *     summary: Logout an admin
 *     tags: [Admin]
 *     responses:
 *       200:
 *         description: Admin logged out successfully
 */
adminRouter.post("/logout", Logout);

/**
 * @swagger
 * /api/v1/admin/send-forgot-password-otp:
 *   post:
 *     summary: Send OTP for password reset (Admin)
 *     tags: [Admin]
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
 *         description: Admin not found
 */
adminRouter.post("/send-forgot-password-otp", sendForgotPasswordOTPAdmin);

/**
 * @swagger
 * /api/v1/admin/forgot-password:
 *   post:
 *     summary: Reset password using OTP (Admin)
 *     tags: [Admin]
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
adminRouter.post("/forgot-password", forgotPasswordAdmin);

export default adminRouter;
