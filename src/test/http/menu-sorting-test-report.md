# 菜单排序功能测试报告

**测试日期**: 2026-04-22
**测试环境**: http://129.204.59.156:30081
**API前缀**: /api/adm/menu/menus

---

## 测试概述

测试菜单列表API的排序功能是否正确工作。

---

## 发现的问题

### ⚠️ 严重问题：双重orderNum字段导致排序功能失效

#### 问题描述

当使用应用ID (appId) 查询菜单时，系统使用两个不同的表来存储 `order_num`：

1. **系统菜单表**: `t_sys_menu.order_num`
2. **应用资源关联表**: `t_app_res_relation.order_num`

#### 影响范围

- API端点 `PUT /api/adm/menu/menus/{id}` 只更新 `t_sys_menu.order_num`
- 但当使用 appId 查询时，返回的 orderNum 来自 `t_app_res_relation.order_num`
- 这导致更新操作对查询结果**没有影响**

#### 代码证据

**QueryMenuDao.xml** (第42-76行):
```xml
<select id="findMenuPage" resultType="MenuRecord">
    <choose>
        <when test="appId != null and appId != ''">
            SELECT
            ...
            t_app_res_relation.order_num AS orderNum    -- ← 使用 app_res_relation 表
            FROM t_app_res_relation
            INNER JOIN t_sys_menu ON t_app_res_relation.res_id = t_sys_menu.id
            WHERE t_app_res_relation.app_id = #{appId}
        </when>
        <otherwise>
            SELECT
            ...
            t_sys_menu.order_num AS orderNum            -- ← 使用 sys_menu 表
            FROM t_sys_menu
            WHERE 1=1
        </otherwise>
    </choose>
</select>
```

#### 测试结果

| 操作 | 预期结果 | 实际结果 |
|------|---------|---------|
| PUT更新orderNum=10 | t_sys_menu.order_num更新为10 | ✅ 成功 |
| 用appId查询菜单 | 返回orderNum=10 | ❌ 返回旧值 (来自app_res_relation) |

#### 测试步骤

```bash
# 1. 更新菜单176的orderNum为10
curl -X PUT "http://129.204.59.156:30081/api/adm/menu/menus/176" \
  -H "Content-Type: application/json" \
  -d '{"orderNum": 10}'
# 返回: {"code":200,"data":1,"message":"操作成功"}

# 2. 直接查询菜单176（返回正确的值）
curl "http://129.204.59.156:30081/api/adm/menu/menus/176"
# 返回: orderNum=10 ✅

# 3. 用appId查询列表（返回错误的值）
curl "http://129.204.59.156:30081/api/adm/menu/menus?pageNum=1&pageSize=10"
# 菜单176显示orderNum为app_res_relation中的值，而不是10 ❌
```

---

## 排序功能测试结果

### 系统菜单排序（无appId）

| 测试场景 | API调用 | 结果 |
|---------|---------|------|
| 升序排序 | `?orderBy=order_num&sort=ASC` | ✅ 正常 |
| 降序排序 | `?orderBy=order_num&sort=DESC` | ✅ 正常 |
| 默认排序 | `?` | ✅ 正常 (order_num ASC) |
| 按名称排序 | `?orderBy=name&sort=ASC` | ✅ 正常 |
| 按创建时间排序 | `?orderBy=create_time&sort=DESC` | ✅ 正常 |

### 应用菜单排序（有appId）

| 测试场景 | API调用 | 结果 |
|---------|---------|------|
| 升序排序 | `?orderBy=order_num&sort=ASC` | ⚠️ 使用错误的表 |
| 降序排序 | `?orderBy=order_num&sort=DESC` | ⚠️ 使用错误的表 |
| 更新排序 | PUT with orderNum | ❌ 不影响查询结果 |

---

## 修复建议

### 方案1: 添加API更新app_res_relation.order_num

在 `AppResRelationMapper` 中添加方法：

```java
/**
 * 更新应用菜单排序
 */
Integer updateOrderNum(@Param("appid") String appid, @Param("resId") Long resId, @Param("orderNum") Integer orderNum);
```

对应的XML:
```xml
<update id="updateOrderNum">
    UPDATE t_app_res_relation
    SET order_num = #{orderNum}
    WHERE app_id = #{appid} AND res_id = #{resId} AND res_type = 'menu'
</update>
```

### 方案2: 统一使用t_sys_menu.order_num

修改QueryDao.xml，无论是否有appId，都使用 `t_sys_menu.order_num` 进行排序。

### 方案3: 同步两个表的order_num

当更新 `t_sys_menu.order_num` 时，同时更新 `t_app_res_relation.order_num`。

---

## 测试文件

- HTTP测试文件: `src/test/http/menu-order-update-tests.http`
- 本报告: `src/test/http/menu-sorting-test-report.md`

---

## 结论

菜单排序功能存在架构问题：
- ✅ 排序查询逻辑正确
- ✅ 系统菜单排序功能正常
- ❌ 应用菜单的orderNum更新无法生效
- ❌ 缺少更新`t_app_res_relation.order_num`的API

**建议优先级**: 高
**影响范围**: 所有使用appId的应用菜单排序功能
