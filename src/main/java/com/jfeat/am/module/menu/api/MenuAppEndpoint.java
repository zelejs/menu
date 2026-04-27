package com.jfeat.am.module.menu.api;


import com.alibaba.fastjson2.JSONArray;
import com.alibaba.fastjson2.JSONObject;
import com.jfeat.am.module.menu.services.domain.dao.QueryMenuDao;
import com.jfeat.am.module.menu.services.domain.service.MenuAppService;
import com.jfeat.am.module.menu.services.domain.service.MenuService;
import com.jfeat.am.module.menu.services.gen.crud.model.MenuModel;
import com.xinzhi.plat.common.exception.BusinessException;
import com.xinzhi.plat.common.result.ApiResult;
import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;
import io.swagger.annotations.ApiParam;
import org.springframework.web.bind.annotation.*;
import jakarta.annotation.Resource;
import java.util.List;
import java.util.Map;

/**
 * <p>
 * 应用菜单API端点
 * </p>
 *
 * @author Code generator
 * @since 2021-03-13
 */
@RestController

@Api(value = "MenuApp", description = "应用菜单管理API - 提供菜单树形结构查询")
@RequestMapping("/api/adm/menu/app")
public class MenuAppEndpoint {

    @Resource
    MenuService menuService;

    @Resource
    MenuAppService menuAppService;


    @Resource
    QueryMenuDao queryMenuDao;

    /**
     * 获取菜单分组
     * @param search 搜索关键词（可选）
     * @return 菜单树列表
     */
    @ApiOperation(value = "获取菜单分组", notes = "显示全部菜单树形结构，支持搜索")
    @GetMapping("/group")
    public ApiResult<List<MenuModel>> getGroup(@ApiParam(value = "搜索关键词") @RequestParam(name = "search", required = false) String search ){
        List<MenuModel> menuGroup = menuAppService.getMenuGroup(null,search);
        return ApiResult.success(menuGroup);
    };

/*    //所有未删除的
    @GetMapping("/json")
    public Tip getMenuJSON(){
        JSONArray menuJSON = menuAppService.getMenuJSON();
        return SuccessTip.create(menuJSON);
    }*/

    /**
     * 修改菜单状态
     * @param id 菜单ID
     * @return 修改结果
     * @deprecated 已弃用，不应配置此接口
     */
    @Deprecated
    @ApiOperation(value = "修改菜单状态", notes = "切换菜单的启用/禁用状态 (已弃用)")
    @PutMapping("/status/{id}")
    public ApiResult<Integer> alterStatus(@ApiParam(value = "菜单ID", required = true) @PathVariable Long id){
        Integer integer = menuAppService.alterStatus(id);
        return ApiResult.success(integer);
    }

    /**
     * 获取所有菜单分组（包括不可见）
     */
    @ApiOperation(value = "获取所有菜单分组（包括不可见）", notes = "显示全部菜单树形结构，包括隐藏的菜单")
    @GetMapping("/menus")
    public ApiResult<List<MenuModel>> getAllMenus(
        @ApiParam(value = "搜索关键词") @RequestParam(name = "search", required = false) String search) {
        List<MenuModel> menuGroup = menuAppService.getAllMenuGroup(null, search);
        return ApiResult.success(menuGroup);
    }

    /**
     * 设置菜单不可见状态
     * 请求体 {"value": 0} 或不传（默认为1）
     */
    @ApiOperation(value = "设置菜单不可见状态", notes = "0=可见，1=不可见，默认为1")
    @PostMapping("/menus/{id}/op/invisible")
    public ApiResult<Integer> setMenuInvisible(
        @ApiParam(value = "菜单ID", required = true) @PathVariable Long id,
        @RequestBody(required = false) Map<String, Integer> body) {
        Integer value = (body != null && body.containsKey("value")) ? body.get("value") : 1;
        if (value != 0 && value != 1) {
            throw new BusinessException(400, "Value must be 0 or 1");
        }
        return ApiResult.success(menuAppService.updateMenuInvisible(id, value));
    }

    /**
     * 向上移动菜单（排序号-1，最小值为0）
     */
    @ApiOperation(value = "向上移动菜单", notes = "将菜单的排序号减少1，最小值为0")
    @PostMapping("/menus/{id}/op/moveup")
    public ApiResult<Integer> moveUp(
        @ApiParam(value = "菜单ID", required = true) @PathVariable Long id) {
        Integer newOrderNum = menuAppService.moveUp(id);
        return ApiResult.success(newOrderNum);
    }

    /**
     * 向下移动菜单（排序号+1）
     */
    @ApiOperation(value = "向下移动菜单", notes = "将菜单的排序号增加1，无最大值限制")
    @PostMapping("/menus/{id}/op/movedown")
    public ApiResult<Integer> moveDown(
        @ApiParam(value = "菜单ID", required = true) @PathVariable Long id) {
        Integer newOrderNum = menuAppService.moveDown(id);
        return ApiResult.success(newOrderNum);
    }




}
