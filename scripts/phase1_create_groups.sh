#!/bin/bash
# MDM 菜单重组 - 阶段1：创建分组菜单

BASE_URL="${MENU_BASE_URL:-http://localhost:8080/api/adm/menu}"

echo "=== 创建 MDM 分组菜单 ==="

# 1. 创建设备管理分组 (pid=56)
curl -s -X POST "${BASE_URL}/menus" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "设备管理",
    "pid": 56,
    "menuType": "C",
    "path": "device-mgmt",
    "icon": "MobileOutlined",
    "visible": "0",
    "status": "0",
    "orderNum": 1
  }' | jq '.'

# 2. 创建策略管理分组
curl -s -X POST "${BASE_URL}/menus" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "策略管理",
    "pid": 56,
    "menuType": "C",
    "path": "policy-mgmt",
    "icon": "ProfileOutlined",
    "visible": "0",
    "status": "0",
    "orderNum": 2
  }' | jq '.'

# 3. 创建渠道管理分组
curl -s -X POST "${BASE_URL}/menus" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "渠道管理",
    "pid": 56,
    "menuType": "C",
    "path": "channel-mgmt",
    "icon": "BranchesOutlined",
    "visible": "0",
    "status": "0",
    "orderNum": 3
  }' | jq '.'

# 4. 创建应用管理分组
curl -s -X POST "${BASE_URL}/menus" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "应用管理",
    "pid": 56,
    "menuType": "C",
    "path": "app-mgmt",
    "icon": "AppstoreOutlined",
    "visible": "0",
    "status": "0",
    "orderNum": 4
  }' | jq '.'

# 5. 创建固件管理分组
curl -s -X POST "${BASE_URL}/menus" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "固件管理",
    "pid": 56,
    "menuType": "C",
    "path": "firmware-mgmt",
    "icon": "CloudUploadOutlined",
    "visible": "0",
    "status": "0",
    "orderNum": 5
  }' | jq '.'

echo "=== 分组创建完成 ==="
echo "请记录返回的菜单ID，用于后续操作"
