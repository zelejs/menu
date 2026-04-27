#!/bin/bash
# MDM 菜单重组 - 一键执行脚本
# 用法: ./reorganize_mdm.sh

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "======================================"
echo "   MDM 菜单重组工具"
echo "======================================"
echo ""

# 检查依赖
if [ ! -f "./scripts/menu_cli.js" ]; then
    echo "错误: menu_cli.js 不存在"
    exit 1
fi

# 显示当前菜单结构
echo "步骤 0: 当前菜单结构"
echo "----------------------"
./scripts/menu_cli.js tree | grep -A 20 "MDM管理"
echo ""

# 阶段 1: 创建分组
echo "步骤 1: 创建分组菜单"
echo "----------------------"
echo "将创建以下5个分组："
echo "  1. 设备管理 (C)"
echo "  2. 策略管理 (C)"
echo "  3. 渠道管理 (C)"
echo "  4. 应用管理 (C)"
echo "  5. 固件管理 (C)"
echo ""
read -p "是否执行阶段1? (y/n): " confirm
if [ "$confirm" = "y" ]; then
    bash ./scripts/phase1_create_groups.sh
    echo ""
    echo "请记录上面返回的分组菜单ID，然后继续执行阶段2"
    echo "需要手动编辑 phase2_move_menus.sh 替换 ID 变量"
fi
echo ""

# 阶段 2: 移动菜单
echo "步骤 2: 移动菜单到分组"
echo "----------------------"
echo "将移动以下菜单："
echo "  - 176, 177 → 设备管理"
echo "  - 179 → 策略管理"
echo "  - 180, 78 → 渠道管理"
echo "  - 181, 65 → 应用管理"
echo "  - 64 → 固件管理"
echo ""
read -p "是否执行阶段2? (y/n): " confirm
if [ "$confirm" = "y" ]; then
    bash ./scripts/phase2_move_menus.sh
fi
echo ""

# 阶段 3: 删除重复
echo "步骤 3: 删除重复菜单"
echo "----------------------"
echo "将删除以下重复菜单："
echo "  - 58 (设备列表重复)"
echo "  - 59 (设备详情重复)"
echo "  - 62 (策略管理重复)"
echo "  - 63 (渠道管理重复)"
echo "  - 66 (设备应用重复)"
echo ""
read -p "是否执行阶段3? (y/n): " confirm
if [ "$confirm" = "y" ]; then
    bash ./scripts/phase3_delete_duplicates.sh
fi
echo ""

# 阶段 4: 创建设备分类
echo "步骤 4: 创建设备分类菜单"
echo "----------------------"
read -p "是否执行阶段4? (y/n): " confirm
if [ "$confirm" = "y" ]; then
    bash ./scripts/phase4_create_category.sh
fi
echo ""

# 显示结果
echo "======================================"
echo "   重组完成!"
echo "======================================"
echo ""
./scripts/menu_cli.js tree | grep -A 30 "MDM管理"
