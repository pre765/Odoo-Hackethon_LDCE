-- GlobeTrotter PostgreSQL Schema
-- Based on the provided Claude implementation plan.

-- ============ USERS ============
CREATE TABLE users (
    id            SERIAL PRIMARY KEY,
    first_name    VARCHAR(60)  NOT NULL,
    last_name     VARCHAR(60),
    email         VARCHAR(160) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    phone         VARCHAR(20),
    city          VARCHAR(80),
    country       VARCHAR(80),
    photo_url     TEXT,
    language_pref VARCHAR(10)  DEFAULT 'en',
    is_admin      BOOLEAN      NOT NULL DEFAULT FALSE,
    created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);

-- ============ MASTER DATA ============
CREATE TABLE cities (
    id           SERIAL PRIMARY KEY,
    name         VARCHAR(120) NOT NULL,
    country      VARCHAR(120) NOT NULL,
    region       VARCHAR(120),
    cost_index   NUMERIC(5,2),
    popularity   INTEGER DEFAULT 0,
    latitude     NUMERIC(9,6),
    longitude    NUMERIC(9,6),
    image_url    TEXT,
    description  TEXT,
    UNIQUE (name, country)
);

CREATE INDEX idx_cities_name    ON cities(LOWER(name));
CREATE INDEX idx_cities_country ON cities(country);

CREATE TYPE activity_category AS ENUM
    ('sightseeing','food','adventure','culture','nature','nightlife','shopping','relaxation');

CREATE TABLE activities (
    id             SERIAL PRIMARY KEY,
    city_id        INTEGER NOT NULL REFERENCES cities(id) ON DELETE CASCADE,
    name           VARCHAR(160) NOT NULL,
    category       activity_category NOT NULL,
    description    TEXT,
    cost           NUMERIC(10,2) NOT NULL DEFAULT 0,
    duration_mins  INTEGER       NOT NULL DEFAULT 60,
    image_url      TEXT,
    rating         NUMERIC(2,1)
);

CREATE INDEX idx_activities_city     ON activities(city_id);
CREATE INDEX idx_activities_category ON activities(category);

-- ============ TRIPS ============
CREATE TABLE trips (
    id              SERIAL PRIMARY KEY,
    user_id         INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name            VARCHAR(160) NOT NULL,
    description     TEXT,
    start_date      DATE NOT NULL,
    end_date        DATE NOT NULL,
    cover_photo_url TEXT,
    total_budget    NUMERIC(12,2),
    is_public       BOOLEAN NOT NULL DEFAULT FALSE,
    public_slug     VARCHAR(24) UNIQUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_trip_dates CHECK (end_date >= start_date)
);

CREATE INDEX idx_trips_user ON trips(user_id);
CREATE INDEX idx_trips_slug ON trips(public_slug);

CREATE TYPE transport_mode AS ENUM
    ('flight','train','bus','car','ferry','other');

CREATE TABLE trip_stops (
    id                 SERIAL PRIMARY KEY,
    trip_id            INTEGER NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
    city_id            INTEGER NOT NULL REFERENCES cities(id),
    order_index        INTEGER NOT NULL,
    start_date         DATE NOT NULL,
    end_date           DATE NOT NULL,
    transport_mode     transport_mode,
    transport_cost     NUMERIC(10,2) DEFAULT 0,
    accommodation_cost NUMERIC(10,2) DEFAULT 0,
    meal_cost          NUMERIC(10,2) DEFAULT 0,
    notes              TEXT,
    CONSTRAINT chk_stop_dates CHECK (end_date >= start_date),
    UNIQUE (trip_id, order_index) DEFERRABLE INITIALLY DEFERRED
);

CREATE INDEX idx_stops_trip ON trip_stops(trip_id);

CREATE TABLE itinerary_items (
    id             SERIAL PRIMARY KEY,
    trip_stop_id   INTEGER NOT NULL REFERENCES trip_stops(id) ON DELETE CASCADE,
    activity_id    INTEGER REFERENCES activities(id),
    custom_title   VARCHAR(160),
    scheduled_date DATE NOT NULL,
    start_time     TIME,
    duration_mins  INTEGER DEFAULT 60,
    cost           NUMERIC(10,2) NOT NULL DEFAULT 0,
    notes          TEXT,
    order_index    INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT chk_item_title
        CHECK (activity_id IS NOT NULL OR custom_title IS NOT NULL)
);

CREATE INDEX idx_items_stop ON itinerary_items(trip_stop_id);
CREATE INDEX idx_items_date ON itinerary_items(scheduled_date);

-- ============ SOCIAL / EXTRAS ============
CREATE TABLE saved_destinations (
    user_id  INTEGER REFERENCES users(id)  ON DELETE CASCADE,
    city_id  INTEGER REFERENCES cities(id) ON DELETE CASCADE,
    saved_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (user_id, city_id)
);

CREATE TABLE community_posts (
    id         SERIAL PRIMARY KEY,
    user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    trip_id    INTEGER REFERENCES trips(id) ON DELETE SET NULL,
    city_id    INTEGER REFERENCES cities(id),
    title      VARCHAR(200) NOT NULL,
    body       TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Verify the schema after running:
-- SELECT table_name FROM information_schema.tables
-- WHERE table_schema = 'public' ORDER BY table_name;
