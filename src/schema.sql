

CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  phone VARCHAR(50) NOT NULL,
  role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'customer'))
);

CREATE TABLE IF NOT EXISTS vehicles (
  id SERIAL PRIMARY KEY,
  vehicle_name VARCHAR(255) NOT NULL,
  type VARCHAR(20) NOT NULL CHECK (type IN ('car', 'bike', 'van', 'SUV')),
  registration_number VARCHAR(100) NOT NULL UNIQUE,
  daily_rent_price NUMERIC(10,2) NOT NULL CHECK (daily_rent_price > 0),
  availability_status VARCHAR(20) NOT NULL CHECK (availability_status IN ('available', 'booked'))
);

CREATE TABLE IF NOT EXISTS bookings (
  id SERIAL PRIMARY KEY,
  customer_id INTEGER NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  vehicle_id INTEGER NOT NULL REFERENCES vehicles(id) ON DELETE RESTRICT,
  rent_start_date DATE NOT NULL,
  rent_end_date DATE NOT NULL,
  total_price NUMERIC(10,2) NOT NULL CHECK (total_price > 0),
  status VARCHAR(20) NOT NULL CHECK (status IN ('active', 'cancelled', 'returned'))
);

CREATE INDEX IF NOT EXISTS idx_bookings_customer_id ON bookings(customer_id);
CREATE INDEX IF NOT EXISTS idx_bookings_vehicle_id ON bookings(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
