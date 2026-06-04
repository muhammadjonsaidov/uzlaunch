CREATE TABLE users (
    id            VARCHAR(255) PRIMARY KEY,
    email         VARCHAR(255) NOT NULL UNIQUE,
    name          VARCHAR(255),
    password_hash VARCHAR(255),
    plan          VARCHAR(255) NOT NULL DEFAULT 'FREE',
    created_at    TIMESTAMP
);

CREATE TABLE projects (
    id               BIGSERIAL PRIMARY KEY,
    user_id          VARCHAR(255) NOT NULL REFERENCES users(id),
    slug             VARCHAR(255) NOT NULL UNIQUE,
    name             VARCHAR(255) NOT NULL,
    tagline          VARCHAR(255),
    description      VARCHAR(1000),
    logo_url         VARCHAR(255),
    launch_date      DATE,
    subscriber_count INTEGER NOT NULL DEFAULT 0,
    created_at       TIMESTAMP
);

CREATE INDEX idx_projects_user_id ON projects(user_id);

CREATE TABLE subscribers (
    id            BIGSERIAL PRIMARY KEY,
    project_id    BIGINT NOT NULL REFERENCES projects(id),
    email         VARCHAR(255) NOT NULL,
    name          VARCHAR(255),
    subscribed_at TIMESTAMP
);

CREATE INDEX idx_subscribers_project_id ON subscribers(project_id);