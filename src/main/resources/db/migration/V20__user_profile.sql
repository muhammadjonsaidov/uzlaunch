ALTER TABLE users ADD COLUMN username VARCHAR(32);
ALTER TABLE users ADD COLUMN bio VARCHAR(300);
ALTER TABLE users ADD COLUMN avatar_url VARCHAR(500);
ALTER TABLE users ADD COLUMN twitter VARCHAR(100);
ALTER TABLE users ADD COLUMN github VARCHAR(100);
ALTER TABLE users ADD COLUMN linkedin VARCHAR(100);
ALTER TABLE users ADD COLUMN website VARCHAR(200);

-- Backfill: derive username from email local-part for existing users
UPDATE users SET username = (
  CASE
    WHEN POSITION('@' IN email) > 0 THEN LOWER(REGEXP_REPLACE(SUBSTRING(email FROM 1 FOR POSITION('@' IN email) - 1), '[^a-z0-9]', '', 'g'))
    ELSE LOWER(REGEXP_REPLACE(email, '[^a-z0-9]', '', 'g'))
  END
) || '-' || SUBSTRING(id, 1, 4);

ALTER TABLE users ADD CONSTRAINT users_username_key UNIQUE (username);
CREATE INDEX idx_users_username ON users(username);
