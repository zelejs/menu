#!/bin/bash
# 初始化 t_app_res_relation.pid 字段
# 用法: ./init_app_relation_pid.sh

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "======================================"
echo "   初始化应用级菜单层级关系"
echo "======================================"
echo ""

# 检查 SQL 文件
if [ ! -f "./update_app_res_relation_pid.sql" ]; then
    echo "错误: update_app_res_relation_pid.sql 不存在"
    exit 1
fi

# 显示当前菜单结构
echo "步骤 1: 当前 t_sys_menu 层级结构"
echo "--------------------------------------"
python ~/.claude/skills/chatdb/scripts/cursor_db_cli.py --json query-sql --sql "
SELECT
    CONCAT(
        CASE
            WHEN m.pid IS NULL THEN ''
            WHEN p.pid IS NULL THEN '  ├── '
            ELSE '    ├── '
        END,
        m.name,
        ' (id=', m.id, ', pid=', COALESCE(m.pid, 'NULL'), ')'
    ) as menu_tree
FROM t_sys_menu m
LEFT JOIN t_sys_menu p ON m.pid = p.id
WHERE m.id IN (
    56, 69,  -- 顶级
    58, 62, 63, 66, 185,  -- 二级分组
    71, 72, 73, 176, 177, 179, 180, 181, 78, 65, 64  -- 三级菜单
)
ORDER BY
    COALESCE(p.order_num, 0),
    COALESCE(m.order_num, 0),
    m.id;
" | jq -r '.data[]' | sed 's/^"|"$//g' | sed 's/^"|//g' | sed 's/"$//g'
echo ""

# 显示当前 t_app_res_relation 状态
echo "步骤 2: 当前 t_app_res_relation.pid 状态"
echo "--------------------------------------"
python ~/.claude/skills/chatdb/scripts/cursor_db_cli.py --json query-sql --sql "
SELECT
    arr.id as rel_id,
    arr.res_id,
    m.name,
    arr.pid as current_pid
FROM t_app_res_relation arr
LEFT JOIN t_sys_menu m ON arr.res_id = m.id
WHERE arr.res_type = 'menu' AND arr.app_id = 'mdm'
    AND arr.res_id IN (
        56, 69, 58, 62, 63, 66, 185,
        71, 72, 73, 176, 177, 179, 180, 181, 78, 65, 64
    )
ORDER BY m.pid, m.id;
" | jq -r '.data[]' | @column -t
echo ""

# 确认执行
read -p "是否执行 pid 更新? (y/n): " confirm
if [ "$confirm" != "y" ]; then
    echo "操作已取消"
    exit 0
fi

# 执行 SQL 更新
echo ""
echo "步骤 3: 执行 pid 更新"
echo "--------------------------------------"

# 使用 chatdb 执行 SQL (通过 execute-sql 命令)
# 由于 SQL 文件包含多条语句，我们逐条执行

echo "更新 Level 1 子菜单..."
python ~/.claude/skills/chatdb/scripts/cursor_db_cli.py --json execute-sql --sql "
UPDATE t_app_res_relation arr
JOIN t_sys_menu m ON arr.res_id = m.id
JOIN t_app_res_relation parent_arr ON m.pid = parent_arr.res_id
SET arr.pid = parent_arr.id
WHERE arr.res_type = 'menu'
  AND arr.app_id = 'mdm'
  AND m.pid IN (56, 69, 58, 62, 63, 66, 185)
  AND parent_arr.app_id = 'mdm';
"

echo "更新 Level 2+ 子菜单..."
python ~/.claude/skills/chatdb/scripts/cursor_db_cli.py --json execute-sql --sql "
UPDATE t_app_res_relation arr
JOIN t_sys_menu m ON arr.res_id = m.id
JOIN t_app_res_relation parent_arr ON m.pid = parent_arr.res_id
SET arr.pid = parent_arr.id
WHERE arr.res_type = 'menu'
  AND arr.app_id = 'mdm'
  AND parent_arr.app_id = 'mdm'
  AND arr.pid IS NULL;
"

# 验证更新结果
echo ""
echo "步骤 4: 验证更新结果"
echo "--------------------------------------"
python ~/.claude/skills/chatdb/scripts/cursor_db_cli.py --json query-sql --sql "
SELECT
    arr.id as rel_id,
    arr.res_id,
    m.name as menu_name,
    arr.pid as new_pid,
    parent_m.name as parent_name
FROM t_app_res_relation arr
LEFT JOIN t_sys_menu m ON arr.res_id = m.id
LEFT JOIN t_app_res_relation parent_arr ON arr.pid = parent_arr.id
LEFT JOIN t_sys_menu parent_m ON parent_arr.res_id = parent_m.id
WHERE arr.res_type = 'menu' AND arr.app_id = 'mdm'
    AND arr.res_id IN (
        56, 69, 58, 62, 63, 66, 185,
        71, 72, 73, 176, 177, 179, 180, 181, 78, 65, 64
    )
ORDER BY parent_m.name, m.name;
" | jq -r '.data[]' | @column -t
echo ""

# 显示树形结构
echo "步骤 5: 应用级菜单层级树"
echo "--------------------------------------"
python ~/.claude/skills/chatdb/scripts/cursor_db_cli.py --json query-sql --sql "
SELECT
    CONCAT(
        CASE
            WHEN arr.pid IS NULL THEN CONCAT(m.name, ' (rel_id=', arr.id, ')')
            WHEN parent_arr.pid IS NULL THEN CONCAT('  ├── ', m.name, ' (rel_id=', arr.id, ', pid=', arr.pid, ')')
            ELSE CONCAT('    ├── ', m.name, ' (rel_id=', arr.id, ', pid=', arr.pid, ')')
        END
    ) as menu_tree
FROM t_app_res_relation arr
LEFT JOIN t_sys_menu m ON arr.res_id = m.id
LEFT JOIN t_app_res_relation parent_arr ON arr.pid = parent_arr.id
LEFT JOIN t_app_res_relation grandparent_arr ON parent_arr.pid = grandparent_arr.id
WHERE arr.res_type = 'menu' AND arr.app_id = 'mdm'
    AND arr.res_id IN (
        56, 69, 58, 62, 63, 66, 185,
        71, 72, 73, 176, 177, 179, 180, 181, 78, 65, 64
    )
ORDER BY
    CASE WHEN arr.pid IS NULL THEN 0 ELSE 1 END,
    CASE WHEN parent_arr.pid IS NULL THEN 0 ELSE 1 END,
    m.id;
" | jq -r '.data[]' | sed 's/^"|"$//g'

echo ""
echo "======================================"
echo "   初始化完成!"
echo "======================================"
