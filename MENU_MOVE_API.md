# 菜单排序移动API文档

## 概述

新增两个API端点用于调整应用级菜单的排序号（`t_app_res_relation.order_num`）：

- **向上移动**: `POST /api/adm/menu/app/menus/{id}/op/moveup` - 排序号 +1（null时设为1）
- **向下移动**: `POST /api/adm/menu/app/menus/{id}/op/movedown` - 排序号 -1（null时设为0，最小值为0）

## API端点详情

### 1. 向上移动菜单

**请求**
```
POST /api/adm/menu/app/menus/{id}/op/moveup
```

**路径参数**
- `id` (Long): 菜单ID

**响应**
```json
{
  "code": 200,
  "data": 11,
  "message": "操作成功"
}
```
- `data`: 新的排序号

**行为逻辑**
| 当前 orderNum | 操作结果 |
|--------------|---------|
| `null` | 设置为 `1` |
| `0` | 变为 `1` |
| `5` | 变为 `6` |
| 任意值 | +1（无最大值限制） |

**特性**
- 无最大值限制
- 每次调用将排序号增加1
- 如果 orderNum 为 null，设置为 1
- 更新 `t_app_res_relation.order_num` 字段

### 2. 向下移动菜单

**请求**
```
POST /api/adm/menu/app/menus/{id}/op/movedown
```

**路径参数**
- `id` (Long): 菜单ID

**响应**
```json
{
  "code": 200,
  "data": 0,
  "message": "操作成功"
}
```
- `data`: 新的排序号

**行为逻辑**
| 当前 orderNum | 操作结果 |
|--------------|---------|
| `null` | 设置为 `0` |
| `0` | 保持 `0` |
| `5` | 变为 `4` |
| `1` | 变为 `0` |

**特性**
- 最小值为0
- 如果 orderNum 为 null，设置为 0
- 每次调用将排序号减少1
- 当已为0时，继续调用仍返回0
- 更新 `t_app_res_relation.order_num` 字段

## 错误处理

| 场景 | HTTP状态码 | 响应 |
|------|-----------|------|
| 菜单不存在 | 404 | `{"code": 404, "message": "Menu not found in app"}` |
| 缺少appId | 400 | `{"code": 400, "message": "AppId is required"}` |

## 实现细节

### 数据库表
- **表名**: `t_app_res_relation`
- **字段**: `order_num` (INT)
- **关联**: `app_id` + `res_id` + `res_type='menu'`

### 服务层方法

**AppResRelationMapper.java**
```java
Integer getOrderNum(@Param("appid") String appid, @Param("resId") Long resId);
Integer updateOrderNum(@Param("appid") String appid, @Param("resId") Long resId, @Param("orderNum") Integer orderNum);
```

**MenuAppService.java**
```java
Integer moveUp(Long menuId);    // 返回新的排序号
Integer moveDown(Long menuId);  // 返回新的排序号
```

### 业务逻辑

**moveUp 实现**
```java
// 1. 检查菜单是否存在
Integer count = appResRelationMapper.countByAppIdAndResId(appId, menuId);
if (count == null || count == 0) {
    throw new BusinessException(404, "Menu not found in app");
}

// 2. 获取当前排序号
Integer currentOrderNum = appResRelationMapper.getOrderNum(appId, menuId);

// 3. 如果为null设为1，否则+1
Integer newOrderNum = (currentOrderNum == null) ? 1 : currentOrderNum + 1;
appResRelationMapper.updateOrderNum(appId, menuId, newOrderNum);

return newOrderNum;
```

**moveDown 实现**
```java
// 1. 检查菜单是否存在
Integer count = appResRelationMapper.countByAppIdAndResId(appId, menuId);
if (count == null || count == 0) {
    throw new BusinessException(404, "Menu not found in app");
}

// 2. 获取当前排序号
Integer currentOrderNum = appResRelationMapper.getOrderNum(appId, menuId);

// 3. 如果为null设为0，否则-1（最小为0）
Integer newOrderNum;
if (currentOrderNum == null) {
    newOrderNum = 0;
} else {
    newOrderNum = Math.max(0, currentOrderNum - 1);
}
appResRelationMapper.updateOrderNum(appId, menuId, newOrderNum);

return newOrderNum;
```

