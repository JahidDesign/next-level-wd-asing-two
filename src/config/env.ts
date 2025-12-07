// src/config/env.ts
import path from "path";
import dotenv from "dotenv";


dotenv.config({
  path: path.resolve(__dirname, "../../.env"),
});

console.log("DEBUG __dirname =", __dirname);
console.log("DEBUG .env path =", path.resolve(__dirname, "../../.env"));
console.log("DEBUG DATABASE_URL =", process.env.DATABASE_URL);

function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

// ... rest stays the same
export interface AppConfig {
  port: number;
  db: {
    connectionString: string;
  };
  jwt: {
    secret: string;
    expiresIn: string | number;
  };
  bcrypt: {
    saltRounds: number;
  };
}

export const config: AppConfig = {
  port: Number(process.env.PORT ?? 5000),

  db: {
    connectionString: required("DATABASE_URL"),
  },

  jwt: {
    secret: required("JWT_SECRET"),
    expiresIn: process.env.JWT_EXPIRES_IN ?? "7d",
  },

  bcrypt: {
    saltRounds: Number(process.env.BCRYPT_SALT_ROUNDS ?? 10),
  },
};
