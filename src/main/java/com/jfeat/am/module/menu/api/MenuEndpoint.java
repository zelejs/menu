package com.jfeat.am.module.menu.api;


import com.jfeat.am.module.menu.services.gen.persistence.dao.MenuMapper;
import com.jfeat.am.module.menu.util.MenuUtil;
import com.jfeat.crud.plus.META;
import com.jfeat.am.core.jwt.JWTKit;
import io.swagger.annotations.Api;
import io.swagger.annotations.ApiImplicitParam;
import io.swagger.annotations.ApiImplicitParams;
import io.swagger.annotations.ApiOperation;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.bind.annotation.GetMapping;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.dao.DuplicateKeyException;
import com.jfeat.am.module.menu.services.domain.dao.QueryMenuDao;
import com.jfeat.crud.base.tips.SuccessTip;
import com.jfeat.crud.base.tips.Tip;
import com.jfeat.crud.base.annotation.BusinessLog;
import com.jfeat.crud.base.exception.BusinessCode;
import com.jfeat.crud.base.exception.BusinessException;
import com.jfeat.am.module.menu.api.permission.*;
import com.jfeat.am.common.annotation.Permission;


import com.jfeat.am.module.menu.services.domain.service.*;
import com.jfeat.am.module.menu.services.domain.model.MenuRecord;
import com.jfeat.am.module.menu.services.gen.persistence.model.Menu;

import org.springframework.web.bind.annotation.RestController;

import jakarta.annotation.Resource;
import java.util.Date;
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
@RequestMapping("/api/adm/menu/menus")
public class MenuEndpoint {

    protected static Logger logger = LoggerFactory.getLogger(MenuEndpoint.class);

    @Resource
    MenuService menuService;
    @Resource
    QueryMenuDao queryMenuDao;
    @Resource
    MenuMapper menuMapper;

    @BusinessLog(name = "菜单", value = "新建菜单")
    @Permission(MenuPermission.MENU_NEW)
    @PostMapping
    @ApiOperation(value = "新建 菜单", response = Menu.class)
    public Tip createMenu(@RequestBody Menu entity) {

        Integer affected = 0;
        try {
            MenuUtil.initMenu(entity);
            setPerm(entity);
            affected = menuMapper.insert(entity);

        } catch (DuplicateKeyException e) {
            throw new BusinessException(BusinessCode.DuplicateKey);
        }

        return SuccessTip.create(affected);
    }

    @Permission(MenuPermission.MENU_VIEW)
    @GetMapping("/{id}")
    @ApiOperation(value = "查看 菜单", response = Menu.class)
    public Tip getMenu(@PathVariable Long id) {
        MenuRecord menuRecord = queryMenuDao.selectOne(id);
        return SuccessTip.create(menuRecord);
    }

    @BusinessLog(name = "菜单", value = "更新 菜单")
    @Permission(MenuPermission.MENU_EDIT)
    @PutMapping("/{id}")
    @ApiOperation(value = "修改 菜单", response = Menu.class)
    public Tip updateMenu(@PathVariable Long id, @RequestBody Menu entity) {
        entity.setId(id);
        entity.setUpdateBy(JWTKit.getAccount());
        entity.setUpdateTime(new Date());
        setPerm(entity);
        return SuccessTip.create(menuMapper.updateById(entity));
    }

    @BusinessLog(name = "菜单", value = "删除 菜单")
    @Permission(MenuPermission.MENU_DELETE)
    @DeleteMapping("/{id}")
    @ApiOperation("删除 菜单")
    public Tip deleteMenu(@PathVariable Long id) {
        return SuccessTip.create(menuService.deleteMaster(id));
    }

