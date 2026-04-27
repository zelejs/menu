SET FOREIGN_KEY_CHECKS=0;

-- ----------------------------
-- Table structure for t_app_res_relation
-- ----------------------------
DROP TABLE IF EXISTS `t_app_res_relation`;
CREATE TABLE `t_app_res_relation` (
  `id`             bigint(20)      NOT NULL AUTO_INCREMENT   COMMENT '主键ID',
  `app_id`         varchar(50)     NOT NULL                  COMMENT 'APP标识',
  `res_id`         bigint(20)      NOT NULL                  COMMENT '资源ID',
  `res_type`       varchar(20)     NOT NULL                  COMMENT '资源类型(menu/module/permission)',
  `pid`            bigint(20)      DEFAULT NULL              COMMENT '应用级父菜单ID',
  `invisible`      tinyint(1)      NOT NULL DEFAULT 0        COMMENT '是否隐藏菜单（0=可见，1=不可见）',
  `created_by`     varchar(64)     DEFAULT NULL              COMMENT '创建者',
  `created_at`     datetime        DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_by`     varchar(64)     DEFAULT ''                 COMMENT '更新者',
  `updated_at`     datetime        DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  KEY `idx_app_id` (`app_id`),
  KEY `idx_res_id` (`res_id`),
  KEY `idx_res_type` (`res_type`),
  KEY `idx_app_res` (`app_id`, `res_type`, `res_id`),
  KEY `idx_invisible` (`invisible`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='应用资源关系表';

SET FOREIGN_KEY_CHECKS=1;
