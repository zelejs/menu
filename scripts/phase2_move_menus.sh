#!/bin/bash
# MDM 菜单重组 - 阶段2：移动菜单到分组
# 需要先执行阶段1获取分组菜单ID

echo "=== MDM 菜单重组 - 移动操作 ==="
echo ""
echo "假设分组菜单ID如下（请根据实际情况替换）："
echo "  设备管理分组: DEVICE_MGMT_ID"
echo "  策略管理分组: POLICY_MGMT_ID"
echo "  渠道管理分组: CHANNEL_MGMT_ID"
echo "  应用管理分组: APP_MGMT_ID"
echo "  固件管理分组: FIRMWARE_MGMT_ID"
echo ""

# ===== 设备管理分组 =====
echo "--- 移动到设备管理分组 ---"
# 保留 176(设备列表), 177(设备详情)，删除 58, 59
./scripts/menu_cli.js move 176 177 --parent DEVICE_MGMT_ID -f

# ===== 策略管理分组 =====
echo "--- 移动到策略管理分组 ---"
# 保留 179(策略管理)，删除 62
./scripts/menu_cli.js move 179 --parent POLICY_MGMT_ID -f

# ===== 渠道管理分组 =====
echo "--- 移动到渠道管理分组 ---"
# 保留 180(渠道管理), 78(运营商渠道)，删除 63
./scripts/menu_cli.js move 180 78 --parent CHANNEL_MGMT_ID -f

# ===== 应用管理分组 =====
echo "--- 移动到应用管理分组 ---"
# 保留 181(设备应用), 65(应用ota计划)，删除 66
./scripts/menu_cli.js move 181 65 --parent APP_MGMT_ID -f

# ===== 固件管理分组 =====
echo "--- 移动到固件管理分组 ---"
./scripts/menu_cli.js move 64 --parent FIRMWARE_MGMT_ID -f

echo "=== 移动操作完成 ==="
