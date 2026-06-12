ALTER TABLE subscribers ADD COLUMN referral_code VARCHAR(16);
ALTER TABLE subscribers ADD CONSTRAINT subscribers_referral_code_key UNIQUE (referral_code);
CREATE INDEX idx_subscribers_referral_code ON subscribers(referral_code);

ALTER TABLE subscribers ADD COLUMN referred_by_id BIGINT;
ALTER TABLE subscribers ADD CONSTRAINT fk_subscribers_referred_by FOREIGN KEY (referred_by_id) REFERENCES subscribers(id) ON DELETE SET NULL;
CREATE INDEX idx_subscribers_referred_by ON subscribers(referred_by_id);

ALTER TABLE subscribers ADD COLUMN referral_count INTEGER NOT NULL DEFAULT 0;
CREATE INDEX idx_subscribers_ranking ON subscribers(project_id, confirmed, referral_count DESC, confirmed_at ASC);
