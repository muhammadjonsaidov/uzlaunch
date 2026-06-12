ALTER TABLE subscribers ADD COLUMN utm_source VARCHAR(100);
ALTER TABLE subscribers ADD COLUMN utm_medium VARCHAR(100);
ALTER TABLE subscribers ADD COLUMN utm_campaign VARCHAR(100);
CREATE INDEX idx_subscribers_utm_source ON subscribers(project_id, utm_source);
