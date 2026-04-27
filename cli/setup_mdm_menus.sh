#!/bin/bash
set -e

CLI="menu-cli"

# ============================================================
# Phase 0: 清理 mdm 应用下所有现有菜单关系（保留 t_sys_menu）
# ============================================================
echo "=== Phase 0: 清理现有 mdm 关系 ==="

# 以下是从当前 t_app_res_relation 中需要移除的旧关系 ID
for id in 62 63 64 65 66 71 72 73 78 88 161 163 176 179 180 181 192 194 196 197 198 199 201 202 203; do
  $CLI app remove "$id"
done

# ============================================================
# Phase 1: 在 t_sys_menu 中创建缺失的菜单
# ============================================================
echo "=== Phase 1: 创建缺失的 t_sys_menu 记录 ==="

# 工具函数：从 CLI 输出中提取新菜单 ID
extract_id() { sed -n 's/.*\[\([0-9]*\)\].*/\1/p'; }

# ----- 根目录 -----
ID_MEDIA=$($CLI menu create -n "媒体分发" --path "media-distribution" --type C | extract_id)
ID_MDM_ROOT=$($CLI menu create -n "MDM设备管理" --path "mdm-device-mgmt" --type C | extract_id)

# ----- 媒体分发 -> 二级 -----
ID_DATA=$($CLI menu create -n "数据" --path "data" --type M | extract_id)
ID_DEVICE=$($CLI menu create -n "设备" --path "device" --type M | extract_id)
ID_MATERIAL=$($CLI menu create -n "素材" --path "material" --type M | extract_id)
ID_PROGRAM=$($CLI menu create -n "节目单" --path "program" --type M | extract_id)
ID_SCHEDULE=$($CLI menu create -n "排期" --path "schedule" --type M | extract_id)
ID_TASK=$($CLI menu create -n "任务" --path "task" --type M | extract_id)
ID_MESSAGE=$($CLI menu create -n "消息" --path "message" --type M | extract_id)

# ----- 媒体分发 -> 数据 -> 三级 -----
ID_DASHBOARD=$($CLI menu create -n "仪表盘" --path "data/dashboard" --component "./data/dashboard" --type M | extract_id)
ID_MONITOR=$($CLI menu create -n "实时监控" --path "data/realtime-monitor" --component "./data/realtimeMonitor" --type M | extract_id)

# ----- 媒体分发 -> 设备 -> 三级 -----
# 设备分类 (已存在 id=186)
ID_DEV_CATEGORY=186
# 设备管理（媒体分发分支下，与 MDM 的设备管理 58 区分）
ID_DEV_MGMT_MEDIA=$($CLI menu create -n "设备管理" --path "device/mgmt" --component "./device/mgmt" --type M | extract_id)
# 设备详情 (已存在 id=177)
ID_DEV_DETAIL=177

# ----- 媒体分发 -> 素材 -> 三级 -----
ID_MEDIA_MAT=$($CLI menu create -n "媒体素材" --path "material/media" --component "./material/media" --type M | extract_id)
ID_MAT_OWN=$($CLI menu create -n "素材归属" --path "material/ownership" --component "./material/ownership" --type M | extract_id)

# ----- 媒体分发 -> 节目单 -> 三级 -----
ID_PROG_ARRANGE=$($CLI menu create -n "节目单编排" --path "program/arrange" --component "./program/arrange" --type M | extract_id)
ID_LAYOUT_TPL=$($CLI menu create -n "布局模板" --path "program/layout-template" --component "./program/layoutTemplate" --type M | extract_id)

# ----- 媒体分发 -> 排期 -> 三级 -----
ID_SCHEDULE_TPL=$($CLI menu create -n "排期模板" --path "schedule/template" --component "./schedule/template" --type M | extract_id)
# 节目单排期 (已存在 id=200)
ID_PROG_SCHEDULE=200

# ----- 媒体分发 -> 任务 -> 三级 -----
ID_DISPATCH=$($CLI menu create -n "下发任务" --path "task/dispatch" --component "./task/dispatch" --type M | extract_id)

# ----- 媒体分发 -> 消息 -> 三级 -----
# 告警中心 (已存在 id=191)
ID_ALARM=191

# ----- MDM设备管理 -> 二级 -----
# 设备管理 (已存在 id=58，作为 MDM 分支复用)
ID_DEV_MGMT_MDM=58
ID_DEV_CTRL=$($CLI menu create -n "设备管控" --path "mdm-device/control" --component "./mdm/deviceControl" --type C | extract_id)
ID_APP_MGMT=$($CLI menu create -n "应用管理" --path "mdm-app/mgmt" --component "./mdm/appMgmt" --type C | extract_id)

# ----- MDM -> 设备管理 -> 三级 -----
ID_DEV_AUTH=$($CLI menu create -n "设备授权" --path "mdm-device/mgmt/auth" --component "./mdm/deviceAuth" --type M | extract_id)
ID_DEV_CHAN=$($CLI menu create -n "设备渠道" --path "mdm-device/mgmt/channel" --component "./mdm/deviceChannel" --type M | extract_id)

