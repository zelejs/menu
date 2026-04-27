package com.jfeat.am.module.menu.services.domain.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.conditions.update.LambdaUpdateWrapper;
import com.jfeat.am.core.jwt.JWTKit;
import com.jfeat.am.module.menu.services.domain.dao.AppResRelationMapper;
import com.jfeat.am.module.menu.services.domain.service.MenuService;
import com.jfeat.am.module.menu.services.gen.crud.service.impl.CRUDMenuServiceImpl;
import com.jfeat.am.module.menu.services.gen.persistence.dao.MenuMapper;
import com.jfeat.am.module.menu.services.gen.persistence.model.Menu;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import jakarta.annotation.Resource;
import java.util.ArrayList;
import java.util.List;

/**
 * <p>
 * 服务实现类
 * </p>
 *
 * @author admin
 * @since 2017-10-16
 */

@Service("menuService")
public class MenuServiceImpl extends CRUDMenuServiceImpl implements MenuService {

    private static final Logger logger = LoggerFactory.getLogger(MenuServiceImpl.class);

    @Resource
    private AppResRelationMapper appResRelationMapper;

    @Resource
    private MenuMapper menuMapper;

    /**
     * 递归获取所有后代菜单ID（兼容旧版MySQL）
     */
    private List<Long> getDescendantMenuIds(Long parentId) {
        List<Long> allDescendants = new ArrayList<>();
        List<Long> currentLevel = new ArrayList<>();
        currentLevel.add(parentId);

        while (!currentLevel.isEmpty()) {
            // 查询当前层级的所有子菜单
            LambdaQueryWrapper<Menu> wrapper = new LambdaQueryWrapper<>();
            wrapper.in(Menu::getPid, currentLevel)
                   .select(Menu::getId);

            List<Menu> children = menuMapper.selectList(wrapper);
            currentLevel.clear();

            for (Menu child : children) {
                allDescendants.add(child.getId());
                currentLevel.add(child.getId());
            }
        }

        return allDescendants;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Integer deleteMenuWithAppFilter(Long id) {
        String appId = JWTKit.getAppid();
        logger.info("deleteMenuWithAppFilter: id={}, appId={}", id, appId);

        // 如果 app_id 不为 null，只删除 t_app_res_relation 记录
        if (appId != null && !appId.isEmpty()) {
            logger.info("Deleting app_res_relation records for appId={}, menuId={}", appId, id);
            // 获取所有后代菜单ID（使用 Java 递归查询，兼容旧版MySQL）
            List<Long> menuIdsToDelete = new ArrayList<>();
            menuIdsToDelete.add(id);

            List<Long> descendantIds = getDescendantMenuIds(id);
            if (descendantIds != null && !descendantIds.isEmpty()) {
                menuIdsToDelete.addAll(descendantIds);
            }

            logger.info("Total menu IDs to delete from app_res_relation: {}", menuIdsToDelete);
            // 批量删除关联记录
            Integer result = appResRelationMapper.deleteByAppIdAndResIds(appId, menuIdsToDelete);
            logger.info("Deleted {} records from app_res_relation", result);
            return result;
        } else {
            logger.info("Soft deleting menu from t_sys_menu: id={}", id);
            // app_id 为 null 时，软删除 t_sys_menu
            Menu menu = new Menu();
            menu.setId(id);
            menu.setDeleteFlag(1);
            Integer result = getMasterMapper().updateById(menu);
            logger.info("Soft delete result: {}", result);
            return result;
        }
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Integer moveMenu(Long id, Long pid) {
        logger.info("moveMenu: id={}, pid={}", id, pid);

        // 使用 LambdaUpdateWrapper 强制更新 pid 字段，包括 null 值
        LambdaUpdateWrapper<Menu> updateWrapper = new LambdaUpdateWrapper<>();
        updateWrapper.eq(Menu::getId, id)
                     .set(Menu::getPid, pid)
                     .set(Menu::getUpdateTime, new java.util.Date());

        Integer result = menuMapper.update(null, updateWrapper);
        logger.info("moveMenu result: {}", result);
        return result;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Integer promoteMenuToTop(Long id) {
        logger.info("promoteMenuToTop: id={}", id);

        // 将菜单提升为顶级菜单：设置 menu_type='C' 和 pid=null
        LambdaUpdateWrapper<Menu> updateWrapper = new LambdaUpdateWrapper<>();
        updateWrapper.eq(Menu::getId, id)
                     .set(Menu::getMenuType, "C")
                     .set(Menu::getPid, (String) null)
                     .set(Menu::getUpdateTime, new java.util.Date());

        Integer result = menuMapper.update(null, updateWrapper);
        logger.info("promoteMenuToTop result: {}", result);
        return result;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Integer deleteMenuRecursive(Long id) {
        logger.info("deleteMenuRecursive: id={}", id);

        // 获取所有后代菜单ID
        List<Long> menuIdsToDelete = new ArrayList<>();
        menuIdsToDelete.add(id);

        List<Long> descendantIds = getDescendantMenuIds(id);
        if (descendantIds != null && !descendantIds.isEmpty()) {
            menuIdsToDelete.addAll(descendantIds);
        }

        logger.info("Total menu IDs to delete: {}", menuIdsToDelete);

        // 软删除所有菜单（设置 delete_flag=1）
        Integer totalDeleted = 0;
        for (Long menuId : menuIdsToDelete) {
            Menu menu = new Menu();
            menu.setId(menuId);
            menu.setDeleteFlag(1);
            Integer result = getMasterMapper().updateById(menu);
            totalDeleted += result;
        }

        logger.info("deleteMenuRecursive result: {}", totalDeleted);
        return totalDeleted;
    }
}
