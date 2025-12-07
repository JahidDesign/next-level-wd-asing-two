
import express from "express";
import cors from "cors";

import authRoutes from "./modules/auth/auth.routes";
import userRoutes from "./modules/users/users.routes";
import vehicleRoutes from "./modules/vehicles/vehicles.routes";
import bookingRoutes from "./modules/bookings/bookings.routes";
import { errorHandler } from "./middleware/errorHandler";

const app = express();


app.use(cors());
app.use(express.json());


app.get("/", (_req, res) => {
  res.json({
    message: "Vehicle Rental API successfully connected",
    status: "OK",
  });
});


app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/vehicles", vehicleRoutes);
app.use("/api/v1/bookings", bookingRoutes);


app.use(errorHandler);

export default app;
