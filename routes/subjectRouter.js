import { Router } from "express";
import { adminAuth } from "../authentication/auth.js";
import upload from "../config/multer.js";
import {
  addSubject,
  deleteSubject,
  fetchAllVideosByLevel,
  fetchAllVideosByNameAndLevel,
  updateSubject,
} from "../controllers/subject.controllers.js";

const subjectRouter = Router();

/**
 * @swagger
 * /api/v1/subject/add-subject:
 *   post:
 *     summary: Add a new subject along with related video URLs
 *     tags: [Subject]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: The name of the subject
 *               className:
 *                 type: string
 *                 description: The class name of the subject
 *               title:
 *                 type: string
 *                 description: The academic level of the subject
 *               videoUrl:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: uri
 *                 description: Video URLs related to the subject (up to 5 videos)
 *     responses:
 *       200:
 *         description: Subject added successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       400:
 *         description: Invalid data or file upload issue
 *       401:
 *         description: Unauthorized (token required)
 *       500:
 *         description: Internal server error
 */
subjectRouter.post(
  "/add-subject",
  adminAuth,
  upload.array("videoUrl", 5),
  addSubject
);

/**
 * @swagger
 * /api/v1/subject/update-subject:
 *   post:
 *     summary: Update an existing subject
 *     tags: [Subject]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               subjectId:
 *                 type: string
 *                 description: The ID of the subject to update
 *     responses:
 *       200:
 *         description: Subject updated successfully
 *       400:
 *         description: Invalid data or subject ID
 *       401:
 *         description: Unauthorized (token required)
 *       404:
 *         description: Subject not found
 *       500:
 *         description: Internal server error
 */
subjectRouter.post("/update-subject", adminAuth, updateSubject);

/**
 * @swagger
 * /api/v1/subject/delete-subject:
 *   post:
 *     summary: Delete a subject
 *     tags: [Subject]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               subjectId:
 *                 type: string
 *                 description: The ID of the subject to delete
 *     responses:
 *       200:
 *         description: Subject deleted successfully
 *       400:
 *         description: Invalid data or subject ID
 *       401:
 *         description: Unauthorized (token required)
 *       404:
 *         description: Subject not found
 *       500:
 *         description: Internal server error
 */
subjectRouter.post("/delete-subject", adminAuth, deleteSubject);

/**
 * @swagger
 * /api/v1/subject/get-video-by-level:
 *   get:
 *     summary: Get videos associated with a subject by level
 *     tags: [Subject]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - name: level
 *         in: query
 *         required: true
 *         description: The academic level to filter videos by
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of videos at the specified level
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   videoUrl:
 *                     type: string
 *                     format: uri
 *                   subjectName:
 *                     type: string
 *                   level:
 *                     type: string
 *       400:
 *         description: Invalid level parameter
 *       401:
 *         description: Unauthorized (token required)
 *       500:
 *         description: Internal server error
 */
subjectRouter.get("/get-video-by-level", adminAuth, fetchAllVideosByLevel);

/**
 * @swagger
 * /api/v1/subject/get-subjects-by-name-level:
 *   get:
 *     summary: Get subjects filtered by name and level
 *     tags: [Subject]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - name: name
 *         in: query
 *         required: true
 *         description: The name of the subject to filter by
 *         schema:
 *           type: string
 *       - name: level
 *         in: query
 *         required: true
 *         description: The academic level to filter subjects by
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of subjects that match the criteria
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   name:
 *                     type: string
 *                   level:
 *                     type: string
 *       400:
 *         description: Invalid parameters for name or level
 *       401:
 *         description: Unauthorized (token required)
 *       500:
 *         description: Internal server error
 */
subjectRouter.get(
  "/get-subjects-by-name-level",
  adminAuth,
  fetchAllVideosByNameAndLevel
);

export default subjectRouter;
