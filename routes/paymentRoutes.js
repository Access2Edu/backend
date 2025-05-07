import express from "express";
import {
  initiatePayment,
  verifyPayment,
} from "../controllers/student.controllers.js";
import { studentAuth } from "../authentication/auth.js";

const paymentRouter = express.Router();

/**
 * @swagger
 * /api/v1/payment/initiatePayment:
 *   post:
 *     summary: Initiate a payment for a student
 *     tags: [Payment]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 description: The student's email address
 *               amount:
 *                 type: integer
 *                 description: The amount to be paid
 *               paymentMethod:
 *                 type: string
 *                 enum: [credit_card, debit_card, paypal]
 *                 description: The payment method selected by the student
 *     responses:
 *       200:
 *         description: Payment initiation successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 reference:
 *                   type: string
 *                   description: Unique reference for the payment transaction
 *       400:
 *         description: Bad request due to invalid data
 *       401:
 *         description: Unauthorized (token required)
 *       500:
 *         description: Internal server error
 */
paymentRouter.post("/initiatePayment", studentAuth, initiatePayment);

/**
 * @swagger
 * /api/v1/payment/verify/{reference}:
 *   get:
 *     summary: Verify a payment using the payment reference
 *     tags: [Payment]
 *     parameters:
 *       - name: reference
 *         in: path
 *         required: true
 *         description: The unique payment reference generated during payment initiation
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Payment verification successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   description: Payment status (e.g., successful, failed)
 *                 amount:
 *                   type: integer
 *                   description: Amount of money that was paid
 *       400:
 *         description: Bad request due to invalid reference
 *       404:
 *         description: Payment reference not found
 *       500:
 *         description: Internal server error
 */
paymentRouter.get("/verify/:reference", studentAuth, verifyPayment);

export default paymentRouter;
