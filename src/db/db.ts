import { Pool } from "pg";

const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "vehiclerental",
  password: "admin123",
  port: 5432,
});

pool.connect()
  .then(() => console.log("PostgreSQL connected"))
  .catch(err => console.error("Connection error", err));

export default pool;
