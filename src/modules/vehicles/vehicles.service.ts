import { query } from '../../db/index';
import { ApiError } from '../../utils/ApiError';

interface VehicleRow {
  id: number;
  vehicle_name: string;
  type: 'car' | 'bike' | 'van' | 'SUV';
  registration_number: string;
  daily_rent_price: number;
  availability_status: 'available' | 'booked';
}

export class VehicleService {
  static async createVehicle(data: {
    vehicle_name: string;
    type: 'car' | 'bike' | 'van' | 'SUV';
    registration_number: string;
    daily_rent_price: number;
    availability_status: 'available' | 'booked';
  }) {
    const { vehicle_name, type, registration_number, daily_rent_price, availability_status } = data;

    if (daily_rent_price <= 0) {
      throw new ApiError(400, 'daily_rent_price must be positive');
    }

    const existing = await query<VehicleRow>(
      'SELECT id FROM vehicles WHERE registration_number = $1',
      [registration_number]
    );
    if (existing.rows.length > 0) {
      throw new ApiError(400, 'Registration number already exists');
    }

    const result = await query<VehicleRow>(
      `INSERT INTO vehicles (vehicle_name, type, registration_number, daily_rent_price, availability_status)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, vehicle_name, type, registration_number, daily_rent_price, availability_status`,
      [vehicle_name, type, registration_number, daily_rent_price, availability_status]
    );

    return result.rows[0];
  }

  static async getAllVehicles() {
    const result = await query<VehicleRow>(
      'SELECT id, vehicle_name, type, registration_number, daily_rent_price, availability_status FROM vehicles ORDER BY id'
    );
    if (result.rows.length === 0) {
      return {
        message: 'No vehicles found',
        data: [] as VehicleRow[],
      };
    }
    return {
      message: 'Vehicles retrieved successfully',
      data: result.rows,
    };
  }

  static async getVehicleById(id: number) {
    const result = await query<VehicleRow>(
      'SELECT id, vehicle_name, type, registration_number, daily_rent_price, availability_status FROM vehicles WHERE id = $1',
      [id]
    );
    if (result.rows.length === 0) {
      throw new ApiError(404, 'Vehicle not found');
    }
    return result.rows[0];
  }

  static async updateVehicle(
    id: number,
    data: Partial<{
      vehicle_name: string;
      type: 'car' | 'bike' | 'van' | 'SUV';
      registration_number: string;
      daily_rent_price: number;
      availability_status: 'available' | 'booked';
    }>
  ) {
    const existing = await query<VehicleRow>('SELECT * FROM vehicles WHERE id = $1', [id]);
    if (existing.rows.length === 0) {
      throw new ApiError(404, 'Vehicle not found');
    }
    const v = existing.rows[0];

    const vehicle_name = data.vehicle_name ?? v.vehicle_name;
    const type = data.type ?? v.type;
    const registration_number = data.registration_number ?? v.registration_number;
    const daily_rent_price = data.daily_rent_price ?? v.daily_rent_price;
    const availability_status = data.availability_status ?? v.availability_status;

    if (daily_rent_price <= 0) {
      throw new ApiError(400, 'daily_rent_price must be positive');
    }

    if (registration_number !== v.registration_number) {
      const existingReg = await query<VehicleRow>(
        'SELECT id FROM vehicles WHERE registration_number = $1 AND id <> $2',
        [registration_number, id]
      );
      if (existingReg.rows.length > 0) {
        throw new ApiError(400, 'Registration number already exists');
      }
    }

    const result = await query<VehicleRow>(
      `UPDATE vehicles
       SET vehicle_name = $1,
           type = $2,
           registration_number = $3,
           daily_rent_price = $4,
           availability_status = $5
       WHERE id = $6
       RETURNING id, vehicle_name, type, registration_number, daily_rent_price, availability_status`,
      [vehicle_name, type, registration_number, daily_rent_price, availability_status, id]
    );

    return result.rows[0];
  }

  static async deleteVehicle(id: number) {
    const activeBookings = await query(
      'SELECT id FROM bookings WHERE vehicle_id = $1 AND status = $2',
      [id, 'active']
    );
    if (activeBookings.rows.length > 0) {
      throw new ApiError(400, 'Vehicle cannot be deleted with active bookings');
    }

    const result = await query('DELETE FROM vehicles WHERE id = $1', [id]);
    if (result.rowCount === 0) {
      throw new ApiError(404, 'Vehicle not found');
    }
  }
}
