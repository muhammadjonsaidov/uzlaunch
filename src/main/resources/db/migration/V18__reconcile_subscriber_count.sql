UPDATE projects
SET subscriber_count = COALESCE((
    SELECT COUNT(*) FROM subscribers
    WHERE subscribers.project_id = projects.id AND subscribers.confirmed = true
), 0);
