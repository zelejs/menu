-- 添加 invisible 字段到 t_app_res_relation 表
ALTER TABLE `t_app_res_relation`
ADD COLUMN `invisible` tinyint(1) NOT NULL DEFAULT 0 COMMENT '是否隐藏菜单（0=可见，1=不可见）' AFTER `pid`,
ADD INDEX `idx_invisible` (`invisible`);