# ----- MDM -> 设备管控 -> 三级 -----
ID_HW_CTRL=$($CLI menu create -n "硬件管控" --path "mdm-device/control/hardware" --component "./mdm/hardwareControl" --type M | extract_id)
ID_APP_CTRL=$($CLI menu create -n "应用管控" --path "mdm-device/control/app" --component "./mdm/appControl" --type M | extract_id)
ID_CTRL_POLICY=$($CLI menu create -n "控制策略" --path "mdm-device/control/policy" --component "./mdm/controlPolicy" --type M | extract_id)

# ----- MDM -> 应用管理 -> 三级 -----
# 固件管理 (已存在 id=185)
ID_FIRMWARE=185
ID_APP_MARKET=$($CLI menu create -n "应用市场" --path "mdm-app/market" --component "./mdm/appMarket" --type M | extract_id)

# ----- 系统管理 -> 二级 -----
# 权限管理 (已存在 id=86)
ID_PERM_MGMT=86
ID_USER_MGMT=$($CLI menu create -n "用户管理" --path "system/user" --component "./system/user" --type M | extract_id)
# 组织管理 (已存在 id=92)
ID_ORG_MGMT=92
# 配置管理 (已存在 id=87)
ID_CONF_MGMT=87
ID_LOG_MGMT=$($CLI menu create -n "日志管理" --path "system/log" --component "./system/log" --type M | extract_id)
# 工作流管理 (已存在 id=160)
ID_WORKFLOW_MGMT=160

# ----- 系统管理 -> 权限管理 -> 三级 -----
# 菜单管理 (已存在 id=83)
ID_MENU_MGMT=83
# 角色管理 (已存在 id=84)
ID_ROLE_MGMT=84
# 权限管理子菜单（与父级同名，新建独立记录）
ID_PERM_MGMT_CHILD=$($CLI menu create -n "权限管理" --path "system/permission/perm" --component "./system/permission" --type M | extract_id)

# ----- 系统管理 -> 用户管理 -> 三级 -----
# 平台用户 (已存在 id=85)
ID_PLATFORM_USER=85
# 终端用户 (已存在 id=91)
ID_END_USER=91

# ----- 系统管理 -> 组织管理 -> 三级 -----
# 组织架构 (已存在 id=23)
ID_ORG_STRUCT=23
# 租户管理 (已存在 id=93)
ID_TENANT_MGMT=93

# ----- 系统管理 -> 配置管理 -> 三级 -----
ID_DICT_MGMT=$($CLI menu create -n "字典管理" --path "system/config/dict" --component "./system/dict" --type M | extract_id)
# 配置管理子菜单（与父级同名，新建独立记录）
ID_CONF_MGMT_CHILD=$($CLI menu create -n "配置管理" --path "system/config/setting" --component "./system/setting" --type M | extract_id)
# 行政区域 (已存在 id=141)
ID_AREA=141

# ----- 系统管理 -> 日志管理 -> 三级 -----
# 操作日志 (已存在 id=193)
ID_OP_LOG=193

# ----- 系统管理 -> 工作流管理 -> 三级 -----
# 工作流 (已存在 id=162)
ID_WORKFLOW=162
# 表单管理 (已存在 id=165)
ID_FORM_MGMT=165
ID_TODO=$($CLI menu create -n "待办事项" --path "system/workflow/todo" --component "./workflow/todo" --type M | extract_id)

# ============================================================
# Phase 2: 将全部目标菜单复制到 mdm 的 t_app_res_relation
# ============================================================
echo "=== Phase 2: app copy 到 mdm 关系表 ==="

for id in \
  $ID_MEDIA $ID_DATA $ID_DASHBOARD $ID_MONITOR \
  $ID_DEVICE $ID_DEV_CATEGORY $ID_DEV_MGMT_MEDIA $ID_DEV_DETAIL \
  $ID_MATERIAL $ID_MEDIA_MAT $ID_MAT_OWN \
  $ID_PROGRAM $ID_PROG_ARRANGE $ID_LAYOUT_TPL \
  $ID_SCHEDULE $ID_SCHEDULE_TPL $ID_PROG_SCHEDULE \
  $ID_TASK $ID_DISPATCH \
  $ID_MESSAGE $ID_ALARM \
  $ID_MDM_ROOT $ID_DEV_MGMT_MDM $ID_DEV_AUTH $ID_DEV_CHAN \
  $ID_DEV_CTRL $ID_HW_CTRL $ID_APP_CTRL $ID_CTRL_POLICY \
  $ID_APP_MGMT $ID_FIRMWARE $ID_APP_MARKET \
  81 $ID_PERM_MGMT $ID_MENU_MGMT $ID_ROLE_MGMT $ID_PERM_MGMT_CHILD \
  $ID_USER_MGMT $ID_PLATFORM_USER $ID_END_USER \
  $ID_ORG_MGMT $ID_ORG_STRUCT $ID_TENANT_MGMT \
  $ID_CONF_MGMT $ID_DICT_MGMT $ID_CONF_MGMT_CHILD $ID_AREA \
  $ID_LOG_MGMT $ID_OP_LOG \
  $ID_WORKFLOW_MGMT $ID_WORKFLOW $ID_FORM_MGMT $ID_TODO
