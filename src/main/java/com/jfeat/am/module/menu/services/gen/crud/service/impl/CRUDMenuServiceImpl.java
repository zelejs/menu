package com.jfeat.am.module.menu.services.gen.crud.service.impl;
// ServiceImpl start

            
import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.jfeat.am.module.menu.services.gen.persistence.model.Menu;
import com.jfeat.am.module.menu.services.gen.persistence.dao.MenuMapper;
import com.jfeat.am.module.menu.services.gen.crud.service.CRUDMenuService;
import org.springframework.stereotype.Service;
import com.xinzhi.plat.common.exception.BusinessException;
import jakarta.annotation.Resource;

/**
 * <p>
 *  implementation
 * </p>
 *CRUDMenuService
 * @author Code generator
 * @since 2021-03-13
 */

@Service
public class CRUDMenuServiceImpl  implements CRUDMenuService {





        @Resource
        protected MenuMapper menuMapper;

        protected BaseMapper<Menu> getMasterMapper() {
                return menuMapper;
        }







}


