package com.jfeat.am.module.menu.services.gen.persistence.model;

import com.baomidou.mybatisplus.annotation.TableName;
import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.extension.activerecord.Model;
import java.util.Date;
import com.baomidou.mybatisplus.annotation.TableId;
import java.io.Serializable;

/**
 * <p>
 * 菜单实体
 * </p>
 *
 * @author Code generator
 * @since 2021-03-13
 */
@TableName("t_sys_menu")
public class Menu extends Model<Menu> {

    private static final long serialVersionUID = 1L;

    /**
     * 菜单ID
     */
    @TableId(value = "id", type = IdType.AUTO)
    private Long id;

    /**
     * 父菜单ID
     */
    private Long pid;

    /**
     * 路由标题
     */
    private String name;

    /**
     * 路由地址
     */
    private String path;

    /**
     * 组件路径
     */
    private String component;

    /**
     * 路由跳转
     */
    private String redirect;

    /**
     * 路由包装组件
     */
    private String wrappers;

    /**
     * 菜单图标
     */
    private String icon;

    /**
     * 创建时间
     */
    private Date createTime;

    /**
     * 更新时间
     */
    private Date updateTime;

    /**
     * 菜单配置文件
     */
    private String menuConfig;

    /**
     * 隐藏菜单
     */
    private Integer hideInMenu;

    /**
     * 权限ID
     */
    private Long permId;

    /**
     * 显示顺序
     */
    private Integer orderNum;

    /**
     * 菜单类型（C=目录 M=菜单 F=按钮）
     */
    private String menuType;

    /**
     * 是否外链（0否 1是）
     */
    private Integer isFrame;

    /**
     * 是否缓存（0缓存 1不缓存）
     */
    private Integer isCache;

    /**
     * 显示状态（0显示 1隐藏）
     */
    private String visible;

    /**
     * 菜单状态（0正常 1停用）
     */
    private String status;

    /*
     * 2023-08-28 增加新需求：要求菜单模块返回pageId
     */
    private Long pageId;

    /**
     * 删除标记（0未删除 1已删除）
     */
    private Integer deleteFlag;

    public Long getPageId() {
        return pageId;
    }

    public void setPageId(Long pageId) {
        this.pageId = pageId;
    }

    public Integer getDeleteFlag() {
        return deleteFlag;
    }

    public void setDeleteFlag(Integer deleteFlag) {
        this.deleteFlag = deleteFlag;
    }

    public Long getId() {
        return id;
    }

    public Menu setId(Long id) {
        this.id = id;
        return this;
    }

    public Long getPid() {
        return pid;
    }

    public Menu setPid(Long pid) {
        this.pid = pid;
        return this;
    }

    public String getName() {
        return name;
    }

    public Menu setName(String name) {
        this.name = name;
        return this;
    }

    public String getPath() {
        return path;
    }

    public Menu setPath(String path) {
        this.path = path;
        return this;
    }

    public String getComponent() {
        return component;
    }

    public Menu setComponent(String component) {
        this.component = component;
        return this;
    }

    public String getRedirect() {
        return redirect;
    }

    public Menu setRedirect(String redirect) {
        this.redirect = redirect;
        return this;
    }

    public String getWrappers() {
        return wrappers;
    }

    public Menu setWrappers(String wrappers) {
        this.wrappers = wrappers;
        return this;
    }

    public String getIcon() {
        return icon;
    }

    public Menu setIcon(String icon) {
        this.icon = icon;
        return this;
    }

    public Date getCreateTime() {
        return createTime;
    }

    public Menu setCreateTime(Date createTime) {
        this.createTime = createTime;
        return this;
    }

    public Date getUpdateTime() {
        return updateTime;
    }

    public Menu setUpdateTime(Date updateTime) {
        this.updateTime = updateTime;
        return this;
    }

    public String getMenuConfig() {
        return menuConfig;
    }

    public Menu setMenuConfig(String menuConfig) {
        this.menuConfig = menuConfig;
        return this;
    }

    public Integer getHideInMenu() {
        return hideInMenu;
    }

    public Menu setHideInMenu(Integer hideInMenu) {
        this.hideInMenu = hideInMenu;
        return this;
    }

    public Long getPermId() {
        return permId;
    }

    public Menu setPermId(Long permId) {
        this.permId = permId;
        return this;
    }

    public Integer getOrderNum() {
        return orderNum;
    }

    public Menu setOrderNum(Integer orderNum) {
        this.orderNum = orderNum;
        return this;
    }

    public String getMenuType() {
        return menuType;
    }

    public Menu setMenuType(String menuType) {
        this.menuType = menuType;
        return this;
    }

    public Integer getIsFrame() {
        return isFrame;
    }

    public Menu setIsFrame(Integer isFrame) {
        this.isFrame = isFrame;
        return this;
    }

    public Integer getIsCache() {
        return isCache;
    }

    public Menu setIsCache(Integer isCache) {
        this.isCache = isCache;
        return this;
    }

    public String getVisible() {
        return visible;
    }

    public Menu setVisible(String visible) {
        this.visible = visible;
        return this;
    }

    public String getStatus() {
        return status;
    }

    public Menu setStatus(String status) {
        this.status = status;
        return this;
    }

    public static final String ID = "id";
    public static final String PID = "pid";
    public static final String NAME = "name";
    public static final String PATH = "path";
    public static final String COMPONENT = "component";
    public static final String REDIRECT = "redirect";
    public static final String WRAPPERS = "wrappers";
    public static final String ICON = "icon";
    public static final String CREATE_TIME = "create_time";
    public static final String UPDATE_TIME = "update_time";
    public static final String MENU_CONFIG = "menu_config";
    public static final String HIDE_IN_MENU = "hide_in_menu";
    public static final String PERM_ID = "perm_id";
    public static final String ORDER_NUM = "order_num";
    public static final String MENU_TYPE = "menu_type";
    public static final String IS_FRAME = "is_frame";
    public static final String IS_CACHE = "is_cache";
    public static final String VISIBLE = "visible";
    public static final String STATUS = "status";
    public static final String DELETE_FLAG = "delete_flag";

    @Override
    public Serializable pkVal() {
        return this.id;
    }

    @Override
    public String toString() {
        return "Menu{" +
                "id=" + id +
                ", pid=" + pid +
                ", name=" + name +
                ", path=" + path +
                ", component=" + component +
                ", redirect=" + redirect +
                ", wrappers=" + wrappers +
                ", icon=" + icon +
                ", createTime=" + createTime +
                ", updateTime=" + updateTime +
                ", menuConfig=" + menuConfig +
                ", hideInMenu=" + hideInMenu +
                ", permId=" + permId +
                ", orderNum=" + orderNum +
                ", menuType=" + menuType +
                ", isFrame=" + isFrame +
                ", isCache=" + isCache +
                ", visible=" + visible +
                ", status=" + status +
                ", pageId=" + pageId +
                ", deleteFlag=" + deleteFlag +
                '}';
    }
}
