package com.jfeat.am.module.menu.services.domain.filter;

import com.jfeat.am.module.menu.services.gen.persistence.model.Menu;


/**
 * Created by Code generator on 2021-03-13
 */
public class MenuFilter {

    private String[] ignoreFields = new String[]{};
    private String[] updateIgnoreFields = new String[]{};

    public void filter(Menu entity, boolean insertOrUpdate) {

        //if insertOrUpdate is true,means for insert, do this
        if (insertOrUpdate){

            //then insertOrUpdate is false,means for update,do this
        }else {

        }

    }

    public String[] ignore(boolean retrieveOrUpdate) {
        //if retrieveOrUpdate is true,means for retrieve ,do this
        if (retrieveOrUpdate){
            return ignoreFields;
            //then retrieveOrUpdate  if false ,means for update,do this
        }else {
            return updateIgnoreFields;
        }
    }
}
