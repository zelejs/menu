package com.jfeat.am.module.menu.services.domain.service.impl;

import com.alibaba.fastjson.JSONArray;
import com.alibaba.fastjson.JSONObject;
import com.google.common.collect.Lists;
import com.jfeat.am.core.jwt.JWTKit;
import com.jfeat.am.module.menu.services.domain.dao.QueryMenuDao;
import com.jfeat.am.module.menu.services.domain.service.MenuCustomService;
import com.jfeat.am.module.menu.services.gen.crud.model.MenuModel;
import com.jfeat.am.module.menu.services.gen.crud.service.impl.CRUDMenuServiceImpl;
import com.jfeat.am.module.menu.tool.AppTools;
import org.apache.commons.lang3.StringUtils;
import org.springframework.stereotype.Service;

import jakarta.annotation.Resource;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * <p>
 * 服务实现类
 * </p>
 *
 * @author admin
 * @since 2017-10-16
 */

@Service("menuCustomService")
public class MenuCustomServiceImpl extends CRUDMenuServiceImpl implements MenuCustomService {

    @Resource
    QueryMenuDao queryMenuDao;

    @Resource
    AppTools appTools;

    //获取菜单信息 分组返回
    @Override
    public List<MenuModel> getMenuGroup(String status, String search) {
        //Long orgId = JWTKit.getTenantOrgId();
        if (!StringUtils.isEmpty(search)) {
            return queryMenuDao.searchMenu(search);
        } else {


            Long orgId = null;
            //获取一级菜单
            List<MenuModel> pMenu = queryMenuDao.getPMenu(orgId, status);
            List<MenuModel> oldMenu = pMenu;
            List<Long> pIds = pMenu.stream().map(i -> i.getId()).collect(Collectors.toList());

            while (pIds != null && pIds.size() > 0) {

                //获取子菜单
                List<MenuModel> sonMenu = queryMenuDao.getSonMenu(pIds, status);
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
        List<MenuModel> menuGroup = this.getMenuGroup("0", null);

        // added in 2023-12-13 增加appid过滤
        // 查询对应appid下的菜单id列表，从用户token中获取appid
        String appid = JWTKit.getAppid(JWTKit.getRequest());
        // 因为appid还没有适配所有的用户，所以如果没有appid的话就暂时不进行appid过滤
        ArrayList<Long> menuIds = appTools.getMenuIds(appid);
        /*
        首先第一个.filter()对menuGroup中的主菜单进行过滤，保留id匹配的主菜单
        .map()对子菜单过滤，保留id匹配的子菜单
        第二个.filter()过滤没有子菜单的主菜单，因为有的主菜单中的子菜单没有一项符合的，那么经过.map()就会出现没有子菜单的情况
         */
        if (!menuIds.isEmpty()) {
            menuGroup = menuGroup.stream()
                    .filter(menuModel -> menuIds.contains(menuModel.getId()))
                    .map(menuModel -> {
                        List<MenuModel> menuModelChildren = menuModel.getChildren().stream()
                                .filter(child -> menuIds.contains(child.getId()))
                                .collect(Collectors.toList());
                        menuModel.setChildren(menuModelChildren);
                        return menuModel;
                    })
                    .filter(menuModel -> menuModel.getChildren() != null && !menuModel.getChildren().isEmpty())
                    .collect(Collectors.toList());
        }

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

        String perm = menu.getPerm();
        if (!StringUtils.isEmpty(perm)) {
            menuJSON.put("permissions", perm);
        }

        return menuJSON;
    }


    void putBaseInfo(JSONObject menuJSON, MenuModel menu) {
        menuJSON.put("name", menu.getMenuName());
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
         * 2023-08-28 新增需求：增加返回entityName和pageId
         */
        menuJSON.put("entityName", menu.getEntityName());
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

}
