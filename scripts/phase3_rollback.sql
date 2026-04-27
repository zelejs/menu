-- Rollback script: Remove pid column from t_app_res_relation
-- WARNING: This will permanently remove the pid column and all data

-- Drop the pid column
ALTER TABLE `t_app_res_relation` DROP COLUMN `pid`;

-- Verify the column was dropped
SELECT COUNT(*) as pid_column_exists
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = DATABASE()
AND TABLE_NAME = 't_app_res_relation'
AND COLUMN_NAME = 'pid';
