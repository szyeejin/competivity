import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Trophy, FileCheck, List, Archive,
  Users, UserCheck, UsersRound, UserSquare,
  Award, UserPlus, Medal,
  BarChart3, Settings,
  Shield, Plug,
  ChevronDown, ChevronRight, TrendingUp
} from 'lucide-react';
import Badge from '../UI/Badge';

/**
 * 管理员端侧边栏组件 - 升级版
 * 现代图标 + 平滑动画 + 更好交互
 */
const Sidebar = ({ isCollapsed }) => {
  const location = useLocation();
  const [expandedMenus, setExpandedMenus] = useState(['contest', 'student']);
  const [hoveredMenu, setHoveredMenu] = useState(null);

  // 切换菜单展开/收起状态
  const toggleMenu = (menuKey) => {
    setExpandedMenus(prev => 
      prev.includes(menuKey) 
        ? prev.filter(key => key !== menuKey)
        : [...prev, menuKey]
    );
  };

  // 判断当前路径是否激活
  const isActive = (path) => location.pathname === path;

  // 菜单配置 - 使用lucide-react图标
  const menuItems = [
    {
      key: 'contest',
      title: '赛事管理',
      icon: Trophy,
      priority: 'P0',
      children: [
        { path: '/admin/contest/create', title: '创建赛事', icon: FileCheck },
        { path: '/admin/contest/review', title: '赛事审核', icon: FileCheck, badge: 3 },
        { path: '/admin/contest/list', title: '赛事列表', icon: List },
        { path: '/admin/contest/archive', title: '赛事归档', icon: Archive }
      ]
    },
    {
      key: 'student',
      title: '学生管理',
      icon: Users,
      priority: 'P0',
      children: [
        { path: '/admin/student/review', title: '报名审核', icon: UserCheck, badge: 2 },
        { path: '/admin/student/team', title: '组队管理', icon: UsersRound },
        { path: '/admin/student/list', title: '学生列表', icon: UserSquare }
      ]
    },
    {
      key: 'judge',
      title: '评审管理',
      icon: Award,
      priority: 'P0',
      children: [
        { path: '/admin/judge/experts', title: '专家库', icon: UserPlus },
        { path: '/admin/judge/assign', title: '评审分配', icon: UserCheck },
        { path: '/admin/judge/results', title: '结果公示', icon: Medal }
      ]
    },
    {
      key: 'operation',
      title: '运营管理',
      icon: BarChart3,
      priority: 'P0',
      children: [
        { path: '/admin/operation/dashboard', title: '进度看板', icon: BarChart3 },
        { path: '/admin/operation/resources', title: '资源调配', icon: Settings }
      ]
    },
    {
      key: 'system',
      title: '系统设置',
      icon: Settings,
      priority: 'P1',
      children: [
        { path: '/admin/system/permission', title: '权限管理', icon: Shield },
        { path: '/admin/system/api', title: '接口配置', icon: Plug }
      ]
    }
  ];

  // 动画变体
  const sidebarVariants = {
    expanded: { width: 256 },
    collapsed: { width: 80 }
  };

  const menuItemVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: { duration: 0.2 }
    }
  };

  return (
    <motion.aside
      animate={isCollapsed ? "collapsed" : "expanded"}
      variants={sidebarVariants}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      className="fixed left-0 top-16 bottom-0 bg-gradient-to-b from-white to-gray-50 border-r border-gray-200 overflow-y-auto shadow-lg"
    >
      <nav className="py-6 px-2">
        {menuItems.map((menu, menuIndex) => {
          const IconComponent = menu.icon;
          const isExpanded = expandedMenus.includes(menu.key);
          
          return (
            <motion.div
              key={menu.key}
              initial="hidden"
              animate="visible"
              variants={menuItemVariants}
              transition={{ delay: menuIndex * 0.05 }}
              className="mb-1"
              onMouseEnter={() => setHoveredMenu(menu.key)}
              onMouseLeave={() => setHoveredMenu(null)}
            >
              {/* 一级菜单标题 */}
              <motion.button
                onClick={() => !isCollapsed && toggleMenu(menu.key)}
                whileHover={{ x: 4 }}
                whileTap={{ scale: 0.98 }}
                className={`w-full flex items-center justify-between px-3 py-3 rounded-xl text-gray-700 hover:bg-primary-50 hover:text-primary-600 transition-all duration-200 group ${
                  isCollapsed ? 'justify-center' : ''
                } ${isExpanded && !isCollapsed ? 'bg-primary-50 text-primary-600' : ''}`}
                title={isCollapsed ? menu.title : ''}
              >
                <div className="flex items-center space-x-3">
                  <IconComponent className="w-5 h-5 flex-shrink-0" />
                  {!isCollapsed && (
                    <>
                      <span className="font-medium text-sm">{menu.title}</span>
                      {menu.priority === 'P0' && (
                        <Badge variant="primary" size="sm">P0</Badge>
                      )}
                    </>
                  )}
                </div>
                {!isCollapsed && (
                  <motion.div
                    animate={{ rotate: isExpanded ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ChevronDown className="w-4 h-4" />
                  </motion.div>
                )}
              </motion.button>

              {/* 二级菜单项 */}
              <AnimatePresence>
                {(!isCollapsed && isExpanded) && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="mt-1 space-y-0.5"
                  >
                    {menu.children.map((item, itemIndex) => {
                      const ItemIcon = item.icon;
                      const active = isActive(item.path);
                      
                      return (
                        <motion.div
                          key={item.path}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: itemIndex * 0.05 }}
                        >
                          <Link
                            to={item.path}
                            className={`flex items-center justify-between px-3 py-2.5 ml-8 mr-2 rounded-lg text-sm transition-all ${
                              active
                                ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-md font-medium'
                                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                            }`}
                          >
                            <div className="flex items-center space-x-2.5">
                              <ItemIcon className="w-4 h-4" />
                              <span>{item.title}</span>
                            </div>
                            {/* 待处理数量徽章 */}
                            {item.badge && (
                              <Badge 
                                variant={active ? "default" : "danger"} 
                                size="sm"
                                className={active ? "bg-white text-primary-600" : ""}
                              >
                                {item.badge}
                              </Badge>
                            )}
                          </Link>
                        </motion.div>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* 折叠状态下的悬浮菜单 */}
              {isCollapsed && hoveredMenu === menu.key && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="absolute left-full top-0 ml-2 w-52 bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden z-50"
                >
                  <div className="px-4 py-3 bg-gradient-to-r from-primary-500 to-primary-600">
                    <p className="font-semibold text-white flex items-center gap-2">
                      <IconComponent className="w-4 h-4" />
                      {menu.title}
                    </p>
                  </div>
                  <div className="py-2">
                    {menu.children.map((item) => {
                      const ItemIcon = item.icon;
                      const active = isActive(item.path);
                      
                      return (
                        <Link
                          key={item.path}
                          to={item.path}
                          className={`flex items-center justify-between px-4 py-2.5 text-sm transition-all ${
                            active
                              ? 'bg-primary-50 text-primary-600 font-medium'
                              : 'text-gray-600 hover:bg-gray-50'
                          }`}
                        >
                          <div className="flex items-center space-x-2.5">
                            <ItemIcon className="w-4 h-4" />
                            <span>{item.title}</span>
                          </div>
                          {item.badge && (
                            <Badge variant="danger" size="sm">
                              {item.badge}
                            </Badge>
                          )}
                        </Link>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </motion.div>
          );
        })}
      </nav>

      {/* 底部装饰和提示 */}
      <AnimatePresence>
        {!isCollapsed && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="absolute bottom-4 left-4 right-4"
          >
            <div className="p-4 bg-gradient-to-br from-primary-50 to-blue-50 border border-primary-200 rounded-xl shadow-sm">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-900 mb-1">
                    系统运行正常
                  </p>
                  <p className="text-xs text-gray-600">
                    点击顶部按钮可折叠侧边栏
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.aside>
  );
};

export default Sidebar;
