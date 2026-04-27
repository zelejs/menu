
SET FOREIGN_KEY_CHECKS=0;

-- -------------------------------------------------
-- Table structure for t_sys_menu
-- -------------------------------------------------
DROP TABLE IF EXISTS `t_sys_menu`;
CREATE TABLE `t_sys_menu` (
  `id`              bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '菜单ID',
  `pid`             bigint(20) UNSIGNED DEFAULT NULL COMMENT '父菜单ID',
  `name`            varchar(255) NOT NULL COMMENT '路由标题',
  `path`            varchar(255) NOT NULL COMMENT '路由地址',
  `component`       varchar(255) NOT NULL DEFAULT '' COMMENT '组件路径',
  `redirect`        varchar(255) NOT NULL DEFAULT '' COMMENT '路由跳转',
  `wrappers`        varchar(255) NOT NULL DEFAULT '' COMMENT '路由包装组件',
  `icon`            varchar(255) NOT NULL DEFAULT '' COMMENT '菜单图标',
  `create_time`     datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time`     datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `menu_config`     text DEFAULT NULL COMMENT '菜单配置文件',
  `hide_in_menu`    tinyint(3) UNSIGNED NOT NULL DEFAULT 0 COMMENT '隐藏菜单',
  `perm_id`         bigint(20) DEFAULT NULL COMMENT '权限ID',
  `menu_type`       char(1) DEFAULT 'M' COMMENT '菜单类型（C=目录 M=菜单 F=按钮）',
  `order_num`       int(11) DEFAULT 0 COMMENT '显示顺序',
  `is_frame`        tinyint(4) DEFAULT 0 COMMENT '是否外链（0否 1是）',
  `is_cache`        tinyint(4) DEFAULT 0 COMMENT '是否缓存（0缓存 1不缓存）',
  `visible`         char(1) DEFAULT '0' COMMENT '显示状态（0显示 1隐藏）',
  `status`          char(1) DEFAULT '0' COMMENT '菜单状态（0正常 1停用）',
  PRIMARY KEY (`id`),
  KEY `idx_menu_name` (`menu_type`),
  KEY `idx_perm_id` (`perm_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='菜单表';

SET FOREIGN_KEY_CHECKS=1;
