package com.jfeat.am.module.menu.services.domain.dao;

import com.jfeat.am.module.menu.services.domain.model.MenuRecord;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.jfeat.crud.plus.QueryMasterDao;
import org.apache.ibatis.annotations.Param;
import com.jfeat.am.module.menu.services.gen.persistence.model.Menu;
import com.jfeat.am.module.menu.services.gen.crud.model.MenuModel;

import java.util.Date;
import java.util.List;

/**
 * Created by Code generator on 2021-03-13
 */
public interface QueryMenuDao extends QueryMasterDao<Menu> {
   /*
    * Query entity list by page
    */
    List<MenuRecord> findMenuPage(Page<MenuRecord> page, @Param("record") MenuRecord record,
                                            @Param("search") String search, @Param("orderBy") String orderBy,
                                            @Param("startTime") Date startTime, @Param("endTime") Date endTime);

    MenuRecord selectOne(@Param("id")Long id);
    /*
     * Query entity model for details
     */
    MenuModel queryMasterModel(@Param("id") Long id);

    List<MenuModel> getPMenu(@Param("orgId")Long orgId,@Param("status")String status);

    List<MenuModel> getSonMenu(@Param("ids")List<Long> ids,@Param("status")String status);

    String getPerm(@Param("id")Long id);

    Integer alterStatus(@Param("id")Long id);

    List<MenuModel> searchMenu(@Param("search")String search);

    String getComponentById(@Param("id") Long id);
}