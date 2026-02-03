package com.jfeat.am.module.menu.services.gen.persistence.model;

import com.baomidou.mybatisplus.annotation.TableName;
import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.extension.activerecord.Model;
import java.util.Date;
import com.baomidou.mybatisplus.annotation.TableId;
import java.io.Serializable;

/**
 * <p>
 * 
 * </p>
 *
 * @author Code generator
 * @since 2021-03-13
 */
@TableName("t_sys_menu")
public class Menu extends Model<Menu> {

    private static final long serialVersionUID=1L;

      /**
     * 菜单ID
     */
      @TableId(value = "id", type = IdType.AUTO)
      private Long id;

      /**
     * 菜单名
     */
      private String menuName;

      /**
     * 父类id
     */
      private Long pid;

      /**
     * 鏄剧ず椤哄簭
     */
      private Integer orderNum;

      /**
     * 璺敱鍦板潃
     */
      private String path;

      /**
     * 缁勪欢璺緞
     */
      private String component;

      /**
     * 鏄惁涓哄閾撅紙0鏄� 1鍚︼級
     */
      private Integer isFrame;

      /**
     * 鏄惁缂撳瓨锛�0缂撳瓨 1涓嶇紦瀛橈級
     */
      private Integer isCache;

      /**
     * 鑿滃崟绫诲瀷锛圡鐩綍 C鑿滃崟 F鎸夐挳锛�
     */
      private String menuType;

      /**
     * 鑿滃崟鐘舵�侊紙0鏄剧ず 1闅愯棌锛�
     */
      private String visible;

      /**
     * 鑿滃崟鐘舵�侊紙0姝ｅ父 1鍋滅敤锛�
     */
      private String status;

      /**
     * 鏉冮檺id
     */
      private Long permId;

      //权限
      private String perm;

      /**
     * 鑿滃崟鍥炬爣
     */
      private String icon;

      /**
     * 鍒涘缓鑰�
     */
      private String createBy;

      /**
     * 鍒涘缓鏃堕棿
     */
      private Date createTime;

      /**
     * 鏇存柊鑰�
     */
      private String updateBy;

      /**
     * 鏇存柊鏃堕棿
     */
      private Date updateTime;

      /**
     * 澶囨敞
     */
      private String remark;

      /**
     * 闅旂鏍囪瘑
     */
      private Long orgId;

    /*
     * 2023-08-28 增加新需求：要求菜单模块返回entityName和pageId
     */
    private String entityName;
    private Long pageId;

    public String getEntityName() {
        return entityName;
    }

    public void setEntityName(String entityName) {
        this.entityName = entityName;
    }

    public Long getPageId() {
        return pageId;
    }

    public void setPageId(Long pageId) {
        this.pageId = pageId;
    }

    public String getPerm() {
        return perm;
    }

    public void setPerm(String perm) {
        this.perm = perm;
    }

    public Long getId() {
        return id;
    }

      public Menu setId(Long id) {
          this.id = id;
          return this;
      }
    
    public String getMenuName() {
        return menuName;
    }

      public Menu setMenuName(String menuName) {
          this.menuName = menuName;
          return this;
      }



    public Integer getOrderNum() {
        return orderNum;
    }

      public Menu setOrderNum(Integer orderNum) {
          this.orderNum = orderNum;
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
    
    public String getMenuType() {
        return menuType;
    }

      public Menu setMenuType(String menuType) {
          this.menuType = menuType;
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
    
    public Long getPermId() {
        return permId;
    }

      public Menu setPermId(Long permId) {
          this.permId = permId;
          return this;
      }
    
    public String getIcon() {
        return icon;
    }

      public Menu setIcon(String icon) {
          this.icon = icon;
          return this;
      }
    
    public String getCreateBy() {
        return createBy;
    }

      public Menu setCreateBy(String createBy) {
          this.createBy = createBy;
          return this;
      }
    
    public Date getCreateTime() {
        return createTime;
    }

      public Menu setCreateTime(Date createTime) {
          this.createTime = createTime;
          return this;
      }
    
    public String getUpdateBy() {
        return updateBy;
    }

      public Menu setUpdateBy(String updateBy) {
          this.updateBy = updateBy;
          return this;
      }
    
    public Date getUpdateTime() {
        return updateTime;
    }

      public Menu setUpdateTime(Date updateTime) {
          this.updateTime = updateTime;
          return this;
      }
    
    public String getRemark() {
        return remark;
    }

      public Menu setRemark(String remark) {
          this.remark = remark;
          return this;
      }
    
    public Long getOrgId() {
        return orgId;
    }

      public Menu setOrgId(Long orgId) {
          this.orgId = orgId;
          return this;
      }

    public Long getPid() {
        return pid;
    }

    public void setPid(Long pid) {
        this.pid = pid;
    }

    public static final String ID = "id";

      public static final String MENU_NAME = "menu_name";

      public static final String PARENT_ID = "parent_id";

      public static final String ORDER_NUM = "order_num";

      public static final String PATH = "path";

      public static final String COMPONENT = "component";

      public static final String IS_FRAME = "is_frame";

      public static final String IS_CACHE = "is_cache";

      public static final String MENU_TYPE = "menu_type";

      public static final String VISIBLE = "visible";

      public static final String STATUS = "status";

      public static final String PERM_ID = "perm_id";

      public static final String ICON = "icon";

      public static final String CREATE_BY = "create_by";

      public static final String CREATE_TIME = "create_time";

      public static final String UPDATE_BY = "update_by";

      public static final String UPDATE_TIME = "update_time";

      public static final String REMARK = "remark";

      public static final String ORG_ID = "org_id";

      @Override
    public Serializable pkVal() {
          return this.id;
      }




    @Override
    public String toString() {
        return "Menu{" +
              "id=" + id +
                  ", menuName=" + menuName +
                  ", orderNum=" + orderNum +
                  ", path=" + path +
                  ", component=" + component +
                  ", isFrame=" + isFrame +
                  ", isCache=" + isCache +
                  ", menuType=" + menuType +
                  ", visible=" + visible +
                  ", status=" + status +
                  ", permId=" + permId +
                  ", icon=" + icon +
                  ", createBy=" + createBy +
                  ", createTime=" + createTime +
                  ", updateBy=" + updateBy +
                  ", updateTime=" + updateTime +
                  ", remark=" + remark +
                  ", orgId=" + orgId +
              "}";
    }
}
