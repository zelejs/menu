package com.jfeat.am.module.menu.api;


import com.jfeat.am.module.menu.services.gen.persistence.dao.MenuMapper;
import com.jfeat.am.module.menu.util.MenuUtil;
import com.jfeat.am.core.jwt.JWTKit;
import io.swagger.annotations.Api;
import io.swagger.annotations.ApiImplicitParam;
import io.swagger.annotations.ApiImplicitParams;
import io.swagger.annotations.ApiOperation;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.bind.annotation.GetMapping;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.dao.DuplicateKeyException;
import com.jfeat.am.module.menu.services.domain.dao.QueryMenuDao;
import com.xinzhi.plat.common.result.ApiResult;
import com.xinzhi.plat.common.result.ApiResultEnum;
import com.xinzhi.plat.common.exception.BusinessException;
import com.jfeat.am.module.menu.api.permission.*;
import com.jfeat.am.common.annotation.Permission;


import com.jfeat.am.module.menu.services.domain.service.*;
import com.jfeat.am.module.menu.services.domain.model.MenuRecord;
import com.jfeat.am.module.menu.services.gen.persistence.model.Menu;
import com.jfeat.am.module.menu.services.domain.dao.AppResRelationMapper;

import org.springframework.web.bind.annotation.RestController;

import jakarta.annotation.Resource;
import java.util.Date;
import java.util.List;


/**
 * <p>
 * api
 * </p>
 *
 * @author Code generator
 * @since 2021-03-13
 */
@RestController

@Api("Menu")
@RequestMapping("/api/adm/menu/menus")
public class MenuEndpoint {

    protected static Logger logger = LoggerFactory.getLogger(MenuEndpoint.class);

    @Resource
    MenuService menuService;
    @Resource
    QueryMenuDao queryMenuDao;
    @Resource
    MenuMapper menuMapper;
    @Resource
    AppResRelationMapper appResRelationMapper;

    // @BusinessLog(name = "菜单", value = "新建菜单") // TODO: replace with plat-common equivalent
    @Permission(MenuPermission.MENU_NEW)
    @PostMapping
    @ApiOperation(value = "新建 菜单", response = Menu.class)
    public ApiResult<Integer> createMenu(@RequestBody Menu entity) {

        Integer affected = 0;
        try {
            MenuUtil.initMenu(entity);
            affected = menuMapper.insert(entity);

            // 如果 app_id 不为 null，同时在 t_app_res_relation 表中添加记录
            String appId = JWTKit.getAppid();
            if (appId != null && !appId.isEmpty() && entity.getId() != null) {
                logger.info("Creating app_res_relation record for appId={}, menuId={}, pid={}",
                           appId, entity.getId(), entity.getPid());
                appResRelationMapper.insertAppResRelation(appId, "menu", entity.getId(), entity.getPid());
            }

        } catch (DuplicateKeyException e) {
            throw new BusinessException(400, "Duplicate Key");
        }

        return ApiResult.success(affected);
    }

    @Permission(MenuPermission.MENU_VIEW)
    @GetMapping("/{id}")
    @ApiOperation(value = "查看 菜单", response = Menu.class)
    public ApiResult<MenuRecord> getMenu(@PathVariable Long id) {
        MenuRecord menuRecord = queryMenuDao.selectOne(id);
        return ApiResult.success(menuRecord);
    }

    // @BusinessLog(name = "菜单", value = "更新 菜单") // TODO: replace with plat-common equivalent
    @Permission(MenuPermission.MENU_EDIT)
    @PutMapping("/{id}")
    @ApiOperation(value = "修改 菜单", response = Menu.class)
    public ApiResult<Integer> updateMenu(@PathVariable Long id, @RequestBody Menu entity) {
        entity.setId(id);
        entity.setUpdateTime(new Date());
        return ApiResult.success(menuMapper.updateById(entity));
    }

    // @BusinessLog(name = "菜单", value = "删除 菜单") // TODO: replace with plat-common equivalent
    @Permission(MenuPermission.MENU_DELETE)
    @DeleteMapping("/{id}")
    @ApiOperation("删除 菜单")
    public ApiResult<Integer> deleteMenu(@PathVariable Long id) {
        return ApiResult.success(menuService.deleteMenuWithAppFilter(id));
    }

    // @BusinessLog(name = "菜单", value = "移动菜单") // TODO: replace with plat-common equivalent
    @Permission(MenuPermission.MENU_EDIT)
    @PutMapping("/{id}/move")
    @ApiOperation(value = "移动菜单到指定父菜单", response = Menu.class)
    @ApiImplicitParams({
            @ApiImplicitParam(name = "id", value = "菜单ID", required = true, dataType = "Long"),
            @ApiImplicitParam(name = "pid", value = "父菜单ID(null表示移到顶层)", dataType = "Long")
    })
    public ApiResult<Integer> moveMenu(@PathVariable Long id, @RequestParam(required = false) Long pid) {
        return ApiResult.success(menuService.moveMenu(id, pid));
    }

