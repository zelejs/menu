# Crash Log Management Menu — Implementation Plan

## 1. Menu Record Created

A new menu entry has been created in `t_sys_menu`:

| Field | Value |
|-------|-------|
| **ID** | `224` |
| **Name** | `崩溃日志` (Crash Log) |
| **Menu Type** | `M` (Menu) |
| **Parent ID** | `58` (设备 / Device) |
| **Path** | `/device-mgmt/crash-log` |
| **Component** | `./device-mgmt/crash-log` |
| **Icon** | `FileTextOutlined` |
| **Status** | `0` (enabled) |
| **Visible** | `0` (show) |

## 2. Current Menu Hierarchy

```
[58] 设备 (Device)
├── [176] 设备列表
├── [177] 设备详情
├── [192] 设备分类
├── [191] 告警中心
└── [224] 崩溃日志   <-- NEW
```

## 3. Requirements for mdm-admin

### 3.1 Frontend Component Path

**Action required:** Provide the frontend component file path for the crash log page.

Current convention in this project:

| Menu | Component Path |
|------|----------------|
| 告警中心 | `./device-mgmt/eventList` |
| 设备列表 | `./equipment` |
| 设备详情 | *(TBD)* |

**Suggested component path** (based on existing naming):
```
./device-mgmt/crash-log
```

Please confirm or provide the actual component path. Once confirmed, the `component` field will be updated via:

```bash
menu-cli menu update 224 --component "./device-mgmt/crash-log"
```

### 3.2 Route Configuration

The backend route (`path`) is already set to `/device-mgmt/crash-log`.

Please confirm the frontend route mapping aligns with your router configuration. If a different route path is needed, provide the exact value.

### 3.3 Page Layout / Wrappers

If this page requires a specific layout wrapper (e.g., `BlankLayout`, `BasicLayout`), please specify. Currently `wrappers` is empty.

Reference:
- 告警中心: `wrappers = ""`
- 数据总览: `wrappers = ""`

### 3.4 Redirect

If the crash log page should redirect to a default sub-page (e.g., a list view), provide the `redirect` path.

### 3.5 Backend API Requirements

If the crash log page needs dedicated backend APIs, list them here so the backend team can implement them. Common patterns:

| API | Method | Endpoint | Description |
|-----|--------|----------|-------------|
| List crash logs | GET | `/api/adm/device/crash-logs` | Paginated crash log list |
| Get crash log detail | GET | `/api/adm/device/crash-logs/{id}` | Single crash log detail |
| Delete crash log | DELETE | `/api/adm/device/crash-logs/{id}` | Remove a crash log |
| Export crash logs | POST | `/api/adm/device/crash-logs/export` | Export crash log data |

### 3.6 Permission ID

If role-based access control is required for this menu, a `perm_id` must be assigned. Please coordinate with the auth team to create the permission and provide the ID.

## 4. Next Steps

| # | Owner | Task | Status |
|---|-------|------|--------|
| 1 | Backend | Create menu record in `t_sys_menu` | ✅ Done |
| 2 | mdm-admin | Confirm/provide frontend component path | ⏳ Pending |
| 3 | mdm-admin | Confirm route path and wrappers | ⏳ Pending |
| 4 | Backend (if needed) | Implement crash log REST APIs | ⏳ Pending |
| 5 | Auth team (if needed) | Create permission record and assign `perm_id` | ⏳ Pending |
| 6 | Backend | Update `component` field once mdm-admin confirms | ⏳ Pending |
| 7 | QA | Verify menu appears correctly in navigation | ⏳ Pending |

## 5. How to Update After mdm-admin Response

Once mdm-admin provides the component path, run:

```bash
# Update component
menu-cli menu update 224 --component "./device-mgmt/crash-log"

# If route path needs to change
menu-cli menu update 224 --path "/device-mgmt/crash-log"

# If wrappers are needed
menu-cli menu update 224 --component "./device-mgmt/crash-log" --wrappers "BasicLayout"

# Verify
menu-cli menu get 224
menu-cli app group
```

## 6. Appendix: Existing Reference Menus

### 告警中心 (Alarm Center)
```json
{
  "id": 191,
  "name": "告警中心",
  "path": "/device-mgmt/eventList",
  "component": "./device-mgmt/eventList",
  "menuType": "M",
  "pid": 58,
  "icon": "",
  "hideInMenu": 1
}
```

### 操作日志 (Operation Log)
```json
{
  "id": 193,
  "name": "操作日志",
  "path": "/system/logs",
  "component": "",
  "menuType": "M",
  "pid": 81,
  "icon": "",
  "hideInMenu": 1
}
```
