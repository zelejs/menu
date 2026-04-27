package com.jfeat.am.module.menu.services.gen.persistence.model;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import com.baomidou.mybatisplus.annotation.TableField;
import java.io.Serializable;
import java.util.Date;

/**
 * <p>
 * Application Resource Relation Entity
 * 应用资源关系实体类，支持应用级菜单层级
 * </p>
 *
 * @author code generator
 * @since 2024-04-01
 */
@TableName("t_app_res_relation")
public class AppResRelation implements Serializable {

    private static final long serialVersionUID = 1L;

    /**
     * 主键ID
     */
    @TableId(value = "id", type = IdType.AUTO)
    private Long id;

    /**
     * 应用ID
     */
    @TableField("app_id")
    private String appId;

    /**
     * 资源类型 (menu, permission, etc.)
     */
    @TableField("res_type")
    private String resType;

    /**
     * 资源ID
     */
    @TableField("res_id")
    private Long resId;

    /**
     * 应用级父菜单ID（仅当 res_type=menu 时有效）
     * 当此字段为NULL时，回退使用 t_sys_menu.pid
     */
    @TableField("pid")
    private Long pid;

    /**
     * 是否隐藏菜单（0=可见，1=不可见）
     */
    @TableField("invisible")
    private Integer invisible;

    /**
     * 创建时间
     */
    @TableField("create_time")
    private Date createTime;

    /**
     * 更新时间
     */
    @TableField("update_time")
    private Date updateTime;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getAppId() {
        return appId;
    }

    public void setAppId(String appId) {
        this.appId = appId;
    }

    public String getResType() {
        return resType;
    }

    public void setResType(String resType) {
        this.resType = resType;
    }

    public Long getResId() {
        return resId;
    }

    public void setResId(Long resId) {
        this.resId = resId;
    }

    public Long getPid() {
        return pid;
    }

    public void setPid(Long pid) {
        this.pid = pid;
    }

    public Integer getInvisible() {
        return invisible;
    }

    public void setInvisible(Integer invisible) {
        this.invisible = invisible;
    }

    public Date getCreateTime() {
        return createTime;
    }

    public void setCreateTime(Date createTime) {
        this.createTime = createTime;
    }

    public Date getUpdateTime() {
        return updateTime;
    }

    public void setUpdateTime(Date updateTime) {
        this.updateTime = updateTime;
    }

    @Override
    public String toString() {
        return "AppResRelation{" +
                "id=" + id +
                ", appId='" + appId + '\'' +
                ", resType='" + resType + '\'' +
                ", resId=" + resId +
                ", pid=" + pid +
                ", invisible=" + invisible +
                ", createTime=" + createTime +
                ", updateTime=" + updateTime +
                '}';
    }
}
