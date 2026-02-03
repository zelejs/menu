package com.jfeat.am.module.menu.services.domain.service;

import com.alibaba.fastjson.JSONArray;
import com.alibaba.fastjson.JSONObject;
import com.jfeat.am.module.menu.services.gen.crud.model.MenuModel;
import com.jfeat.am.module.menu.services.gen.crud.service.CRUDMenuService;

import java.util.List;


public interface MenuCustomService extends CRUDMenuService {

    List<MenuModel> getMenuGroup(String status, String search);

    JSONArray getMenuJSON();
    JSONObject getMenuJSON(MenuModel menu);

    Integer alterStatus(Long id);
}