    // @BusinessLog(name = "菜单", value = "提升菜单为顶级") // TODO: replace with plat-common equivalent
    @Permission(MenuPermission.MENU_EDIT)
    @PutMapping("/{id}/promote")
    @ApiOperation(value = "将菜单提升为顶级菜单", response = Menu.class)
    @ApiImplicitParams({
            @ApiImplicitParam(name = "id", value = "菜单ID", required = true, dataType = "Long")
    })
    public ApiResult<Integer> promoteMenuToTop(@PathVariable Long id) {
        return ApiResult.success(menuService.promoteMenuToTop(id));
    }

    @Permission(MenuPermission.MENU_VIEW)
    @ApiOperation(value = "菜单 列表信息", response = MenuRecord.class)
    @GetMapping
    @ApiImplicitParams({
            @ApiImplicitParam(name = "pageNum", dataType = "Integer"),
            @ApiImplicitParam(name = "pageSize", dataType = "Integer"),
            @ApiImplicitParam(name = "search", dataType = "String"),
            @ApiImplicitParam(name = "id", dataType = "Long"),
            @ApiImplicitParam(name = "pid", dataType = "Long"),
            @ApiImplicitParam(name = "name", dataType = "String"),
            @ApiImplicitParam(name = "path", dataType = "String"),
            @ApiImplicitParam(name = "component", dataType = "String"),
            @ApiImplicitParam(name = "redirect", dataType = "String"),
            @ApiImplicitParam(name = "wrappers", dataType = "String"),
            @ApiImplicitParam(name = "orderNum", dataType = "Integer"),
            @ApiImplicitParam(name = "isFrame", dataType = "Integer"),
            @ApiImplicitParam(name = "isCache", dataType = "Integer"),
            @ApiImplicitParam(name = "menuType", dataType = "String"),
            @ApiImplicitParam(name = "visible", dataType = "String"),
            @ApiImplicitParam(name = "status", dataType = "String"),
            @ApiImplicitParam(name = "permId", dataType = "Long"),
            @ApiImplicitParam(name = "icon", dataType = "String"),
            @ApiImplicitParam(name = "createTime", dataType = "Date"),
            @ApiImplicitParam(name = "updateTime", dataType = "Date"),
            @ApiImplicitParam(name = "orderBy", dataType = "String"),
            @ApiImplicitParam(name = "sort", dataType = "String")
    })
    public ApiResult<Page<MenuRecord>> queryMenus(Page<MenuRecord> page,
                          @RequestParam(name = "pageNum", required = false, defaultValue = "1") Integer pageNum,
                          @RequestParam(name = "pageSize", required = false, defaultValue = "10") Integer pageSize,
                          @RequestParam(name = "search", required = false) String search,
                          @RequestParam(name = "id", required = false) Long id,
                          @RequestParam(name = "pid", required = false) Long pid,
                          @RequestParam(name = "name", required = false) String name,
                          @RequestParam(name = "path", required = false) String path,
                          @RequestParam(name = "component", required = false) String component,
                          @RequestParam(name = "redirect", required = false) String redirect,
                          @RequestParam(name = "wrappers", required = false) String wrappers,
                          @RequestParam(name = "orderNum", required = false) Integer orderNum,
                          @RequestParam(name = "isFrame", required = false) Integer isFrame,
                          @RequestParam(name = "isCache", required = false) Integer isCache,
                          @RequestParam(name = "menuType", required = false) String menuType,
                          @RequestParam(name = "visible", required = false) String visible,
                          @RequestParam(name = "status", required = false) String status,
                          @RequestParam(name = "permId", required = false) Long permId,
                          @RequestParam(name = "icon", required = false) String icon,
                          @DateTimeFormat(pattern = "yyyy-MM-dd HH:mm:ss")
                          @RequestParam(name = "createTime", required = false) Date createTime,
                          @DateTimeFormat(pattern = "yyyy-MM-dd HH:mm:ss")
                          @RequestParam(name = "updateTime", required = false) Date updateTime,
                          @RequestParam(name = "orderBy", required = false) String orderBy,
                          @RequestParam(name = "sort", required = false) String sort) {

        if (orderBy != null && orderBy.length() > 0) {
            if (sort != null && sort.length() > 0) {
                String pattern = "(ASC|DESC|asc|desc)";
                if (!sort.matches(pattern)) {
                    throw new BusinessException(400, "sort must be ASC or DESC");
                }
            } else {
                sort = "ASC";
            }
            orderBy = "`" + orderBy + "`" + " " + sort;
        }
        page.setCurrent(pageNum);
        page.setSize(pageSize);

        MenuRecord record = new MenuRecord();
        record.setId(id);
        record.setPid(pid);
        record.setName(name);
        record.setPath(path);
        record.setComponent(component);
        record.setRedirect(redirect);
        record.setWrappers(wrappers);
        record.setOrderNum(orderNum);
        record.setIsFrame(isFrame);
        record.setIsCache(isCache);
        record.setMenuType(menuType);
        record.setVisible(visible);
        record.setStatus(status);
        record.setPermId(permId);
        record.setIcon(icon);
        record.setCreateTime(createTime);
        record.setUpdateTime(updateTime);

        // 从 JWT 获取 app_id，用于与 t_app_res_relation 表关联
        String appId = JWTKit.getAppid();
        List<MenuRecord> menuPage = queryMenuDao.findMenuPage(page, record, search, orderBy, null, null, appId);

        page.setRecords(menuPage);

        return ApiResult.success(page);
    }

}
