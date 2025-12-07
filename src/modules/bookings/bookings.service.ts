import { query } from '../../db';
import { ApiError } from '../../utils/ApiError';

interface BookingRow {
  id: number;
  customer_id: number;
  vehicle_id: number;
  rent_start_date: Date;
  rent_end_date: Date;
  total_price: number;
  status: 'active' | 'cancelled' | 'returned';
}

interface VehicleRow {
  id: number;
  vehicle_name: string;
  registration_number: string;
  daily_rent_price: number;
  availability_status: 'available' | 'booked';
  type: 'car' | 'bike' | 'van' | 'SUV';
}

interface UserRow {
  id: number;
  name: string;
  email: string;
}

export class BookingService {
  static async autoReturnEndedBookings() {
    // Auto-mark as returned where end date < today and status is active
    const updated = await query<{ vehicle_id: number }>(
      `UPDATE bookings
       SET status = 'returned'
       WHERE status = 'active'
         AND rent_end_date < CURRENT_DATE
       RETURNING vehicle_id`
    );

    const vehicleIds = updated.rows.map((r) => r.vehicle_id);
    if (vehicleIds.length > 0) {
      await query(
        `UPDATE vehicles
         SET availability_status = 'available'
         WHERE id = ANY($1::int[])`,
        [vehicleIds]
      );
    }
  }

  static daysBetween(start: string, end: string): number {
    const s = new Date(start);
    const e = new Date(end);
    const diffMs = e.getTime() - s.getTime();
    const days = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    return days;
  }

  static async createBooking(
    actingUser: { id: number; role: 'admin' | 'customer' },
    data: {
      customer_id: number;
      vehicle_id: number;
      rent_start_date: string;
      rent_end_date: string;
    }
  ) {
    const { vehicle_id, rent_start_date, rent_end_date } = data;

    // For customers, force their own id; admins can create for any customer_id
    const customer_id = actingUser.role === 'customer' ? actingUser.id : data.customer_id;

    if (!customer_id) {
      throw new ApiError(400, 'customer_id is required');
    }

    const days = this.daysBetween(rent_start_date, rent_end_date);
    if (days <= 0) {
      throw new ApiError(400, 'rent_end_date must be after rent_start_date');
    }

    // Check vehicle
    const vehicleResult = await query<VehicleRow>(
      'SELECT * FROM vehicles WHERE id = $1',
      [vehicle_id]
    );
    if (vehicleResult.rows.length === 0) {
      throw new ApiError(404, 'Vehicle not found');
    }
    const vehicle = vehicleResult.rows[0];

    if (vehicle.availability_status !== 'available') {
      throw new ApiError(400, 'Vehicle is not available for booking');
    }

    // Check no overlapping active bookings
    const overlap = await query(
      `SELECT id FROM bookings
       WHERE vehicle_id = $1
         AND status = 'active'
         AND NOT (rent_end_date <= $2::date OR rent_start_date >= $3::date)`,
      [vehicle_id, rent_start_date, rent_end_date]
    );

    if (overlap.rows.length > 0) {
      throw new ApiError(400, 'Vehicle already booked for the selected period');
    }

    const total_price = Number(vehicle.daily_rent_price) * days;

    const bookingResult = await query<BookingRow>(
      `INSERT INTO bookings
         (customer_id, vehicle_id, rent_start_date, rent_end_date, total_price, status)
       VALUES ($1, $2, $3, $4, $5, 'active')
       RETURNING id, customer_id, vehicle_id, rent_start_date, rent_end_date, total_price, status`,
      [customer_id, vehicle_id, rent_start_date, rent_end_date, total_price]
    );

    // Update vehicle status
    await query('UPDATE vehicles SET availability_status = $1 WHERE id = $2', [
      'booked',
      vehicle_id,
    ]);

    const booking = bookingResult.rows[0];

    return {
      ...booking,
      vehicle: {
        vehicle_name: vehicle.vehicle_name,
        daily_rent_price: vehicle.daily_rent_price,
      },
    };
  }

