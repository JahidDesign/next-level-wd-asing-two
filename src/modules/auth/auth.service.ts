import bcrypt from "bcrypt";
import jwt, { Secret, SignOptions } from "jsonwebtoken";
import  db  from "../../db/db";
import { config } from "../../config/env";
import { ApiError } from "../../utils/ApiError";
import { User, UserRole } from "../users/user.types";

interface SignupInput {
  name: string;
  email: string;
  password: string;
  phone: string;
  role?: UserRole; 
}

interface SigninInput {
  email: string;
  password: string;
}

export class AuthService {
 
  static async signup(data: SignupInput) {
    const { name, email, password, phone } = data;
    const normalizedEmail = email.toLowerCase();

    if (password.length < 6) {
      throw new ApiError(400, "Password must be at least 6 characters");
    }

   
    const existing = await db.query<{ id: number }>(
      "SELECT id FROM users WHERE email = $1",
      [normalizedEmail]
    );

    if (existing.rowCount && existing.rowCount > 0) {
      throw new ApiError(400, "Email already in use");
    }

    const hashed = await bcrypt.hash(password, config.bcrypt.saltRounds);

    
    const role: UserRole = "customer";

    const result = await db.query<User>(
      `INSERT INTO users (name, email, password, phone, role)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, name, email, phone, role`,
      [name, normalizedEmail, hashed, phone, role]
    );

    return result.rows[0];
  }

  
  static async signin(data: SigninInput) {
    const { email, password } = data;
    const normalizedEmail = email.toLowerCase();

    
    const result = await db.query<User>(
      "SELECT * FROM users WHERE email = $1",
      [normalizedEmail]
    );

    if (!result.rowCount) {
      throw new ApiError(401, "Invalid email or password");
    }

    const user = result.rows[0];

    
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      throw new ApiError(401, "Invalid email or password");
    }

  
    const jwtSecret: Secret = config.jwt.secret;

    const signOptions: SignOptions = {
      expiresIn: config.jwt.expiresIn as SignOptions["expiresIn"], 
    };

    const token = jwt.sign(
      { id: user.id, role: user.role },
      jwtSecret,
      signOptions
    );

    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
    };
  }
}
