import path from "path";
import dotenv from "dotenv";


dotenv.config({
  path: path.resolve(process.cwd(), ".env"),
});

// Debug (optional)
console.log("ENV DATABASE_URL:", process.env.DATABASE_URL);

export const config = {
  port: Number(process.env.PORT || 5000),

  db: {
    connectionString: process.env.DATABASE_URL || "",
  },

  jwt: {
    secret: process.env.JWT_SECRET || "",
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  },

  bcrypt: {
    saltRounds: Number(process.env.BCRYPT_SALT_ROUNDS || 10),
  },
};

export default config;
