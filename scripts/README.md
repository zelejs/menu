# 菜单管理 CLI 工具

用于访问和管理菜单 API 的命令行工具。

## 功能特性

- 📋 查看所有菜单项（支持分页、搜索、过滤）
- 🌳 查看菜单树形结构
- 🔍 菜单层次结构调试
- 🗑️ 删除菜单项（支持递归删除）
- ⚙️ 配置管理（保存默认 URL 和 Token）
- 📊 菜单统计分析
- JSON 格式输出支持

## 快速开始

### 使用方式

```bash
# 方式1: 直接使用可执行文件
./menu-cli list

# 方式2: 使用 node 运行
node scripts/menu_cli.js list

# 方式3: 创建全局链接（推荐）
cd /home/ubuntu/workspace/edu/auth/uaas/menu
npm link
menu-cli list
```

### 环境配置

创建 `.env` 文件设置默认值：

```bash
# 在项目根目录创建 .env
cat > .env << EOF
MENU_BASE_URL=http://192.168.3.105:30081/api/adm/menu
MENU_TOKEN=your-token-here
EOF
```

## 使用方法

### 基本命令

```bash
# 查看帮助
menu-cli --help

# 查看所有菜单
menu-cli list

# 查看菜单树
menu-cli tree

# 查看带详情的菜单树
menu-cli tree -d

# 扁平化显示菜单树
menu-cli tree -f

# 搜索菜单
menu-cli tree -s "用户"

# 调试菜单结构
menu-cli debug
```

### list - 列出所有菜单项

```bash
menu-cli list [选项]

选项:
  -p, --page N          页码 (默认: 1)
  -s, --page-size N     每页数量 (默认: 100)
  --search KEYWORD      搜索关键词
  --status STATUS       状态过滤 (0=正常, 1=停用)
```

示例:
```bash
# 获取第一页，每页 50 条
menu-cli list -p 1 -s 50

# 搜索包含"用户"的菜单
menu-cli list --search "用户"

# 只显示启用的菜单
menu-cli list --status 0
```

### tree - 查看菜单树形结构

```bash
menu-cli tree [选项]

选项:
  -d, --details         显示详细信息（path, component, type 等）
  -f, --flat            扁平化显示（使用缩进表示层级）
  -s, --search KEYWORD  搜索关键词
  --status STATUS       状态过滤
```

示例:
```bash
# 显示完整树结构
menu-cli tree

# 显示带详情的树结构
menu-cli tree -d

# 扁平化显示
menu-cli tree -f

# 搜索并显示树结构
menu-cli tree -s "系统"
```

### delete - 删除菜单

```bash
menu-cli delete <id> [选项]

选项:
  -f, --force           跳过确认直接删除
  -r, --recursive       递归删除子菜单
```

示例:
```bash
# 删除菜单（需要确认）
menu-cli delete 134

# 强制删除（不需要确认）
menu-cli delete 134 -f

# 递归删除（包含子菜单）
menu-cli delete 134 -r

# 递归强制删除
menu-cli delete 134 -f -r
```

**注意**: 删除行为取决于是否有 `appId`：
- **有 appId**: 只删除 `t_app_res_relation` 关联记录
- **无 appId**: 软删除 `t_sys_menu`（设置 `delete_flag=1`）

### debug - 调试菜单结构

```bash
menu-cli debug [选项]

选项:
  --check-integrity     检查结构完整性
  --find-orphans        查找孤儿节点
  --stats               显示统计信息
```

示例:
```bash
# 运行所有调试检查
menu-cli debug

# 只检查结构完整性
menu-cli debug --check-integrity

# 只查找孤儿节点
menu-cli debug --find-orphans

# 只显示统计信息
menu-cli debug --stats
```

### config - 配置管理

```bash
menu-cli config [选项]

选项:
  --show                显示当前配置
  --set KEY VALUE       设置配置项
  --clear               清除配置
```

示例:
```bash
# 显示当前配置
menu-cli config --show

# 设置默认 URL
menu-cli config --set base_url "http://localhost:8080/api/adm/menu"

# 设置默认 Token
menu-cli config --set token "your-token-here"

# 清除配置
menu-cli config --clear
```

### 全局选项

```bash
--url URL              API 基础 URL
--token TOKEN          认证 Token
--timeout SECONDS      请求超时时间（默认: 30秒）
--json                 以 JSON 格式输出
-v, --verbose          显示调试信息
--save-config          保存当前配置为默认值
```

示例:
```bash
# 使用自定义 URL
menu-cli --url http://localhost:8080/api/adm/menu tree

# 使用认证 Token
menu-cli --token your-token-here list

# 增加超时时间
menu-cli --timeout 60 tree

# 保存当前配置
menu-cli --url http://192.168.3.105:30081/api/adm/menu --save-config
```

## 配置文件

配置文件位置: `~/.config/menu-cli/config.json`

```json
{
  "base_url": "http://192.168.3.105:30081/api/adm/menu",
  "token": "your-token-here"
}
```

## 输出格式

### 树形结构输出

```
├── [1] 系统管理
│   ├── [10] 用户管理
│   │   ├── [100] 用户列表
│   │   └── [101] 用户角色
│   └── [11] 角色管理
└── [2] 业务管理
    └── [20] 订单管理
```

### 带详情的树形结构

```
├── [1] 系统管理 path: /system type: 目录 status: ✓ order: 1
│   ├── [10] 用户管理 path: /system/user type: 菜单 status: ✓ order: 10
│   │   ├── [100] 用户列表 path: list component: UserList type: 按钮
│   │   └── [101] 用户角色 path: role component: UserRole type: 按钮
```

### JSON 输出

```bash
menu-cli tree --json
```

## API 端点

工具使用以下 API 端点:

- `GET /api/adm/menu/menus` - 获取菜单列表（分页）
- `GET /api/adm/menu/app/group` - 获取菜单树形结构
- `DELETE /api/adm/menu/menus/{id}` - 删除菜单
- `GET /api/adm/menu/menus/{id}` - 获取单个菜单详情

## 故障排除

### 连接超时

```bash
# 增加超时时间
menu-cli --timeout 60 tree

# 或检查服务器是否运行
curl http://192.168.3.105:30081/api/adm/menu/app/group
```

### 认证问题

```bash
# 设置 Token
menu-cli --token your-token-here list

# 或保存为默认配置
menu-cli config --set token "your-token-here"
```

### 调试模式

```bash
# 显示详细的请求信息
menu-cli -v tree
```

## 项目结构

```
menu/
├── menu-cli               # 可执行命令入口
├── scripts/
│   ├── menu_cli.js        # 主程序 (Node.js)
│   ├── package.json       # NPM 配置
│   └── README.md          # 文档
├── .env                   # 环境变量配置
└── .env.example           # 环境变量示例
```
