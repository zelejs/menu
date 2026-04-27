-- 更新 t_app_res_relation.pid 字段以建立应用级菜单层级
-- 基于 t_sys_menu 的层级关系
-- 用法: mysql -u用户名 -p 数据库名 < update_app_res_relation_pid.sql

-- 显示当前状态
SELECT '当前 t_app_res_relation.pid 状态:' as info;
SELECT
    arr.id as relation_id,
    arr.app_id,
    arr.res_id as menu_id,
    m.name as menu_name,
    arr.pid as current_pid,
    m.pid as menu_parent_id
FROM t_app_res_relation arr
LEFT JOIN t_sys_menu m ON arr.res_id = m.id
WHERE arr.res_type = 'menu' AND arr.app_id = 'mdm'
ORDER BY m.pid, m.id;

-- 更新 pid: 通过父菜单的 res_id 找到对应的 relation_id
-- 原理: 子菜单的 pid 应该指向父菜单在 t_app_res_relation 中的 id

-- Level 1 子菜单 (pid 指向 MDM管理 relation_id=50)
UPDATE t_app_res_relation arr
JOIN t_sys_menu m ON arr.res_id = m.id
JOIN t_app_res_relation parent_arr ON m.pid = parent_arr.res_id
SET arr.pid = parent_arr.id
WHERE arr.res_type = 'menu'
  AND arr.app_id = 'mdm'
  AND m.pid IN (56, 69)  -- MDM管理 和 App管理
  AND parent_arr.app_id = 'mdm';

-- Level 2 子菜单 (如设备列表等，pid 指向设备管理 relation_id=51)
-- 这个已经在上面处理了，因为它们也满足 m.pid IN (58, 62, 63, 66, 185)
-- 但为了确保正确，我们再执行一次更新，处理所有子菜单
UPDATE t_app_res_relation arr
JOIN t_sys_menu m ON arr.res_id = m.id
JOIN t_app_res_relation parent_arr ON m.pid = parent_arr.res_id
SET arr.pid = parent_arr.id
WHERE arr.res_type = 'menu'
  AND arr.app_id = 'mdm'
  AND parent_arr.app_id = 'mdm'
  AND arr.pid IS NULL;  -- 只更新还未设置的

-- 验证更新结果
SELECT '更新后的 t_app_res_relation.pid 状态:' as info;
SELECT
    arr.id as relation_id,
    arr.app_id,
    arr.res_id as menu_id,
    m.name as menu_name,
    arr.pid as new_pid,
    parent_m.name as parent_menu_name,
    parent_arr.res_id as parent_menu_id
FROM t_app_res_relation arr
LEFT JOIN t_sys_menu m ON arr.res_id = m.id
LEFT JOIN t_app_res_relation parent_arr ON arr.pid = parent_arr.id
LEFT JOIN t_sys_menu parent_m ON parent_arr.res_id = parent_m.id
WHERE arr.res_type = 'menu' AND arr.app_id = 'mdm'
ORDER BY parent_m.name, m.name;

-- 显示层级树形结构
SELECT '菜单层级结构 (应用级):' as info;
SELECT
    CONCAT(
        CASE
            WHEN m.pid IS NULL THEN ''
            WHEN parent_m.pid IS NULL THEN '  ├── '
            ELSE '    ├── '
        END,
        m.name,
        ' (res_id=', m.id, ', relation_id=', arr.id, ')'
    ) as menu_tree
FROM t_app_res_relation arr
LEFT JOIN t_sys_menu m ON arr.res_id = m.id
LEFT JOIN t_app_res_relation parent_arr ON arr.pid = parent_arr.id
LEFT JOIN t_sys_menu parent_m ON parent_arr.res_id = parent_m.id
WHERE arr.res_type = 'menu' AND arr.app_id = 'mdm'
ORDER BY
    COALESCE(parent_m.order_num, 0),
    COALESCE(m.order_num, 0),
    m.id;