do
  $CLI app copy "$id"
done

# ============================================================
# Phase 3: 应用级结构重组（通过 app move 设置 pid）
# ============================================================
echo "=== Phase 3: 重组 mdm 菜单层级 ==="

# --- 媒体分发分支 ---
$CLI app move "$ID_DATA"       -p "$ID_MEDIA"
$CLI app move "$ID_DEVICE"     -p "$ID_MEDIA"
$CLI app move "$ID_MATERIAL"   -p "$ID_MEDIA"
$CLI app move "$ID_PROGRAM"    -p "$ID_MEDIA"
$CLI app move "$ID_SCHEDULE"   -p "$ID_MEDIA"
$CLI app move "$ID_TASK"       -p "$ID_MEDIA"
$CLI app move "$ID_MESSAGE"    -p "$ID_MEDIA"

$CLI app move "$ID_DASHBOARD"  -p "$ID_DATA"
$CLI app move "$ID_MONITOR"    -p "$ID_DATA"

$CLI app move "$ID_DEV_CATEGORY"      -p "$ID_DEVICE"
$CLI app move "$ID_DEV_MGMT_MEDIA"    -p "$ID_DEVICE"
$CLI app move "$ID_DEV_DETAIL"        -p "$ID_DEV_MGMT_MEDIA"

$CLI app move "$ID_MEDIA_MAT"  -p "$ID_MATERIAL"
$CLI app move "$ID_MAT_OWN"    -p "$ID_MATERIAL"

$CLI app move "$ID_PROG_ARRANGE" -p "$ID_PROGRAM"
$CLI app move "$ID_LAYOUT_TPL"   -p "$ID_PROGRAM"

$CLI app move "$ID_SCHEDULE_TPL"   -p "$ID_SCHEDULE"
$CLI app move "$ID_PROG_SCHEDULE"  -p "$ID_SCHEDULE"

$CLI app move "$ID_DISPATCH" -p "$ID_TASK"

$CLI app move "$ID_ALARM" -p "$ID_MESSAGE"

# --- MDM设备管理分支 ---
$CLI app move "$ID_DEV_MGMT_MDM" -p "$ID_MDM_ROOT"
$CLI app move "$ID_DEV_CTRL"     -p "$ID_MDM_ROOT"
$CLI app move "$ID_APP_MGMT"     -p "$ID_MDM_ROOT"

$CLI app move "$ID_DEV_AUTH" -p "$ID_DEV_MGMT_MDM"
$CLI app move "$ID_DEV_CHAN" -p "$ID_DEV_MGMT_MDM"

$CLI app move "$ID_HW_CTRL"     -p "$ID_DEV_CTRL"
$CLI app move "$ID_APP_CTRL"    -p "$ID_DEV_CTRL"
$CLI app move "$ID_CTRL_POLICY" -p "$ID_DEV_CTRL"

$CLI app move "$ID_FIRMWARE"   -p "$ID_APP_MGMT"
$CLI app move "$ID_APP_MARKET" -p "$ID_APP_MGMT"

# --- 系统管理分支 (81 = 系统管理) ---
$CLI app move "$ID_PERM_MGMT"     -p 81
$CLI app move "$ID_USER_MGMT"     -p 81
$CLI app move "$ID_ORG_MGMT"      -p 81
$CLI app move "$ID_CONF_MGMT"     -p 81
$CLI app move "$ID_LOG_MGMT"      -p 81
$CLI app move "$ID_WORKFLOW_MGMT" -p 81

$CLI app move "$ID_MENU_MGMT"        -p "$ID_PERM_MGMT"
$CLI app move "$ID_ROLE_MGMT"        -p "$ID_PERM_MGMT"
$CLI app move "$ID_PERM_MGMT_CHILD"  -p "$ID_PERM_MGMT"

$CLI app move "$ID_PLATFORM_USER" -p "$ID_USER_MGMT"
$CLI app move "$ID_END_USER"      -p "$ID_USER_MGMT"

$CLI app move "$ID_ORG_STRUCT"   -p "$ID_ORG_MGMT"
$CLI app move "$ID_TENANT_MGMT"  -p "$ID_ORG_MGMT"

$CLI app move "$ID_DICT_MGMT"      -p "$ID_CONF_MGMT"
$CLI app move "$ID_CONF_MGMT_CHILD" -p "$ID_CONF_MGMT"
$CLI app move "$ID_AREA"           -p "$ID_CONF_MGMT"

$CLI app move "$ID_OP_LOG" -p "$ID_LOG_MGMT"

$CLI app move "$ID_WORKFLOW"    -p "$ID_WORKFLOW_MGMT"
$CLI app move "$ID_FORM_MGMT"   -p "$ID_WORKFLOW_MGMT"
$CLI app move "$ID_TODO"        -p "$ID_WORKFLOW_MGMT"

# ============================================================
# Phase 4: 验证
# ============================================================
echo "=== Phase 4: 验证 mdm 菜单树 ==="
$CLI app group
