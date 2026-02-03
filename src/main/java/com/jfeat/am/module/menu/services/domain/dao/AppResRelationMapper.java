package com.jfeat.am.module.menu.services.domain.dao;

import org.apache.ibatis.annotations.Param;

import java.util.ArrayList;

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
}
