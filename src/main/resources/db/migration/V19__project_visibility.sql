ALTER TABLE projects ADD COLUMN is_public BOOLEAN NOT NULL DEFAULT TRUE;
CREATE INDEX idx_projects_public_listing ON projects(is_public, subscriber_count DESC);
