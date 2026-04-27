package com.jfeat.am.module.menu.util;

import com.jfeat.am.module.menu.services.gen.persistence.model.Menu;

import java.util.Date;

public class MenuUtil {
    public static Menu getInitMenu(){
        Menu menu = new Menu();
        menu.setUpdateTime(new Date());
        menu.setCreateTime(new Date());
        return menu;
    }

    public static Menu initMenu(Menu menu){
        menu.setUpdateTime(new Date());
        menu.setCreateTime(new Date());
        return menu;
    }

}
