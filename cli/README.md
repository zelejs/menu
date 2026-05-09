# Menu CLI Guide

A command-line tool for managing menus and routes via the Menu Management REST API.

## Prerequisites

- Node.js 16+
- A running Menu Management service
- A valid JWT token (if authentication is required)

## Installation

```bash
cd cli
npm install
```

## Configuration

Create a `.env` file in the project root or `cli/` directory:

```bash
MENU_BASE_URL=http://localhost:8080/api/adm/menu
MENU_TOKEN=your-jwt-token-here
```

| Variable | Description | Required |
|----------|-------------|----------|
| `MENU_BASE_URL` | Base URL of the Menu API | Yes |
| `MENU_TOKEN` | JWT Bearer token for authentication | No (if public) |

## Global Options

These options work with any command:

| Option | Description |
|--------|-------------|
| `-j, --json` | Output raw JSON instead of formatted text |
| `-v, --verbose` | Verbose output |
| `-h, --help` | Display help |
| `-V, --version` | Display version |

## Commands Overview

```
menu-cli [options] [command]

Commands:
  menu                           Menu management API (/api/adm/menu/menus)
    menu list [options]          List menus with pagination and filters
    menu trash [options]         List deleted menus (delete_flag=1)
    menu get <id>                Get menu by ID
    menu create [options]        Create a new menu
    menu update <id> [options]   Update an existing menu
    menu delete <id>             Delete a menu
    menu move <id> [options]     Move menu to a new parent
    menu promote <id>            Promote menu to top level

  app                            App menu API (/api/adm/menu/app)
    app group [options]          Get menu group tree (excludes invisible)
    app menus [options]          Get all menus including invisible
    app invisible <id> [options] Set menu invisible status
    app delete <id>              Delete a menu by ID (removes app relation)
```

---

## Creating a New Menu

### Basic Menu Creation

```bash
menu-cli menu create -n "User Management" --path "/system/user" -t M --component "system/user/index"
```

**Options:**

| Option | Short | Description | Default |
|--------|-------|-------------|---------|
| `--name` | `-n` | **Menu name (required)** | - |
| `--path` | - | Route path | `/` |
| `--type` | `-t` | Menu type: `C` (Catalog), `M` (Menu), `F` (Button) | `M` |
| `--parent` | `-p` | Parent menu ID | none (top level) |
| `--component` | - | Frontend component path | - |
| `--icon` | - | Icon name | - |
| `--visible` | - | Visible flag: `0`=show, `1`=hide | `0` |
| `--status` | - | Status flag: `0`=enabled, `1`=disabled | `0` |

### Menu Types Explained

| Type | Code | Description | Example |
|------|------|-------------|---------|
| Catalog | `C` | A directory/group container, no actual page | System Management |
| Menu | `M` | A real page with route and component | User List |
| Button | `F` | A permission control point, not shown in nav | Add User Button |

### Examples

**1. Create a top-level catalog (directory):**

```bash
menu-cli menu create -n "System Management" --path "/system" -t C --icon "setting"
```

**2. Create a menu under a parent:**

```bash
menu-cli menu create -n "User Management" --path "/system/user" -t M \
  --component "system/user/index" --icon "user" -p 1
```

**3. Create a button (permission point):**

```bash
menu-cli menu create -n "Add User Button" -t F -p 10
```

**4. Create a hidden menu:**

```bash
menu-cli menu create -n "Internal Tool" --path "/internal" -t M \
  --component "internal/tool" --visible 1
```

**5. Get JSON output:**

```bash
menu-cli -j menu create -n "Test Menu" --path "/test" -t M
```

---

## Route Definition

When creating a menu, these fields define the frontend route:

| Field | Maps To | Purpose | Example |
|-------|---------|---------|---------|
| `path` | `path` | Frontend route path | `/system/user` |
| `component` | `path` in response JSON | Vue/React component file path | `system/user/index` |
| `redirect` | `redirect` | Default redirect target | `/system/user/list` |
| `wrappers` | `wrappers` | Route layout/wrapper component | `BlankLayout` |
| `name` | `name` | Display title in navigation | User Management |
| `icon` | `icon` | Menu icon name | `user` |
| `pageId` | `pageId` | Dynamic page ID (special case) | `456` |

### Route Resolution Rules

The API returns menu data in this JSON format:

```json
{
  "name": "/system/user",
  "path": "system/user/index",
  "pageId": null,
  "icon": "user",
  "items": [...]
}
```

