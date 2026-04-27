#!/bin/bash
# MDM 菜单重组 - 阶段3：删除重复菜单

echo "=== MDM 菜单重组 - 删除重复菜单 ==="
echo ""
echo "将删除以下重复菜单："
echo "  - 58 (设备列表重复)"
echo "  - 59 (设备详情重复)"
echo "  - 62 (策略管理重复)"
echo "  - 63 (渠道管理重复)"
echo "  - 66 (设备应用重复)"
echo ""

# 批量删除重复菜单
./scripts/menu_cli.js delete 58 -f
./scripts/menu_cli.js delete 59 -f
./scripts/menu_cli.js delete 62 -f
./scripts/menu_cli.js delete 63 -f
./scripts/menu_cli.js delete 66 -f

echo "=== 重复菜单删除完成 ==="
