import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import globalError from "./config/globalErrors.js";
import logger from "./config/logger.js";
import connectDB from "./config/db.js";
import { setupSwaggerDocs } from "./config/swagger.js";
import studentRouter from "./routes/studentRouter.js";
import subjectRouter from "./routes/subjectRouter.js";
import adminRouter from "./routes/adminRouter.js";
import paymentRouter from "./routes/paymentRoutes.js";

const app = express();


setupSwaggerDocs(app);

app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    credentials: true,
    origin: function(origin, callback) {
      // Allow requests with no origin (like mobile apps or curl requests)
      if(!origin) return callback(null, true);
      return callback(null, true);
    }
  })
);

app.use("/api/v1/students", studentRouter);
app.use("/api/v1/subjects", subjectRouter);
app.use("/api/v1/admin", adminRouter);
app.use("/api/v1/payment", paymentRouter);
app.get("/", (req, res) => {
  res.send("Welcome to the Access2Edu API!");
});

app.all("*", (req, res, next) => {
  res.status(400).json({
    success: false,
    message: `Can"t find ${req.originalUrl} on the server`,
  });
});


app.use(globalError);

await connectDB();
app.listen(process.env.PORT, () => {
  logger.info(`Server running on http://localhost:${process.env.PORT}`);
});