package com.jfeat.am.module.menu.services.domain.service.impl;

import com.alibaba.fastjson2.JSONArray;
import com.alibaba.fastjson2.JSONObject;
import com.google.common.collect.Lists;
import com.jfeat.am.core.jwt.JWTKit;
import com.jfeat.am.module.menu.services.domain.dao.AppResRelationMapper;
import com.jfeat.am.module.menu.services.domain.dao.QueryMenuDao;
import com.jfeat.am.module.menu.services.domain.service.MenuAppService;
import com.jfeat.am.module.menu.services.gen.crud.model.MenuModel;
import com.jfeat.am.module.menu.services.gen.crud.service.impl.CRUDMenuServiceImpl;
import com.jfeat.am.module.menu.tool.AppTools;
import com.xinzhi.plat.common.exception.BusinessException;
import org.apache.commons.lang3.StringUtils;
import org.springframework.stereotype.Service;

import jakarta.annotation.Resource;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * <p>
 * 应用菜单服务实现类
 * </p>
 *
 * @author admin
 * @since 2017-10-16
 */

@Service("menuAppService")
public class MenuAppServiceImpl extends CRUDMenuServiceImpl implements MenuAppService {

    @Resource
    QueryMenuDao queryMenuDao;

    @Resource
    AppTools appTools;

    @Resource
    private AppResRelationMapper appResRelationMapper;

    //获取菜单信息 分组返回
    @Override
    public List<MenuModel> getMenuGroup(String status, String search) {
        //Long orgId = JWTKit.getTenantOrgId();
        if (!StringUtils.isEmpty(search)) {
            return queryMenuDao.searchMenu(search);
        } else {

            // 获取 app_id，用于与 t_app_res_relation 表关联
            String appId = JWTKit.getAppid();

            Long orgId = null;
            //获取一级菜单 - 根据 appId 决定使用哪种查询方式
            List<MenuModel> pMenu;
            if (!StringUtils.isEmpty(appId)) {
                // 使用应用级菜单查询（基于 t_app_res_relation.pid）
                pMenu = queryMenuDao.getAppPMenu(appId, status);
            } else {
                // 使用全局菜单查询（基于 t_sys_menu.pid）
                pMenu = queryMenuDao.getPMenu(orgId, status, appId);
            }

            List<MenuModel> oldMenu = pMenu;
            List<Long> pIds = pMenu.stream().map(i -> i.getId()).collect(Collectors.toList());

            while (pIds != null && pIds.size() > 0) {

                //获取子菜单 - 根据 appId 决定使用哪种查询方式
                List<MenuModel> sonMenu;
                if (!StringUtils.isEmpty(appId)) {
                    // 使用应用级菜单查询
                    sonMenu = queryMenuDao.getAppSonMenu(pIds, appId, status);
                } else {
                    // 使用全局菜单查询
                    sonMenu = queryMenuDao.getSonMenu(pIds, status, appId);
                }

                Map<Long, List<MenuModel>> sonMenuMaps = sonMenu.stream().collect(Collectors.toMap(i -> i.getPid(),
                        value -> Lists.newArrayList(value),
                        (List<MenuModel> v1, List<MenuModel> v2) -> {
                            v1.addAll(v2);
                            return v1;
                        }
                ));
                for (MenuModel menu : oldMenu) {
                    menu.setChildren(sonMenuMaps.get(menu.getId()));
                }
                oldMenu = sonMenu;
                pIds = sonMenu.stream().map(i -> i.getId()).collect(Collectors.toList());
            }


            return pMenu;
        }
    }


    @Override
    public JSONArray getMenuJSON() {
        // getMenuGroup 内部已根据 app_id 与 t_app_res_relation 进行关联过滤
        List<MenuModel> menuGroup = this.getMenuGroup("0", null);

        JSONArray array = new JSONArray();
        for (MenuModel menu : menuGroup) {
            JSONObject menuJSON = getMenuJSON(menu);
            array.add(menuJSON);
        }

        return array;
    }

    //组装上层
    @Override
    public JSONObject getMenuJSON(MenuModel menu) {
        JSONObject menuJSON = new JSONObject();
        putBaseInfo(menuJSON, menu);
        List<JSONObject> item = new ArrayList<>();
        List<MenuModel> children = menu.getChildren();
        List<String> pPermissions = new ArrayList<>();
        //子类处理
        if (children != null && children.size() > 0) {

            List<MenuModel> sonMenuList = children;

            for (MenuModel sonMenu : sonMenuList) {
                JSONObject sonMenuJSON = getSonMenuJSON(sonMenu);
                //子类权限加入父类
                String permissions = sonMenuJSON.getString("permissions");
                if (!StringUtils.isEmpty(permissions)) {
                    pPermissions.add(permissions);
                }
                //加入子类
                item.add(sonMenuJSON);
            }
            menuJSON.put("items", item);
        }
        if (pPermissions != null && pPermissions.size() > 0) {
            menuJSON.put("permissions", pPermissions);
        }
        return menuJSON;
    }


