import express from "express";
import cors from "cors";
import {globalErrorHandler} from "./middlewares/globalErrorHandler.middleware.js";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/auth.routes.js";

const app = express();

app.use(cors());
app.use(express.json());
app.use(cookieParser());

app.get("/health", (req, res) => {
  return res.status(200).json({ status: "ok", message: "Server is running!" });
});

app.use("/api/auth", authRoutes);



app.use(globalErrorHandler);

export { app };
