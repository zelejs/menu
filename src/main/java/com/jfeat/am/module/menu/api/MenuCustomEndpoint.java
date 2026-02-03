package com.jfeat.am.module.menu.api;


import com.alibaba.fastjson.JSON;
import com.alibaba.fastjson.JSONArray;
import com.alibaba.fastjson.JSONObject;
import com.jfeat.am.module.menu.services.domain.dao.QueryMenuDao;
import com.jfeat.am.module.menu.services.domain.model.MenuTest;
import com.jfeat.am.module.menu.services.domain.service.MenuCustomService;
import com.jfeat.am.module.menu.services.domain.service.MenuService;
import com.jfeat.am.module.menu.services.gen.crud.model.MenuModel;
import com.jfeat.crud.base.tips.SuccessTip;
import com.jfeat.crud.base.tips.Tip;
import io.swagger.annotations.Api;
import org.springframework.web.bind.annotation.*;
import jakarta.annotation.Resource;
import java.util.List;

/**
 * <p>
 * api
 * </p>
 *
 * @author Code generator
 * @since 2021-03-13
 */
@RestController

@Api("Menu")
@RequestMapping("/api/adm/menu/custom")
public class MenuCustomEndpoint {

    @Resource
    MenuService menuService;

    @Resource
    MenuCustomService menuCustomService;


    @Resource
    QueryMenuDao queryMenuDao;



    @GetMapping("/test")
    public Tip testMenu(){
        JSONArray testArray = new JSONArray();
        JSONObject jsonObject = JSON.parseObject(MenuTest.TEST_MENU_JSON);
        testArray.add(jsonObject);
        return SuccessTip.create(testArray);

    }
    //显示全部
    @GetMapping("/group")
    public Tip  getGroup( @RequestParam(name = "search", required = false) String search ){
        List<MenuModel> menuGroup = menuCustomService.getMenuGroup(null,search);
        return SuccessTip.create(menuGroup);
    };

/*    //所有未删除的
    @GetMapping("/json")
    public Tip getMenuJSON(){
        JSONArray menuJSON = menuCustomService.getMenuJSON();
        return SuccessTip.create(menuJSON);
    }*/

    //修改状态
    @PutMapping("/status/{id}")
    public Tip alterStatus(@PathVariable Long id){
        Integer integer = menuCustomService.alterStatus(id);
        return SuccessTip.create(integer);
    }




}
