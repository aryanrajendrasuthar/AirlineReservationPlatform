# Airline Reservation Platform

A full-stack airline booking system built with **Spring Boot 3.2**, **React 18 + TypeScript**, **Apache Kafka**, **Redis**, and **Stripe** payments.

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        React Frontend (Vite)                     │
│  Home · Search · Booking Wizard · My Bookings · Admin Dashboard  │
│              Stripe Elements · jsPDF · Tailwind CSS              │
└──────────────────────────┬──────────────────────────────────────┘
                           │ HTTP (Axios, proxied /api)
┌──────────────────────────▼──────────────────────────────────────┐
│                    Spring Boot 3.2 API                           │
│   AuthController  FlightController  BookingController  Admin     │
│   Spring Security + JWT (JJWT 0.12.3)  ·  @Valid DTOs           │
└──────┬────────────────┬─────────────────┬───────────────────────┘
       │                │                 │
┌──────▼──────┐  ┌──────▼──────┐  ┌──────▼──────────────────────┐
│ PostgreSQL  │  │    Redis     │  │       Apache Kafka           │
│  (JPA/DDL)  │  │  Seat Locks  │  │  booking-requests            │
│  5 entities │  │  10-min TTL  │  │  booking-confirmed           │
│  5 seeded   │  │  Search cache│  │  booking-failed              │
│  flights    │  │  5-min TTL   │  └─────────────┬───────────────┘
└─────────────┘  └─────────────┘                │
                                          ┌──────▼──────┐
                                          │  Kafka       │
                                          │  Consumer    │
                                          │  → Email     │
                                          │  (JavaMail)  │
                                          └─────────────┘
```

## Tech Stack

| Layer       | Technology                                          |
|-------------|-----------------------------------------------------|
| Backend     | Java 17, Spring Boot 3.2.0                          |
| Security    | Spring Security, JWT (JJWT 0.12.3), BCrypt          |
| Database    | PostgreSQL 15, Spring Data JPA (Hibernate auto-DDL) |
| Cache       | Redis 7 (Lettuce), seat lock + search cache         |
| Messaging   | Apache Kafka 3.5 (3 topics, 3 partitions each)      |
| Payments    | Stripe Java SDK 24.0.0 (PaymentIntent flow)         |
| Email       | Spring Mail (JavaMailSender, HTML templates)        |
| Frontend    | React 18, TypeScript 5, Vite 5                      |
| Styling     | Tailwind CSS 3 (custom airline theme)               |
| PDF         | jsPDF (e-ticket download)                           |
| Container   | Docker, Docker Compose                              |

## Features

- **Flight Search** — Search by origin/destination/date, filter by cabin class, sort by price/duration
- **Interactive Seat Map** — SVG aircraft diagram with real-time seat availability
- **Multi-Step Booking Wizard** — Flight review → Seat selection → Passenger details → Payment → Confirmation
- **Stripe Sandbox Payments** — Full PaymentIntent flow with card element
- **Redis Seat Locking** — 10-minute TTL prevents double-booking race conditions
- **Kafka Event Flow** — Async booking events for email confirmation
- **JWT Authentication** — Stateless auth, USER and ADMIN roles
- **Admin Dashboard** — Full CRUD for flights, view all bookings
- **E-Ticket PDF** — Download boarding-pass style ticket with jsPDF
- **Email Confirmation** — HTML email sent on booking confirmation

## Quick Start

### Prerequisites
- Java 17+, Maven 3.8+
- Node.js 18+, npm
- Docker & Docker Compose

### 1. Start Infrastructure

```bash
docker-compose up -d postgres redis zookeeper kafka
```

### 2. Configure Environment

```bash
cp .env.example .env
# Edit .env with your Stripe keys and mail credentials
```

### 3. Run Backend

```bash
cd backend
mvn spring-boot:run
# API at http://localhost:8080
```

### 4. Run Frontend

```bash
cd frontend
cp .env.example .env
# Set VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
npm install
npm run dev
# App at http://localhost:5173
```

### 5. Full Docker Stack

```bash
docker-compose up --build
```

## API Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/auth/register` | Public | Register new user |
| POST | `/api/auth/login` | Public | Login, returns JWT |
| GET | `/api/flights/search` | Public | Search flights |
| GET | `/api/flights/{id}/seats` | Public | Get seat map |
| POST | `/api/bookings` | USER | Initiate booking + lock seats |
| POST | `/api/bookings/{ref}/confirm` | USER | Confirm after Stripe payment |
| POST | `/api/bookings/{ref}/cancel` | USER | Cancel booking |
| GET | `/api/bookings/my` | USER | My booking history |
| GET | `/api/admin/flights` | ADMIN | All flights (CRUD) |
| GET | `/api/admin/bookings` | ADMIN | All bookings |

## Booking Flow

```
User selects seats → POST /api/bookings
  → Redis locks seats (10-min TTL)
  → Stripe PaymentIntent created
  → Kafka: booking-requests published

User completes payment → POST /api/bookings/{ref}/confirm
  → Stripe payment verified
  → DB seats marked BOOKED
  → Redis locks cleared
  → Kafka: booking-confirmed published
  → Consumer sends HTML confirmation email
```

## Default Credentials

| Role  | Email             | Password |
|-------|-------------------|----------|
| ADMIN | admin@airline.com | admin123 |
| USER  | user@airline.com  | user123  |

## Stripe Test Cards

| Card Number          | Description        |
|---------------------|--------------------|
| 4242 4242 4242 4242 | Successful payment |
| 4000 0000 0000 9995 | Declined           |

Use any future expiry date and any 3-digit CVC.
