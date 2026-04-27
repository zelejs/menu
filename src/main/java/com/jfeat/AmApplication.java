package com.jfeat;

import com.jfeat.am.core.jwt.JWTKit;
import org.mybatis.spring.annotation.MapperScan;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

@SpringBootApplication
@MapperScan({
    "com.jfeat.am.module.menu.services.gen.persistence.dao",
    "com.jfeat.am.module.menu.services.domain.dao",
    "com.jfeat.crud.plus.service.dao"
})
public class AmApplication {
    protected final static Logger logger = LoggerFactory.getLogger(AmApplication.class);

    public static void main(String[] args) {
        SpringApplication.run(AmApplication.class, args);
        logger.info("Application run success!");
    }

    /**
     * 测试用：设置默认的 appId
     * 在实际生产环境中，appId 应该从 JWT token 中获取
     */
    @Bean
    public ApplicationRunner setTestAppid() {
        return new ApplicationRunner() {
            @Override
            public void run(ApplicationArguments args) throws Exception {
                // 设置测试用的 appId，用于测试 t_app_res_relation 关联过滤
                JWTKit.setAuthenticationAppid("mdm");
                logger.info("Set test appId: mdm");
            }
        };
    }

}