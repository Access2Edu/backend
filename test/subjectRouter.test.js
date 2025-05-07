import request from "supertest";
import express from "express";
import subjectRouter from "../routes/subject.routes.js";
import multer from "multer";

jest.mock("../authentication/auth.js");
jest.mock("../controllers/subject.controllers.js");

const app = express();
app.use(express.json());
app.use("/api/v1/subject", subjectRouter);

describe("Subject Routes", () => {
  it("should add a subject with videos", async () => {
    const response = await request(app)
      .post("/api/v1/subject/add-subject")
      .field("name", "Math")
      .field("className", "SS1")
      .field("title", "Algebra")
      .attach("videoUrl", Buffer.from("mock video content"), {
        filename: "video.mp4",
        contentType: "video/mp4",
      });

    expect(response.statusCode).toBe(200);
    expect(response.body.message).toBe("Subject added");
  });

  it("should update a subject", async () => {
    const response = await request(app)
      .post("/api/v1/subject/update-subject")
      .send({ subjectId: "12345" });

    expect(response.statusCode).toBe(200);
    expect(response.body.message).toBe("Subject updated");
  });

  it("should delete a subject", async () => {
    const response = await request(app)
      .post("/api/v1/subject/delete-subject")
      .send({ subjectId: "12345" });

    expect(response.statusCode).toBe(200);
    expect(response.body.message).toBe("Subject deleted");
  });

  it("should get videos by level", async () => {
    const response = await request(app).get(
      "/api/v1/subject/get-video-by-level?level=SS1"
    );

    expect(response.statusCode).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });

  it("should get subjects by name and level", async () => {
    const response = await request(app).get(
      "/api/v1/subject/get-subjects-by-name-level?name=Math&level=SS1"
    );

    expect(response.statusCode).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });
});
