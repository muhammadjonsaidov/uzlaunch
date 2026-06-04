ALTER TABLE subscribers
    ADD COLUMN token     VARCHAR(255),
    ADD COLUMN confirmed BOOLEAN NOT NULL DEFAULT FALSE;

CREATE INDEX idx_subscribers_token ON subscribers(token) WHERE token IS NOT NULL;