    //返回子类菜单
    public JSONObject getSonMenuJSON(MenuModel menu) {
        JSONObject menuJSON = new JSONObject();
        putBaseInfo(menuJSON, menu);

        Long permId = menu.getPermId();
        if (permId != null) {
            // 使用 permId 作为权限标识
            menuJSON.put("permissions", permId.toString());
        }

        return menuJSON;
    }


    void putBaseInfo(JSONObject menuJSON, MenuModel menu) {
        menuJSON.put("name", menu.getPath());
        /*
         * 2023-09-14 新增需求：如果有pageId则拼接到path中，以${parentMenuComponent}/publicPage?pageId=${pageId}的格式
         */
        if (menu.getPageId() != null) {
            // 获取父级菜单路径
            String parentMenuComponent = null;
            if (menu.getPid() != null) {
                parentMenuComponent = queryMenuDao.getComponentById(menu.getPid());
            }
            String path = parentMenuComponent + "/publicPage?pageId=" + menu.getPageId();
            menuJSON.put("path", path);
        } else {
            menuJSON.put("path", menu.getComponent());
        }
        /*
         * 2023-08-28 新增需求：增加返回pageId
         */
        menuJSON.put("pageId", menu.getPageId());
        String icon = menu.getIcon();
        if (StringUtils.isEmpty(icon)) {
            menuJSON.put("icon", icon);
        }
    }

    @Override
    public Integer alterStatus(Long id) {
        Integer integer = queryMenuDao.alterStatus(id);
        return integer;
    }

    @Override
    public List<MenuModel> getAllMenuGroup(String status, String search) {
        if (!StringUtils.isEmpty(search)) {
            return queryMenuDao.searchMenu(search);
        } else {
            String appId = JWTKit.getAppid();
            List<MenuModel> pMenu = queryMenuDao.getAppPMenuAll(appId, status);
            List<MenuModel> oldMenu = pMenu;
            List<Long> pIds = pMenu.stream().map(i -> i.getId()).collect(Collectors.toList());

            while (pIds != null && pIds.size() > 0) {
                List<MenuModel> sonMenu = queryMenuDao.getAppSonMenuAll(pIds, appId, status);
                Map<Long, List<MenuModel>> sonMenuMaps = sonMenu.stream().collect(Collectors.toMap(
                        i -> i.getPid(),
                        value -> Lists.newArrayList(value),
                        (List<MenuModel> v1, List<MenuModel> v2) -> {
                            v1.addAll(v2);
                            return v1;
                        }
                ));
                for (MenuModel menu : oldMenu) {
                    menu.setChildren(sonMenuMaps.get(menu.getId()));
                }
                oldMenu = sonMenu;
                pIds = sonMenu.stream().map(i -> i.getId()).collect(Collectors.toList());
            }
            return pMenu;
        }
    }

    @Override
    public Integer updateMenuInvisible(Long menuId, Integer invisible) {
        String appId = JWTKit.getAppid();
        if (appId != null && !appId.isEmpty()) {
            return appResRelationMapper.updateInvisible(appId, menuId, invisible);
        }
        throw new BusinessException(400, "AppId is required");
    }

    @Override
    public Integer moveUp(Long menuId) {
        String appId = JWTKit.getAppid();
        if (appId == null || appId.isEmpty()) {
            throw new BusinessException(400, "AppId is required");
        }

        // 检查菜单是否存在
        Integer count = appResRelationMapper.countByAppIdAndResId(appId, menuId);
        if (count == null || count == 0) {
            throw new BusinessException(404, "Menu not found in app");
        }

        // 获取当前排序号
        Integer currentOrderNum = appResRelationMapper.getOrderNum(appId, menuId);

        // 向上移动：orderNum 减少（最小值为 0）
        Integer newOrderNum;
        if (currentOrderNum == null) {
            newOrderNum = 0;
        } else {
            newOrderNum = Math.max(0, currentOrderNum - 1);
        }
        appResRelationMapper.updateOrderNum(appId, menuId, newOrderNum);

        return newOrderNum;
    }

    @Override
    public Integer moveDown(Long menuId) {
        String appId = JWTKit.getAppid();
        if (appId == null || appId.isEmpty()) {
            throw new BusinessException(400, "AppId is required");
        }

        // 检查菜单是否存在
        Integer count = appResRelationMapper.countByAppIdAndResId(appId, menuId);
        if (count == null || count == 0) {
            throw new BusinessException(404, "Menu not found in app");
        }

        // 获取当前排序号
        Integer currentOrderNum = appResRelationMapper.getOrderNum(appId, menuId);

        // 向下移动：orderNum 增加，无最大值限制
        Integer newOrderNum = (currentOrderNum == null) ? 1 : currentOrderNum + 1;
        appResRelationMapper.updateOrderNum(appId, menuId, newOrderNum);

        return newOrderNum;
    }

}
