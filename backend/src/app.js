import express from "express";
import cors from "cors";
import {globalErrorHandler} from "./middlewares/globalErrorHandler.middleware.js";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/auth.routes.js";
import vehicleRoutes from "./routes/vehicles.routes.js";
import driverRoutes from './routes/drivers.routes.js';
import tripRoutes from './routes/trips.routes.js';
import maintenaceRoutes from './routes/maintenance.routes.js';
import fuelRoutes from './routes/fuel.routes.js';
import expenssesRoutes from './routes/expensses.routes.js';

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get("/health", (req, res) => {
  return res.status(200).json({ status: "ok", message: "Server is running!" });
});

app.use("/api/auth", authRoutes);
app.use("/api/vehicles", vehicleRoutes);
app.use("/api/drivers",driverRoutes);
app.use("/api/maintenance", maintenaceRoutes);
app.use('/api/fuel', fuelRoutes);
app.use('/api/expenses', expenssesRoutes);

app.use(globalErrorHandler);

export { app };
