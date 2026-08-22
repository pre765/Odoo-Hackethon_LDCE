# GlobeTrotter API

Express + PostgreSQL backend for the travel-planning screens.

## Setup

1. Create a PostgreSQL database named `globetrotter`.
2. Run `database/schema.sql`, then `database/migrations/001_auth_profile.sql` and `database/migrations/002_trip_improvements`.
3. Copy `.env.example` to `.env` and set `DATABASE_URL` and a JWT secret of at least 32 characters.
4. Run `npm install`, then `npm run dev` from this directory.

All protected endpoints require `Authorization: Bearer <token>`.

## API surface

| Feature | Endpoints |
| --- | --- |
| Authentication & profile | `POST /api/auth/signup`, `POST /api/auth/login`, password reset endpoints, `GET/PATCH/DELETE /api/auth/me` |
| Dashboard | `GET /api/dashboard` |
| Cities & activities | `GET /api/cities`, `/recommended`, `/:id`; `GET /api/activities`, `/:id` |
| Trips | `GET/POST /api/trips`, `GET/PATCH/DELETE /api/trips/:tripId` |
| Itinerary builder | stop CRUD and stop ordering under `/api/trips/:tripId/stops` plus itinerary-item CRUD |
| Calendar & budget | `GET /api/trips/:tripId/calendar`, `GET /api/trips/:tripId/budget` |
| Sharing | `PATCH /api/trips/:tripId/sharing`, `GET /api/trips/public/:slug`, `POST /api/trips/public/:slug/copy` |
| Saved destinations | `GET/POST/DELETE /api/auth/me/saved-destinations` |

Responses use `{ "data": ... }`; validation and authorization failures use `{ "error": "..." }`.
