package com.jfeat.am.module.menu.services.domain.service;

import com.jfeat.am.module.menu.services.gen.crud.service.CRUDMenuService;

/**
 * Created by vincent on 2017/10/19.
 */
public interface MenuService extends CRUDMenuService {

    /**
     * 删除菜单（带 app 过滤）
     * 如果菜单被其他 app 引用，只删除当前 app 的关联
     * 如果菜单不被任何 app 引用，删除菜单记录
     *
     * @param id 菜单ID
     * @return 删除的记录数
     */
    Integer deleteMenuWithAppFilter(Long id);

    /**
     * 移动菜单到指定父菜单
     *
     * @param id 菜单ID
     * @param pid 父菜单ID (null 表示移到顶层)
     * @return 更新的记录数
     */
    Integer moveMenu(Long id, Long pid);

    /**
     * 将菜单提升为顶级菜单
     * 设置 menu_type='C' 和 pid=null
     *
     * @param id 菜单ID
     * @return 更新的记录数
     */
    Integer promoteMenuToTop(Long id);

    /**
     * 递归删除菜单及其所有子菜单
     *
     * @param id 菜单ID
     * @return 删除的记录数
     */
    Integer deleteMenuRecursive(Long id);
}