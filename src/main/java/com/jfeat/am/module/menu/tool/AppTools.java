package com.jfeat.am.module.menu.tool;

import com.jfeat.am.module.menu.services.domain.dao.AppResRelationMapper;
import org.springframework.stereotype.Component;

import jakarta.annotation.Resource;
import java.util.ArrayList;

/**
 * @description: TODO
 * @project: uaas
 * @date: 2023/12/14 15:35
 * @author: hhhhhtao
 */
@Component
public class AppTools {

    @Resource
    AppResRelationMapper appResRelationMapper;

    /**
     * 获取菜单id列表，根据appid过滤
     *
     * @param appid
     * @return 对应appid的菜单列表
     */
    public ArrayList<Long> getMenuIds(String appid) {
        return appResRelationMapper.getMenuIds(appid);
    }
}
