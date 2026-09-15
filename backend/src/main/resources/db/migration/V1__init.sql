-- V1: Initial schema for TinnitOff backend
-- This migration represents the baseline schema.
-- In production, use `spring.jpa.hibernate.ddl-auto=validate` to verify consistency.

CREATE TABLE IF NOT EXISTS roles (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    email VARCHAR(255) UNIQUE,
    password VARCHAR(255) NOT NULL,
    is_enabled BOOLEAN DEFAULT TRUE,
    role_id BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_users_role FOREIGN KEY (role_id) REFERENCES roles(id)
);

CREATE TABLE IF NOT EXISTS user_devices (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    platform VARCHAR(20),
    device_id VARCHAR(255),
    app_version VARCHAR(20),
    registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_devices_user FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS telemetry_logs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    event_type VARCHAR(50),
    platform VARCHAR(20),
    app_version VARCHAR(20),
    device_info TEXT,
    session_id VARCHAR(100),
    payload TEXT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_telemetry_user FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS thi_results (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    total INTEGER,
    grade VARCHAR(20),
    functional INTEGER,
    emotional INTEGER,
    catastrophic INTEGER,
    answers TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_thi_user FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS audiometries (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    type VARCHAR(50),
    frequency DOUBLE,
    volume INTEGER,
    ear VARCHAR(10),
    measured_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_audiometry_user FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS predictions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    firebase_id VARCHAR(100),
    risk_score INTEGER,
    risk_level VARCHAR(20),
    predicted_window VARCHAR(50),
    top_factors TEXT,
    prevention_actions TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_prediction_user FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS voice_diary (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    transcript TEXT,
    emotional_state VARCHAR(50),
    stress_score INTEGER,
    tinnitus_worsening_risk BOOLEAN,
    recommended_sound VARCHAR(100),
    summary TEXT,
    ai_response TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_voice_diary_user FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS progress_notes (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    text TEXT,
    mood VARCHAR(50),
    note_date TIMESTAMP,
    ai_analysis TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_progress_note_user FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS content_items (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    type VARCHAR(20) NOT NULL,
    title VARCHAR(255),
    summary TEXT,
    body TEXT,
    status VARCHAR(20) DEFAULT 'DRAFT',
    language VARCHAR(5) DEFAULT 'es',
    tags TEXT,
    image_url TEXT,
    action_url TEXT,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS app_releases (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    version VARCHAR(20) NOT NULL,
    build_code INTEGER,
    changelog TEXT,
    force_update BOOLEAN DEFAULT FALSE,
    apk_filename VARCHAR(255),
    file_size_mb DOUBLE,
    sha256_hash VARCHAR(64),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS download_logs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    app_release_id BIGINT,
    user_id BIGINT,
    ip_hash VARCHAR(64),
    user_agent TEXT,
    platform VARCHAR(20),
    downloaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_download_release FOREIGN KEY (app_release_id) REFERENCES app_releases(id),
    CONSTRAINT fk_download_user FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS jwt_tokens (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    token TEXT NOT NULL,
    user_id BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Performance indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_thi_user_created ON thi_results(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_telemetry_user_timestamp ON telemetry_logs(user_id, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_audiometry_user_measured ON audiometries(user_id, measured_at DESC);
CREATE INDEX IF NOT EXISTS idx_prediction_user_created ON predictions(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_voice_diary_user_created ON voice_diary(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_progress_note_user_created ON progress_notes(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_content_status_type ON content_items(status, type);
CREATE INDEX IF NOT EXISTS idx_download_release ON download_logs(app_release_id);