  static async getBookingsForUser(actingUser: { id: number; role: 'admin' | 'customer' }) {
    await this.autoReturnEndedBookings();

    if (actingUser.role === 'admin') {
      const result = await query<
        BookingRow & {
          customer_name: string;
          customer_email: string;
          vehicle_name: string;
          vehicle_registration_number: string;
        }
      >(
        `SELECT
           b.id,
           b.customer_id,
           b.vehicle_id,
           b.rent_start_date,
           b.rent_end_date,
           b.total_price,
           b.status,
           u.name AS customer_name,
           u.email AS customer_email,
           v.vehicle_name,
           v.registration_number AS vehicle_registration_number
         FROM bookings b
         JOIN users u ON b.customer_id = u.id
         JOIN vehicles v ON b.vehicle_id = v.id
         ORDER BY b.id`
      );

      const data = result.rows.map((row) => ({
        id: row.id,
        customer_id: row.customer_id,
        vehicle_id: row.vehicle_id,
        rent_start_date: row.rent_start_date,
        rent_end_date: row.rent_end_date,
        total_price: row.total_price,
        status: row.status,
        customer: {
          name: row.customer_name,
          email: row.customer_email,
        },
        vehicle: {
          vehicle_name: row.vehicle_name,
          registration_number: row.vehicle_registration_number,
        },
      }));

      return {
        message: 'Bookings retrieved successfully',
        data,
      };
    } else {
      const result = await query<
        BookingRow & {
          vehicle_name: string;
          registration_number: string;
          type: VehicleRow['type'];
        }
      >(
        `SELECT
           b.id,
           b.vehicle_id,
           b.rent_start_date,
           b.rent_end_date,
           b.total_price,
           b.status,
           v.vehicle_name,
           v.registration_number,
           v.type
         FROM bookings b
         JOIN vehicles v ON b.vehicle_id = v.id
         WHERE b.customer_id = $1
         ORDER BY b.id`,
        [actingUser.id]
      );

      const data = result.rows.map((row) => ({
        id: row.id,
        vehicle_id: row.vehicle_id,
        rent_start_date: row.rent_start_date,
        rent_end_date: row.rent_end_date,
        total_price: row.total_price,
        status: row.status,
        vehicle: {
          vehicle_name: row.vehicle_name,
          registration_number: row.registration_number,
          type: row.type,
        },
      }));

      return {
        message: 'Your bookings retrieved successfully',
        data,
      };
    }
  }

  static async updateBookingStatus(
    actingUser: { id: number; role: 'admin' | 'customer' },
    bookingId: number,
    status: 'cancelled' | 'returned'
  ) {
    const bookingResult = await query<BookingRow>(
      'SELECT * FROM bookings WHERE id = $1',
      [bookingId]
    );
    if (bookingResult.rows.length === 0) {
      throw new ApiError(404, 'Booking not found');
    }
    const booking = bookingResult.rows[0];

    if (booking.status !== 'active') {
      throw new ApiError(400, 'Only active bookings can be updated');
    }

    if (actingUser.role === 'customer') {
      // Customer: can only cancel and only their own booking, before start date
      if (booking.customer_id !== actingUser.id) {
        throw new ApiError(403, 'Forbidden', 'You can only modify your own bookings');
      }
      if (status !== 'cancelled') {
        throw new ApiError(403, 'Forbidden', 'Customers can only cancel bookings');
      }
      const today = new Date();
      const startDate = new Date(booking.rent_start_date);
      if (startDate <= today) {
        throw new ApiError(400, 'Booking can only be cancelled before start date');
      }

      await query(
        `UPDATE bookings SET status = 'cancelled' WHERE id = $1`,
        [bookingId]
      );
      await query(
        `UPDATE vehicles SET availability_status = 'available' WHERE id = $1`,
        [booking.vehicle_id]
      );

      const updated = await query<BookingRow>(
        'SELECT * FROM bookings WHERE id = $1',
        [bookingId]
      );

      return {
        message: 'Booking cancelled successfully',
        booking: updated.rows[0],
      };
    } else {
      // Admin: mark as returned
      if (status !== 'returned') {
        throw new ApiError(403, 'Forbidden', 'Admins can only mark bookings as returned');
      }

      await query(
        `UPDATE bookings SET status = 'returned' WHERE id = $1`,
        [bookingId]
      );
      await query(
        `UPDATE vehicles SET availability_status = 'available' WHERE id = $1`,
        [booking.vehicle_id]
      );

      const updated = await query<BookingRow>(
        'SELECT * FROM bookings WHERE id = $1',
        [bookingId]
      );

      return {
        message: 'Booking marked as returned. Vehicle is now available',
        booking: updated.rows[0],
      };
    }
  }
}