**Special case with `pageId`:**
If `pageId` is set, the path becomes:
```
parentComponent/publicPage?pageId=<pageId>
```

---

## Managing Menus

### List Menus

```bash
# List all menus (paginated)
menu-cli menu list

# List with filters
menu-cli menu list -p 1 -s 20 --search "user"
menu-cli menu list --name "System" --status 0

# List deleted menus
menu-cli menu trash
```

**Options:**

| Option | Short | Description | Default |
|--------|-------|-------------|---------|
| `--page` | `-p` | Page number | `1` |
| `--page-size` | `-s` | Page size | `10` |
| `--search` | - | Search keyword | - |
| `--name` | - | Filter by name | - |
| `--path` | - | Filter by path | - |
| `--status` | - | Filter by status | - |
| `--deleted` | - | Show only deleted menus | - |

### Get Menu Details

```bash
menu-cli menu get 123
```

### Update a Menu

```bash
# Update name
menu-cli menu update 123 -n "Updated Name"

# Update route path and component
menu-cli menu update 123 --path "/new/path" --component "new/component"

# Update parent
menu-cli menu update 123 -p 5

# Update status
menu-cli menu update 123 --status 1
```

### Move Menu

```bash
# Move to a new parent
menu-cli menu move 123 -p 5

# Move to top level (no parent)
menu-cli menu move 123 -p null
```

### Promote to Top Level

```bash
menu-cli menu promote 123
```

This sets the menu type to `C` (Catalog) and removes its parent.

### Delete Menu

```bash
menu-cli menu delete 123
```

**Note:** If the JWT token contains an `appId`, this removes the app relation only. Otherwise, it soft-deletes the menu from `t_sys_menu`.

---

## App-Level Menu Management

### View Menu Tree

```bash
# View menu tree (excludes invisible menus)
menu-cli app group

# View all menus including invisible
menu-cli app menus

# Search in tree
menu-cli app group --search "user"
```

### Control Visibility

```bash
# Hide a menu (make invisible)
menu-cli app invisible 123 -v 1

# Show a menu (make visible)
menu-cli app invisible 123 -v 0
```

---

## Complete Workflow Example

```bash
# Step 1: Create a top-level catalog
menu-cli menu create -n "Business Management" --path "/business" -t C --icon "shop"
# Output: Created menu [81]

# Step 2: Create a menu under it
menu-cli menu create -n "Order List" --path "/business/order" -t M \
  --component "business/order/index" --icon "unordered-list" -p 81
# Output: Created menu [82]

# Step 3: Create a button permission under the menu
menu-cli menu create -n "Export Orders" -t F -p 82
# Output: Created menu [83]

# Step 4: View the menu tree
menu-cli app group

# Step 5: Verify the new menu
menu-cli menu get 82

# Step 6: If needed, hide the menu for current app
menu-cli app invisible 82 -v 1
```

---

## Database Tables

### `t_sys_menu` — Global Menu Definition

Stores the route and component information shared across all apps.

### `t_app_res_relation` — App-Level Organization

Stores app-specific hierarchy, ordering, and visibility.

When creating a menu with an `appId` in the JWT token, the system automatically creates a relation record linking the new menu to that app.

---

## Troubleshooting

### Connection Error

```
Error: Cannot connect to server: http://localhost:8080/api/adm/menu
```

- Check if `MENU_BASE_URL` is correct
- Verify the server is running

### Authentication Error (401/403)

```
Error: HTTP 401: Unauthorized
```

- Set a valid `MENU_TOKEN` in `.env`
- Check if the token has expired

### Duplicate Key Error

```
Error: HTTP 400: Duplicate Key
```

- The combination of `path` and other unique fields already exists
- Use a different `path` value

---

## API Endpoints Used

| CLI Command | HTTP Method | API Endpoint |
|-------------|-------------|--------------|
| `menu list` | GET | `/menus` |
| `menu get <id>` | GET | `/menus/{id}` |
| `menu create` | POST | `/menus` |
| `menu update <id>` | PUT | `/menus/{id}` |
| `menu delete <id>` | DELETE | `/menus/{id}` |
| `menu move <id>` | PUT | `/menus/{id}/move` |
| `menu promote <id>` | PUT | `/menus/{id}/promote` |
| `app group` | GET | `/app/group` |
| `app menus` | GET | `/app/menus` |
| `app invisible <id>` | POST | `/app/menus/{id}/op/invisible` |
