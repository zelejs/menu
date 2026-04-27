-- Phase 2: Initialize pid values in t_app_res_relation
-- This script copies the pid from t_sys_menu to t_app_res_relation for existing menu relations

-- Initialize pid for existing menu relations
UPDATE t_app_res_relation arr
JOIN t_sys_menu m ON arr.res_id = m.id
SET arr.pid = m.pid
WHERE arr.res_type = 'menu';

-- Verify the update
SELECT COUNT(*) as updated_count,
       MIN(arr.updated_time) as first_update,
       MAX(arr.updated_time) as last_update
FROM t_app_res_relation arr
WHERE arr.res_type = 'menu' AND arr.pid IS NOT NULL;
