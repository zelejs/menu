package com.jfeat.am.module.menu.services.domain.dao;

import org.apache.ibatis.annotations.Param;

import java.util.ArrayList;
import java.util.List;

/**
 * @description: TODO
 * @project: uaas
 * @date: 2023/12/14 15:36
 * @author: hhhhhtao
 */
public interface AppResRelationMapper {

    /**
     * 获取菜单id列表，根据appid
     *
     * @param appid appid
     * @return appid = ${appid} 的菜单列表
     */
    ArrayList<Long> getMenuIds(@Param("appid") String appid);

    /**
     * 删除指定应用和资源的关联关系
     *
     * @param appid 应用ID
     * @param resId 资源ID
     * @return 删除的记录数
     */
    Integer deleteByAppIdAndResId(@Param("appid") String appid, @Param("resId") Long resId);

    /**
     * 批量删除应用和资源的关联关系
     *
     * @param appid  应用ID
     * @param resIds 资源ID列表
     * @return 删除的记录数
     */
    Integer deleteByAppIdAndResIds(@Param("appid") String appid, @Param("resIds") List<Long> resIds);

    /**
     * 统计指定应用和资源的关联数量
     *
     * @param appid 应用ID
     * @param resId 资源ID
     * @return 关联数量
     */
    Integer countByAppIdAndResId(@Param("appid") String appid, @Param("resId") Long resId);

    /**
     * 更新应用级菜单父ID
     *
     * @param appid 应用ID
     * @param resId 菜单资源ID
     * @param pid 新的父菜单ID（可为null，表示提升为顶级菜单）
     * @return 更新的记录数
     */
    Integer updatePid(@Param("appid") String appid, @Param("resId") Long resId, @Param("pid") Long pid);

    /**
     * 获取应用级菜单父ID
     *
     * @param appid 应用ID
     * @param resId 菜单资源ID
     * @return 父菜单ID，如果不存在则返回null
     */
    Long getPid(@Param("appid") String appid, @Param("resId") Long resId);

    /**
     * 批量更新应用级菜单父ID
     *
     * @param appid 应用ID
     * @param resIds 菜单资源ID列表
     * @param pid 新的父菜单ID（可为null，表示提升为顶级菜单）
     * @return 更新的记录数
     */
    Integer batchUpdatePid(@Param("appid") String appid, @Param("resIds") List<Long> resIds, @Param("pid") Long pid);

    /**
     * 插入应用资源关联记录
     *
     * @param appId 应用ID
     * @param resType 资源类型（如 'menu'）
     * @param resId 资源ID
     * @param pid 父菜单ID（可为null）
     * @return 插入的记录数
     */
    Integer insertAppResRelation(@Param("appId") String appId, @Param("resType") String resType, @Param("resId") Long resId, @Param("pid") Long pid);

    /**
     * 更新菜单的不可见状态
     *
     * @param appid 应用ID
     * @param resId 资源ID
     * @param invisible 不可见状态（0=可见，1=不可见）
     * @return 更新的记录数
     */
    Integer updateInvisible(@Param("appid") String appid, @Param("resId") Long resId, @Param("invisible") Integer invisible);

    /**
     * 获取应用菜单的当前排序号
     *
     * @param appid 应用ID
     * @param resId 资源ID
     * @return 当前排序号，如果不存在则返回null
     */
    Integer getOrderNum(@Param("appid") String appid, @Param("resId") Long resId);

    /**
     * 更新应用菜单的排序号
     *
     * @param appid 应用ID
     * @param resId 资源ID
     * @param orderNum 新的排序号
     * @return 更新的记录数
     */
    Integer updateOrderNum(@Param("appid") String appid, @Param("resId") Long resId, @Param("orderNum") Integer orderNum);
}