### SQL语句

**获取当前排序号**
```sql
SELECT order_num
FROM t_app_res_relation
WHERE app_id = #{appid}
AND res_id = #{resId}
AND res_type = 'menu'
LIMIT 1
```

**更新排序号**
```sql
UPDATE t_app_res_relation
SET order_num = #{orderNum},
    updated_at = NOW()
WHERE app_id = #{appid}
AND res_id = #{resId}
AND res_type = 'menu'
```

## 使用示例

### 场景1: 提高菜单优先级
```bash
# 将菜单176的排序号从0提高到10
for i in {1..10}; do
  curl -X POST "http://129.204.59.156:30081/api/adm/menu/app/menus/176/op/moveup"
done
```

### 场景2: 降低菜单优先级到最低
```bash
# 将菜单176的排序号降到0
for i in {1..20}; do
  curl -X POST "http://129.204.59.156:30081/api/adm/menu/app/menus/176/op/movedown"
done
```

### 场景3: 查看菜单排序效果
```bash
# 获取按orderNum排序的菜单列表
curl "http://129.204.59.156:30081/api/adm/menu/menus?orderBy=order_num&sort=ASC"

# 获取菜单树形结构
curl "http://129.204.59.156:30081/api/adm/menu/app/group"
```

## 与现有API的关系

| API | 操作的目标表 | 用途 |
|-----|-------------|------|
| `PUT /api/adm/menu/menus/{id}` | `t_sys_menu.order_num` | 更新系统菜单排序 |
| `POST /api/adm/menu/app/menus/{id}/op/moveup` | `t_app_res_relation.order_num` | 应用菜单排序+1 |
| `POST /api/adm/menu/app/menus/{id}/op/movedown` | `t_app_res_relation.order_num` | 应用菜单排序-1 |

**重要**: 当使用appId查询菜单时，返回的orderNum来自`t_app_res_relation`表，而不是`t_sys_menu`表。

## 文件变更清单

### 新增文件
- `src/test/http/menu-moveup-movedown-tests.http` - API测试文件

### 修改文件
1. `src/main/java/com/jfeat/am/module/menu/services/domain/dao/AppResRelationMapper.java`
   - 新增方法: `getOrderNum()`, `updateOrderNum()`

2. `src/main/java/com/jfeat/am/module/menu/services/domain/dao/mapping/AppResRelationMapper.xml`
   - 新增SQL映射: `getOrderNum`, `updateOrderNum`

3. `src/main/java/com/jfeat/am/module/menu/services/domain/service/MenuAppService.java`
   - 新增接口方法: `moveUp()`, `moveDown()`

4. `src/main/java/com/jfeat/am/module/menu/services/domain/service/impl/MenuAppServiceImpl.java`
   - 实现方法: `moveUp()`, `moveDown()`

5. `src/main/java/com/jfeat/am/module/menu/api/MenuAppEndpoint.java`
   - 新增API端点: `/menus/{id}/op/moveup`, `/menus/{id}/op/movedown`

## 部署说明

1. 构建项目: `mvn clean package -DskipTests`
2. 生成的JAR: `target/menu-21.0.0.jar`
3. 部署到服务器并重启服务
4. 验证API: 使用测试文件 `menu-moveup-movedown-tests.http`

## 测试验证

部署后，执行以下测试验证功能：

```bash
# 1. 检查当前排序号
curl "http://129.204.59.156:30081/api/adm/menu/menus/176"

# 2. 向上移动
curl -X POST "http://129.204.59.156:30081/api/adm/menu/app/menus/176/op/moveup"

# 3. 验证排序号增加
curl "http://129.204.59.156:30081/api/adm/menu/menus/176"

# 4. 向下移动
curl -X POST "http://129.204.59.156:30081/api/adm/menu/app/menus/176/op/movedown"

# 5. 验证排序号减少
curl "http://129.204.59.156:30081/api/adm/menu/menus/176"
```

## 版本信息

- **版本**: 21.0.0
- **创建日期**: 2026-04-22
- **作者**: Claude Code
