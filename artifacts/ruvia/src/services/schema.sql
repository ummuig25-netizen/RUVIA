CREATE TABLE profiles (
  id VARCHAR(255) PRIMARY KEY,
  role VARCHAR(50) NOT NULL,
  avatar VARCHAR(255),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  created_at BIGINT NOT NULL
);

CREATE TABLE taxis (
  id VARCHAR(255) PRIMARY KEY,
  driver_id VARCHAR(255) NOT NULL,
  status VARCHAR(50) NOT NULL,
  location_lat DOUBLE PRECISION NOT NULL,
  location_lng DOUBLE PRECISION NOT NULL,
  location_heading DOUBLE PRECISION NOT NULL,
  plate VARCHAR(50) NOT NULL,
  model VARCHAR(100) NOT NULL,
  category VARCHAR(50) NOT NULL DEFAULT 'standard',
  FOREIGN KEY (driver_id) REFERENCES profiles(id)
);

CREATE TABLE trips (
  id VARCHAR(255) PRIMARY KEY,
  passenger_id VARCHAR(255) NOT NULL,
  passenger_name VARCHAR(255),
  driver_id VARCHAR(255),
  status VARCHAR(50) NOT NULL,
  fare DOUBLE PRECISION NOT NULL,
  distance_km DOUBLE PRECISION NOT NULL,
  pickup_lat DOUBLE PRECISION NOT NULL,
  pickup_lng DOUBLE PRECISION NOT NULL,
  dest_lat DOUBLE PRECISION NOT NULL,
  dest_lng DOUBLE PRECISION NOT NULL,
  category VARCHAR(50) NOT NULL DEFAULT 'standard',
  path JSON,
  created_at BIGINT NOT NULL,
  accepted_at BIGINT,
  completed_at BIGINT,
  scheduled_for BIGINT,
  FOREIGN KEY (passenger_id) REFERENCES profiles(id),
  FOREIGN KEY (driver_id) REFERENCES profiles(id)
);
