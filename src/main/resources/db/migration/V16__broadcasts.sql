CREATE TABLE broadcasts (
    id              BIGSERIAL PRIMARY KEY,
    project_id      BIGINT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    subject         VARCHAR(200) NOT NULL,
    body            VARCHAR(10000) NOT NULL,
    sent_at         TIMESTAMP NOT NULL,
    recipient_count INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX idx_broadcasts_project_sent ON broadcasts(project_id, sent_at DESC);
