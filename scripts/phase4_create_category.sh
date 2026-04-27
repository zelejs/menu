#!/bin/bash
# MDM 菜单重组 - 阶段4：创建设备分类菜单
# 在设备管理分组下新增"设备分类"菜单

BASE_URL="${MENU_BASE_URL:-http://localhost:8080/api/adm/menu}"

echo "=== 创建设备分类菜单 ==="
echo "此菜单将作为设备管理分组的子菜单"
echo ""

# 创建设备分类菜单 (需要先知道设备管理分组的ID)
# 假设设备管理分组ID为 DEVICE_MGMT_ID
curl -s -X POST "${BASE_URL}/menus" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "设备分类",
    "pid": DEVICE_MGMT_ID,
    "menuType": "M",
    "path": "device-category",
    "icon": "AppstoreOutlined",
    "visible": "0",
    "status": "0",
    "orderNum": 3
  }' | jq '.'

echo "=== 设备分类菜单创建完成 ==="
