package com.jfeat.am.module.menu.api;


import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.jfeat.am.module.menu.services.domain.dao.QueryMenuDao;
import com.jfeat.am.module.menu.services.domain.service.MenuService;
import com.jfeat.am.module.menu.services.domain.model.MenuRecord;
import com.jfeat.am.module.menu.services.gen.persistence.model.Menu;
import com.jfeat.am.module.menu.services.gen.persistence.dao.MenuMapper;
import com.xinzhi.plat.common.result.ApiResult;
import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.bind.annotation.*;

import jakarta.annotation.Resource;
import java.util.Date;
import java.util.List;


/**
 * Dev Menu API - bypasses appId filter for debugging/admin purposes
 *
 * @author Code generator
 * @since 2025-04-01
 */
@RestController

@Api("Dev Menu")
@RequestMapping("/api/adm/menu/dev/menu")
public class DevMenuEndpoint {

    protected static Logger logger = LoggerFactory.getLogger(DevMenuEndpoint.class);

    @Resource
    MenuService menuService;
    @Resource
    QueryMenuDao queryMenuDao;
    @Resource
    MenuMapper menuMapper;

    @GetMapping("/menus")
    @ApiOperation(value = "Dev: Get all menus (no appId filter)", response = MenuRecord.class)
    public ApiResult<List<MenuRecord>> getAllMenus() {
        // Query all menus without appId filter
        Page<MenuRecord> page = new Page<>(1, 10000);
        List<MenuRecord> menuPage = queryMenuDao.findMenuPage(page, null, null, null, null, null, null);
        return ApiResult.success(menuPage);
    }

    @PostMapping("/menus")
    @ApiOperation(value = "Dev: Create menu with default values (no appId filter)", response = Menu.class)
    public ApiResult<Menu> createMenu(@RequestBody(required = false) Menu entity) {
        Date now = new Date();

        // If no entity provided, create with defaults
        if (entity == null) {
            entity = new Menu();
        }

        // Set default values for null fields
        if (entity.getName() == null || entity.getName().isEmpty()) {
            entity.setName("新菜单");
        }
        if (entity.getPath() == null || entity.getPath().isEmpty()) {
            entity.setPath("/");   // Default path
        }
        if (entity.getMenuType() == null || entity.getMenuType().isEmpty()) {
            entity.setMenuType("M");  // M = Menu
        }
        if (entity.getVisible() == null || entity.getVisible().isEmpty()) {
            entity.setVisible("0");   // 0 = visible
        }
        if (entity.getStatus() == null || entity.getStatus().isEmpty()) {
            entity.setStatus("0");    // 0 = enabled
        }
        if (entity.getOrderNum() == null) {
            entity.setOrderNum(0);
        }
        if (entity.getIsFrame() == null) {
            entity.setIsFrame(0);
        }
        if (entity.getIsCache() == null) {
            entity.setIsCache(0);
        }
        if (entity.getHideInMenu() == null) {
            entity.setHideInMenu(0);
        }
        if (entity.getCreateTime() == null) {
            entity.setCreateTime(now);
        }
        if (entity.getUpdateTime() == null) {
            entity.setUpdateTime(now);
        }

        // Insert menu
        menuMapper.insert(entity);

        logger.info("Dev: Created menu with id={}, pid={}, name={}",
                   entity.getId(), entity.getPid(), entity.getName());

        return ApiResult.success(entity);
    }

    @GetMapping("/menus/{id}")
    @ApiOperation(value = "Dev: Get menu by ID (no appId filter)", response = Menu.class)
    public ApiResult<Menu> getMenu(@PathVariable Long id) {
        LambdaQueryWrapper<Menu> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(Menu::getId, id)
               .eq(Menu::getDeleteFlag, 0);
        Menu menu = menuMapper.selectOne(wrapper);
        return ApiResult.success(menu);
    }

    @GetMapping("/tree")
    @ApiOperation(value = "Dev: Get menu tree (no appId filter)", response = MenuRecord.class)
    public ApiResult<List<MenuRecord>> getMenuTree() {
        // Query all menus and return as tree structure
        Page<MenuRecord> page = new Page<>(1, 10000);
        List<MenuRecord> menus = queryMenuDao.findMenuPage(page, null, null, null, null, null, null);
        return ApiResult.success(menus);
    }

    @DeleteMapping("/menus/{id}")
    @ApiOperation(value = "Dev: Delete menu (no appId filter)")
    public ApiResult<Integer> deleteMenu(@PathVariable Long id, @RequestParam(required = false, defaultValue = "false") boolean recursive) {
        if (recursive) {
            return ApiResult.success(menuService.deleteMenuRecursive(id));
        }
        return ApiResult.success(menuService.deleteMenuWithAppFilter(id));
    }

    @PutMapping("/menus/{id}")
    @ApiOperation(value = "Dev: Update menu (no appId filter)", response = Menu.class)
    public ApiResult<Integer> updateMenu(@PathVariable Long id, @RequestBody Menu entity) {
        entity.setId(id);
        entity.setUpdateTime(new Date());
        return ApiResult.success(menuMapper.updateById(entity));
    }

    @PutMapping("/menus/{id}/move")
    @ApiOperation(value = "Dev: Move menu to specified parent (no appId filter)", response = Menu.class)
    public ApiResult<Integer> moveMenu(@PathVariable Long id, @RequestParam(required = false) Long pid) {
        return ApiResult.success(menuService.moveMenu(id, pid));
    }

    @PutMapping("/menus/{id}/promote")
    @ApiOperation(value = "Dev: Promote menu to top level (no appId filter)", response = Menu.class)
    public ApiResult<Integer> promoteMenuToTop(@PathVariable Long id) {
        return ApiResult.success(menuService.promoteMenuToTop(id));
    }
}
