// src/modules/bookings/bookings.controller.ts
import { Request, Response } from "express";
import { asyncHandler } from "../../middleware/asyncHandler";
import { BookingService } from "./bookings.service";
import { sendSuccess } from "../../utils/response";


interface AuthRequest extends Request {
  user: {
    id: number;
    role: "admin" | "customer";
  };
}

// POST /api/v1/bookings
export const createBooking = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const data = await BookingService.createBooking(req.user, req.body);
    return sendSuccess(res, 201, "Booking created successfully", data);
  }
);

// GET /api/v1/bookings
export const getBookings = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { message, data } = await BookingService.getBookingsForUser(req.user);
    return sendSuccess(res, 200, message, data);
  }
);

// PUT /api/v1/bookings/:bookingId
export const updateBooking = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const bookingId = parseInt(req.params.bookingId, 10);
    const { status } = req.body as { status: "cancelled" | "returned" };

    const result = await BookingService.updateBookingStatus(
      req.user,
      bookingId,
      status
    );

    if (status === "cancelled") {
      return sendSuccess(
        res,
        200,
        "Booking cancelled successfully",
        result.booking
      );
    }

    // status === "returned"
    return sendSuccess(
      res,
      200,
      "Booking marked as returned. Vehicle is now available",
      {
        ...result.booking,
        vehicle: {
          availability_status: "available",
        },
      }
    );
  }
);
