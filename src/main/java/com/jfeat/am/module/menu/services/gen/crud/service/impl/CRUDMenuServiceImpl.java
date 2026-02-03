package com.jfeat.am.module.menu.services.gen.crud.service.impl;
// ServiceImpl start

            
import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.jfeat.crud.plus.FIELD;
import com.jfeat.am.module.menu.services.gen.persistence.model.Menu;
import com.jfeat.am.module.menu.services.gen.persistence.dao.MenuMapper;
import com.jfeat.am.module.menu.services.gen.crud.service.CRUDMenuService;
import org.springframework.stereotype.Service;
import com.jfeat.crud.base.exception.BusinessCode;
import com.jfeat.crud.base.exception.BusinessException;
import jakarta.annotation.Resource;
import com.jfeat.crud.plus.impl.CRUDServiceOnlyImpl;

/**
 * <p>
 *  implementation
 * </p>
 *CRUDMenuService
 * @author Code generator
 * @since 2021-03-13
 */

@Service
public class CRUDMenuServiceImpl  extends CRUDServiceOnlyImpl<Menu> implements CRUDMenuService {





        @Resource
        protected MenuMapper menuMapper;

        @Override
        protected BaseMapper<Menu> getMasterMapper() {
                return menuMapper;
        }







}


