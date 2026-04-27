-- Phase 1: Add pid column to t_app_res_relation
-- This script adds the pid field to support application-level menu hierarchy

-- Add pid column to t_app_res_relation
ALTER TABLE `t_app_res_relation`
ADD COLUMN `pid` bigint(20) DEFAULT NULL COMMENT '应用级父菜单ID（仅当 res_type=menu 时有效）' AFTER `res_type`,
ADD KEY `idx_pid` (`pid`);

-- Verify the column was added
SELECT COLUMN_NAME, COLUMN_TYPE, IS_NULLABLE, COLUMN_DEFAULT, COLUMN_COMMENT
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = DATABASE()
AND TABLE_NAME = 't_app_res_relation'
AND COLUMN_NAME = 'pid';
