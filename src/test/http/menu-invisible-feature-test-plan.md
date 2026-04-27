# Menu Invisible Feature Test Plan

## Feature Overview
The menu invisible feature allows administrators to hide menus from users without deleting them. This is useful for temporarily disabling menu items or hiding them from specific applications.

## Database Changes
- **Table**: `t_app_res_relation`
- **Field**: `invisible` (tinyint(1), default 0)
  - 0 = Visible
  - 1 = Invisible

## New Endpoints

### 1. Get All Menus (Including Invisible)
```
GET /api/adm/menu/app/menus
```
**Description**: Retrieves all menu items including those marked as invisible.

**Query Parameters**:
- `search` (optional): Search keyword to filter menus

**Expected Response**:
```json
{
  "code": 200,
  "message": "success",
  "data": [
    {
      "id": 1,
      "name": "Dashboard",
      "invisible": 0,
      "children": [...]
    }
  ]
}
```

### 2. Set Menu Invisible Status
```
POST /api/adm/menu/app/menus/{id}/op/invisible
```
**Description**: Updates the invisible status of a menu item.

**Path Parameters**:
- `id` (required): The menu ID

**Request Body** (optional):
```json
{
  "value": 1
}
```
- If body is not provided, defaults to `value = 1` (invisible)
- `value = 0`: Make menu visible
- `value = 1`: Make menu invisible

**Expected Response**:
```json
{
  "code": 200,
  "message": "success",
  "data": 1
}
```

## Test Cases

### Positive Test Cases

#### TC01: Get All Menus Without Search
1. Send GET request to `/api/adm/menu/app/menus`
2. Verify response contains all menus
3. Verify response includes `invisible` field for each menu
4. Verify both visible (invisible=0) and invisible (invisible=1) menus are returned

#### TC02: Get All Menus With Search
1. Send GET request to `/api/adm/menu/app/menus?search=dashboard`
2. Verify response contains only matching menus
3. Verify `invisible` field is present

#### TC03: Set Menu to Invisible (Default)
1. Send POST request to `/api/adm/menu/app/menus/{id}/op/invisible` without body
2. Verify response code is 200
3. Verify menu `invisible` value is set to 1
4. Verify menu no longer appears in regular `/api/adm/menu/app/group` endpoint

#### TC04: Set Menu to Invisible (Explicit)
1. Send POST request to `/api/adm/menu/app/menus/{id}/op/invisible` with `{"value": 1}`
2. Verify response code is 200
3. Verify menu `invisible` value is set to 1

#### TC05: Set Menu to Visible
1. First, set a menu to invisible
2. Send POST request to `/api/adm/menu/app/menus/{id}/op/invisible` with `{"value": 0}`
3. Verify response code is 200
4. Verify menu `invisible` value is set to 0
5. Verify menu appears in regular `/api/adm/menu/app/group` endpoint

#### TC06: Toggle Menu Visibility Multiple Times
1. Set menu to invisible (value=1)
2. Verify status
3. Set menu to visible (value=0)
4. Verify status
5. Repeat to ensure consistency

### Negative Test Cases

#### TC07: Invalid Menu ID
1. Send POST request to `/api/adm/menu/app/menus/999999/op/invisible`
2. Verify appropriate error response

#### TC08: Invalid Invisible Value
1. Send POST request with `{"value": 2}`
2. Verify error: "Value must be 0 or 1"

#### TC09: Invalid Invisible Value (Negative)
1. Send POST request with `{"value": -1}`
2. Verify error: "Value must be 0 or 1"

#### TC10: Missing AppId (No JWT)
1. Send request without authentication
2. Verify error: "AppId is required"

### Integration Test Cases

#### TC11: Parent Menu Invisible Affects Children
1. Set a parent menu to invisible
2. Verify children are also affected in `/api/adm/menu/app/group` endpoint
3. Verify children still appear in `/api/adm/menu/app/menus` endpoint

#### TC12: Child Menu Independent Visibility
1. Set only a child menu to invisible
2. Verify parent menu is still visible
3. Verify only the child is hidden

## Expected Behavior Changes

### Existing Endpoint: GET /api/adm/menu/app/group
- **Before**: Returns all menus
- **After**: Returns only menus where `invisible = 0`
- Invisible menus are filtered out from the response

## Authentication
All endpoints require JWT authentication with a valid `appId` claim.

## Test Data Requirements
- At least one parent menu with children
- Multiple levels of menu hierarchy
- Mix of visible and invisible menus for comprehensive testing
