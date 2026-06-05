DROP INDEX IF EXISTS idx_subscribers_token;
ALTER TABLE subscribers ADD CONSTRAINT uq_subscribers_token UNIQUE (token);
