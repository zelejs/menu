package com.jfeat.am.module.menu.services.domain.service;

import com.alibaba.fastjson2.JSONArray;
import com.alibaba.fastjson2.JSONObject;
import com.jfeat.am.module.menu.services.gen.crud.model.MenuModel;
import com.jfeat.am.module.menu.services.gen.crud.service.CRUDMenuService;

import java.util.List;


public interface MenuAppService extends CRUDMenuService {

    List<MenuModel> getMenuGroup(String status, String search);

    JSONArray getMenuJSON();
    JSONObject getMenuJSON(MenuModel menu);

    Integer alterStatus(Long id);

    /**
     * 获取所有菜单分组（包括不可见）
     *
     * @param status 状态筛选
     * @param search 搜索关键词
     * @return 菜单树列表
     */
    List<MenuModel> getAllMenuGroup(String status, String search);

    /**
     * 更新菜单的不可见状态
     *
     * @param menuId 菜单ID
     * @param invisible 不可见状态（0=可见，1=不可见）
     * @return 更新的记录数
     */
    Integer updateMenuInvisible(Long menuId, Integer invisible);

    /**
     * 向上移动菜单（排序号+1）
     *
     * @param menuId 菜单ID
     * @return 新的排序号
     */
    Integer moveUp(Long menuId);

    /**
     * 向下移动菜单（排序号-1，最小值为0）
     *
     * @param menuId 菜单ID
     * @return 新的排序号
     */
    Integer moveDown(Long menuId);

    /**
     * 移动菜单到指定父菜单（应用级别，更新 t_app_res_relation.pid）
     *
     * @param menuId 菜单ID
     * @param pid 目标父菜单ID（null 表示移到顶层）
     * @return 更新的记录数
     */
    Integer moveMenu(Long menuId, Long pid);
}
