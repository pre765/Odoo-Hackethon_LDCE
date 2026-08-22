import cors from "cors";
import express from "express";
import authRouter from "./routes/authRoutes.js";
import activityRouter from "./routes/activityRoutes.js";
import cityRouter from "./routes/cityRoutes.js";
import tripRouter from "./routes/tripRoutes.js";
import dashboardRouter from "./routes/dashboardRoutes.js";
import { errorHandler, notFound } from "./middleware/errorMiddleware.js";

const app = express();
const allowedOrigins = (process.env.CORS_ORIGIN ?? "http://localhost:5173")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(cors({ origin: allowedOrigins }));
app.use(express.json());

app.get("/api/health", (_request, response) => {
  response.json({ status: "ok" });
});
app.use("/api/auth", authRouter);
app.use("/api/cities", cityRouter);
app.use("/api/activities", activityRouter);
app.use("/api/trips", tripRouter);
app.use("/api/dashboard", dashboardRouter);

app.use(notFound);
app.use(errorHandler);

export default app;
