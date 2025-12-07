# 🚗 Vehicle Rental System API

A backend REST API for a vehicle rental management system built with **Node.js**, **TypeScript**, **Express**, and **PostgreSQL**.

It supports:

- 👤 **Users** (Admin & Customer)
- 🚙 **Vehicles** (inventory management & availability)
- 📅 **Bookings** (rentals, returns, cancellations)
- 🔐 **Authentication** (JWT-based, role-based access control)

---

## 🛠 Tech Stack

- **Runtime:** Node.js
- **Language:** TypeScript
- **Framework:** Express.js
- **Database:** PostgreSQL
- **Auth:** JWT (`jsonwebtoken`), password hashing with `bcrypt`
- **ORM/DB Access:** `pg` (query-based)

---

## 📁 Project Structure

```text
src/
├─ app.ts               # Express app setup
├─ server.ts            # Server bootstrap
├─ config/
│  ├─ env.ts            # Environment variable loader
│  └─ db.ts             # PostgreSQL connection (pg Pool)
├─ middleware/
│  ├─ auth.ts           # Auth guard & role-based checks
│  ├─ errorHandler.ts   # Global error handler
│  └─ asyncHandler.ts   # Async controller wrapper
├─ types/
│  └─ express.d.ts      # Extends Express Request with user object
├─ utils/
│  ├─ ApiError.ts       # Custom error class
│  └─ response.ts       # Standard success/error response helpers
└─ modules/
   ├─ auth/
   │  ├─ auth.controller.ts
   │  ├─ auth.routes.ts
   │  └─ auth.service.ts
   ├─ users/
   │  ├─ user.controller.ts
   │  ├─ user.routes.ts
   │  └─ user.service.ts
   ├─ vehicles/
   │  ├─ vehicle.controller.ts
   │  ├─ vehicle.routes.ts
   │  └─ vehicle.service.ts
   └─ bookings/
      ├─ booking.controller.ts
      ├─ booking.routes.ts
      └─ booking.service.ts
