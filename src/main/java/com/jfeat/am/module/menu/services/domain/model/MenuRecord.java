package com.jfeat.am.module.menu.services.domain.model;

import com.jfeat.am.module.menu.services.gen.persistence.model.Menu;

/**
 * Created by Code generator on 2021-03-13
 */
public class MenuRecord extends Menu{
    private String pName;
    private String appId;
    private Integer invisible;

    public String getpName() {
        return pName;
    }

    public void setpName(String pName) {
        this.pName = pName;
    }

    public String getAppId() {
        return appId;
    }

    public void setAppId(String appId) {
        this.appId = appId;
    }

    public Integer getInvisible() {
        return invisible;
    }

    public void setInvisible(Integer invisible) {
        this.invisible = invisible;
    }
}
