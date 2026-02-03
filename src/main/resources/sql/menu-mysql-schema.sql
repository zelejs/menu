
SET FOREIGN_KEY_CHECKS=0;

DROP TABLE IF EXISTS `t_sys_menu`;
create table t_sys_menu (
  id       			    bigint(20)      not null auto_increment    comment '菜单ID',
  menu_name         varchar(50)     not null                   comment '菜单名称',
  pid                bigint(20)      default null                  comment '父菜单ID',
  order_num         int(4)          default 0                  comment '显示顺序',
  path              varchar(200)    default ''                 comment '路由地址',
  component         varchar(255)    default null               comment '组件路径',
  is_frame          int(1)          default 1                  comment '是否为外链（0是 1否）',
  is_cache          int(1)          default 0                  comment '是否缓存（0缓存 1不缓存）',
  menu_type         char(1)         default ''                 comment '菜单类型（C目录 M菜单 B按钮）',
  visible           char(1)         default 0                  comment '菜单状态（0显示 1隐藏）',
  `status`          char(1)         default 0                  comment '菜单状态（0正常 1停用）',
  perm_id			bigint(20)		default null			   comment '权限id',
  perm              varchar(50)     default null                   comment '权限',
  icon              varchar(100)    default '#'                comment '菜单图标',
  create_by         varchar(64)     default ''                 comment '创建者',
  create_time       datetime                                   comment '创建时间',
  update_by         varchar(64)     default ''                 comment '更新者',
  update_time       datetime                                   comment '更新时间',
  remark            varchar(500)    default ''                 comment '备注',
	org_id						bigint(20)			default null							 comment '隔离标识',
  primary key (id)
) engine=innodb ;

SET FOREIGN_KEY_CHECKS=1;
