CREATE TABLE page_events (
    id          BIGSERIAL PRIMARY KEY,
    project_id  BIGINT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    event_type  VARCHAR(32) NOT NULL,
    utm_source  VARCHAR(100),
    created_at  TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_page_events_project_type_time ON page_events(project_id, event_type, created_at DESC);

CREATE TABLE webhooks (
    id              BIGSERIAL PRIMARY KEY,
    project_id      BIGINT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    url             VARCHAR(500) NOT NULL,
    events          VARCHAR(255) NOT NULL DEFAULT 'subscriber.created,subscriber.confirmed',
    secret          VARCHAR(128),
    active          BOOLEAN NOT NULL DEFAULT TRUE,
    failure_count   INTEGER NOT NULL DEFAULT 0,
    last_attempt_at TIMESTAMP,
    last_status     INTEGER,
    created_at      TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_webhooks_project ON webhooks(project_id);

CREATE TABLE webhook_deliveries (
    id            BIGSERIAL PRIMARY KEY,
    webhook_id    BIGINT NOT NULL REFERENCES webhooks(id) ON DELETE CASCADE,
    event_type    VARCHAR(32) NOT NULL,
    payload       VARCHAR(4000) NOT NULL,
    status_code   INTEGER,
    response_body VARCHAR(500),
    error         VARCHAR(500),
    attempt_count INTEGER NOT NULL DEFAULT 1,
    delivered_at  TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_deliveries_webhook_time ON webhook_deliveries(webhook_id, delivered_at DESC);
