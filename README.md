# 🍔 Food Ordering App

A production-grade food ordering web application with **Role-Based Access Control (RBAC)** and **Country-Based Access Control**, built with **Next.js**, **NestJS**, **PostgreSQL**, and **Prisma ORM**.

---

## 🏗️ Architecture

```
Food-Ordering-App/
├── backend/                  # NestJS API Server
│   ├── prisma/
│   │   ├── schema.prisma     # Database schema
│   │   └── seed.ts           # Seed data
│   └── src/
│       ├── auth/             # JWT authentication
│       ├── common/           # Guards, decorators, types
│       ├── orders/           # Order CRUD + checkout/cancel
│       ├── payments/         # Payment method management
│       ├── prisma/           # Prisma service (global)
│       ├── restaurants/      # Restaurant & menu listing
│       ├── users/            # User listing
│       ├── app.module.ts
│       └── main.ts
├── frontend/                 # Next.js App (App Router)
│   └── src/
│       ├── app/
│       │   ├── login/        # Login page
│       │   ├── restaurants/  # Restaurant listing
│       │   ├── menu/         # Menu items per restaurant
│       │   ├── cart/         # Shopping cart
│       │   └── orders/       # Order history & actions
│       ├── components/       # Navbar, AuthGuard
│       ├── context/          # Auth & Cart context providers
│       ├── lib/              # API client, permissions
│       └── types/            # TypeScript interfaces
└── README.md
```

---

## 🔐 Access Control

### Roles & Permissions

| Action              | ADMIN | MANAGER | MEMBER |
|---------------------|:-----:|:-------:|:------:|
| View Restaurants    |   ✅  |   ✅    |   ✅   |
| View Menu           |   ✅  |   ✅    |   ✅   |
| Create Order        |   ✅  |   ✅    |   ✅   |
| Checkout Order      |   ✅  |   ✅    |   ❌   |
| Cancel Order        |   ✅  |   ✅    |   ❌   |
| Update Payment      |   ✅  |   ❌    |   ❌   |

### Country Restrictions

| Role    | Data Access                    |
|---------|--------------------------------|
| ADMIN   | All countries (GLOBAL)         |
| MANAGER | Own country only               |
| MEMBER  | Own country only               |

### Seed Users

| Name             | Email                           | Role    | Country |
|------------------|---------------------------------|---------|---------|
| Nick Fury        | nick.fury@avengers.com          | ADMIN   | GLOBAL  |
| Captain Marvel   | captain.marvel@avengers.com     | MANAGER | INDIA   |
| Captain America  | captain.america@avengers.com    | MANAGER | AMERICA |
| Thanos           | thanos@avengers.com             | MEMBER  | INDIA   |
| Thor             | thor@avengers.com               | MEMBER  | INDIA   |
| Travis           | travis@avengers.com             | MEMBER  | AMERICA |

**All passwords:** `password123`

---

## 🚀 Setup Instructions

### Prerequisites

- **Node.js** >= 18
- **PostgreSQL** running locally (or via Docker)
- **npm** or **yarn**

### 1. Clone & Install

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 2. Configure Database

Create a PostgreSQL database:

```sql
CREATE DATABASE food_ordering_db;
```

Update `backend/.env` with your PostgreSQL connection:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/food_ordering_db?schema=public"
JWT_SECRET="super-secret-jwt-key-food-ordering-2026"
JWT_EXPIRES_IN="24h"
PORT=4000
```

### 3. Run Migrations & Seed

```bash
cd backend
npx prisma generate
npx prisma migrate dev --name init
npm run prisma:seed
```

### 4. Start the Application

```bash
# Terminal 1 - Backend (http://localhost:4000)
cd backend
npm run start:dev

# Terminal 2 - Frontend (http://localhost:3000)
cd frontend
npm run dev
```

### 5. Open Browser

Navigate to `http://localhost:3000` and login with any seed user.

---

## 📡 API Endpoints

All endpoints are prefixed with `/api`.

### Authentication

| Method | Endpoint       | Auth | Description       |
|--------|----------------|------|-------------------|
| POST   | /auth/login    | No   | Login with email & password |

### Restaurants

| Method | Endpoint              | Auth | Description              |
|--------|-----------------------|------|--------------------------|
| GET    | /restaurants          | JWT  | List restaurants (country-filtered) |
| GET    | /restaurants/:id      | JWT  | Get restaurant details    |
| GET    | /restaurants/:id/menu | JWT  | Get restaurant menu       |

### Orders

| Method | Endpoint              | Auth      | Description              |
|--------|-----------------------|-----------|--------------------------|
| POST   | /orders               | JWT       | Create a new order       |
| GET    | /orders               | JWT       | List orders (filtered)   |
| GET    | /orders/:id           | JWT       | Get order details        |
| POST   | /orders/:id/checkout  | JWT + ADMIN/MANAGER | Checkout order  |
| POST   | /orders/:id/cancel    | JWT + ADMIN/MANAGER | Cancel order    |

### Payments

| Method | Endpoint              | Auth       | Description              |
|--------|-----------------------|------------|--------------------------|
| GET    | /payment-method       | JWT        | Get user payment methods |
| PUT    | /payment-method/:id   | JWT + ADMIN | Update payment method   |

---

## 🛡️ Security Features

- **JWT Authentication** with Passport.js
- **Role-based guards** (RolesGuard) for endpoint protection
- **Country-based filtering** at the service level
- **DTO validation** with class-validator
- **Password hashing** with bcrypt
- **CORS** configuration
- **Global validation pipes** with whitelist

---

## 🧰 Tech Stack

| Layer     | Technology                    |
|-----------|-------------------------------|
| Frontend  | Next.js 15, React 19, Tailwind CSS 3 |
| Backend   | NestJS 11, Passport, JWT      |
| Database  | PostgreSQL, Prisma ORM        |
| Language  | TypeScript (everywhere)       |
