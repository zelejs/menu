package com.jfeat.am.module.menu.services.gen.crud.model;
// this is serviceModel.java.vm
import com.jfeat.am.module.menu.services.gen.persistence.model.Menu;

import java.util.List;

/**
 * Created by Code generator on 2021-03-13
 *  * slaves.size() : 0
 *  * modelpack : $modelpack
 */
public class MenuModel extends Menu{

    private List<MenuModel> children;

    public List<MenuModel> getChildren() {
        return children;
    }

    public void setChildren(List<MenuModel> children) {
        this.children = children;
    }
}
