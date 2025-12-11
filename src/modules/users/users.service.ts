import { query } from '../../db/index';
import { ApiError } from '../../utils/ApiError';

interface UserRow {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: 'admin' | 'customer';
}

export class UserService {
  static async getAllUsers() {
    const result = await query<UserRow>('SELECT id, name, email, phone, role FROM users ORDER BY id');
    return result.rows;
  }

  static async getUserById(id: number) {
    const result = await query<UserRow>('SELECT id, name, email, phone, role FROM users WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      throw new ApiError(404, 'User not found');
    }
    return result.rows[0];
  }

  static async updateUser(
    actingUser: { id: number; role: 'admin' | 'customer' },
    targetUserId: number,
    data: { name?: string; email?: string; phone?: string; role?: 'admin' | 'customer' }
  ) {
    const current = await query<UserRow>('SELECT * FROM users WHERE id = $1', [targetUserId]);
    if (current.rows.length === 0) throw new ApiError(404, 'User not found');
    const user = current.rows[0];

    if (actingUser.role !== 'admin' && actingUser.id !== targetUserId) {
      throw new ApiError(403, 'Forbidden', 'You can only update your own profile');
    }

    let newRole = user.role;
    if (actingUser.role === 'admin' && data.role) {
      newRole = data.role;
    }

    const newName = data.name ?? user.name;
    const newEmail = (data.email ?? user.email).toLowerCase();
    const newPhone = data.phone ?? user.phone;

    // unique email check
    const existingEmail = await query<UserRow>(
      'SELECT id FROM users WHERE email = $1 AND id <> $2',
      [newEmail, targetUserId]
    );
    if (existingEmail.rows.length > 0) {
      throw new ApiError(400, 'Email already in use', 'Email already in use');
    }

    const updated = await query<UserRow>(
      `UPDATE users
       SET name = $1, email = $2, phone = $3, role = $4
       WHERE id = $5
       RETURNING id, name, email, phone, role`,
      [newName, newEmail, newPhone, newRole, targetUserId]
    );

    return updated.rows[0];
  }

  static async deleteUser(userId: number) {
    // cannot delete if active bookings exist
    const activeBookings = await query(
      'SELECT id FROM bookings WHERE customer_id = $1 AND status = $2',
      [userId, 'active']
    );
    if (activeBookings.rows.length > 0) {
      throw new ApiError(400, 'User cannot be deleted with active bookings');
    }

    const result = await query('DELETE FROM users WHERE id = $1', [userId]);
    if (result.rowCount === 0) {
      throw new ApiError(404, 'User not found');
    }
  }
}
