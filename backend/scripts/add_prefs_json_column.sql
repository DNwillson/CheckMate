-- Run once if your database was created before prefs_json existed.
-- mysql -u USER -p checkmate < scripts/add_prefs_json_column.sql
USE checkmate;

ALTER TABLE app_preferences
  ADD COLUMN prefs_json JSON NULL
  AFTER theme_key;