    @Permission(MenuPermission.MENU_VIEW)
    @ApiOperation(value = "菜单 列表信息", response = MenuRecord.class)
    @GetMapping
    @ApiImplicitParams({
            @ApiImplicitParam(name = "pageNum", dataType = "Integer"),
            @ApiImplicitParam(name = "pageSize", dataType = "Integer"),
            @ApiImplicitParam(name = "search", dataType = "String"),
            @ApiImplicitParam(name = "id", dataType = "Long"),
            @ApiImplicitParam(name = "menuName", dataType = "String"),
            @ApiImplicitParam(name = "pid", dataType = "Long"),
            @ApiImplicitParam(name = "orderNum", dataType = "Integer"),
            @ApiImplicitParam(name = "path", dataType = "String"),
            @ApiImplicitParam(name = "component", dataType = "String"),
            @ApiImplicitParam(name = "isFrame", dataType = "Integer"),
            @ApiImplicitParam(name = "isCache", dataType = "Integer"),
            @ApiImplicitParam(name = "menuType", dataType = "String"),
            @ApiImplicitParam(name = "visible", dataType = "String"),
            @ApiImplicitParam(name = "status", dataType = "String"),
            @ApiImplicitParam(name = "permId", dataType = "Long"),
            @ApiImplicitParam(name = "icon", dataType = "String"),
            @ApiImplicitParam(name = "createBy", dataType = "String"),
            @ApiImplicitParam(name = "createTime", dataType = "Date"),
            @ApiImplicitParam(name = "updateBy", dataType = "String"),
            @ApiImplicitParam(name = "updateTime", dataType = "Date"),
            @ApiImplicitParam(name = "remark", dataType = "String"),
            @ApiImplicitParam(name = "orgId", dataType = "Long"),
            @ApiImplicitParam(name = "orderBy", dataType = "String"),
            @ApiImplicitParam(name = "sort", dataType = "String")
    })
    public Tip queryMenus(Page<MenuRecord> page,
                          @RequestParam(name = "pageNum", required = false, defaultValue = "1") Integer pageNum,
                          @RequestParam(name = "pageSize", required = false, defaultValue = "10") Integer pageSize,
                          @RequestParam(name = "search", required = false) String search,
                          @RequestParam(name = "id", required = false) Long id,
                          @RequestParam(name = "menuName", required = false) String menuName,
                          @RequestParam(name = "pid", required = false) Long pid,
                          @RequestParam(name = "orderNum", required = false) Integer orderNum,
                          @RequestParam(name = "path", required = false) String path,
                          @RequestParam(name = "component", required = false) String component,
                          @RequestParam(name = "isFrame", required = false) Integer isFrame,
                          @RequestParam(name = "isCache", required = false) Integer isCache,
                          @RequestParam(name = "menuType", required = false) String menuType,
                          @RequestParam(name = "visible", required = false) String visible,
                          @RequestParam(name = "status", required = false) String status,
                          @RequestParam(name = "permId", required = false) Long permId,
                          @RequestParam(name = "icon", required = false) String icon,
                          @RequestParam(name = "createBy", required = false) String createBy,
                          @DateTimeFormat(pattern = "yyyy-MM-dd HH:mm:ss")
                          @RequestParam(name = "createTime", required = false) Date createTime,
                          @RequestParam(name = "updateBy", required = false) String updateBy,
                          @DateTimeFormat(pattern = "yyyy-MM-dd HH:mm:ss")
                          @RequestParam(name = "updateTime", required = false) Date updateTime,
                          @RequestParam(name = "remark", required = false) String remark,
                          @RequestParam(name = "orgId", required = false) Long orgId,
                          @RequestParam(name = "orderBy", required = false) String orderBy,
                          @RequestParam(name = "sort", required = false) String sort) {

        if (orderBy != null && orderBy.length() > 0) {
            if (sort != null && sort.length() > 0) {
                String pattern = "(ASC|DESC|asc|desc)";
                if (!sort.matches(pattern)) {
                    throw new BusinessException(BusinessCode.BadRequest.getCode(), "sort must be ASC or DESC");//此处异常类型根据实际情况而定
                }
            } else {
                sort = "ASC";
            }
            orderBy = "`" + orderBy + "`" + " " + sort;
        }
        page.setCurrent(pageNum);
        page.setSize(pageSize);

        MenuRecord record = new MenuRecord();
        record.setId(id);
        record.setMenuName(menuName);
        record.setPid(pid);
        record.setOrderNum(orderNum);
        record.setPath(path);
        record.setComponent(component);
        record.setIsFrame(isFrame);
        record.setIsCache(isCache);
        record.setMenuType(menuType);
        record.setVisible(visible);
        record.setStatus(status);
        record.setPermId(permId);
        record.setIcon(icon);
        record.setCreateBy(createBy);
        record.setCreateTime(createTime);
        record.setUpdateBy(updateBy);
        record.setUpdateTime(updateTime);
        record.setRemark(remark);
        if (META.enabledSaas()) {
            record.setOrgId(JWTKit.getOrgId());
        }


        List<MenuRecord> menuPage = queryMenuDao.findMenuPage(page, record, search, orderBy, null, null);

        page.setRecords(menuPage);

        return SuccessTip.create(page);
    }

    //设置权限
    public void setPerm(Menu entity ){
        logger.info("-----permId :{}----",entity.getPermId());
        if(entity.getPermId()!=null){
            String perm = queryMenuDao.getPerm(entity.getPermId());
            entity.setPerm(perm);
        }else{
            entity.setPerm(null);
        }
    }

}
