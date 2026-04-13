-- Optional manual migration if auto-upgrade on startup is disabled.
ALTER TABLE users ADD COLUMN display_name VARCHAR(120) NULL;
