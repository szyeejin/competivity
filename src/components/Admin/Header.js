import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Menu, Search, Bell, HelpCircle, User, Settings as SettingsIcon,
  LogOut, Moon, Sun, Command, TrendingUp, ChevronDown, X
} from 'lucide-react';
import Badge from '../UI/Badge';

/**
 * 管理员端顶部导航栏组件 - 升级版
 * 现代设计 + 全局搜索 + 主题切换 + 快捷键
 */
const Header = ({ onToggleSidebar }) => {
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [theme, setTheme] = useState('light');
  
  const [notifications] = useState([
    { id: 1, type: 'warning', message: '3条赛事审核待处理', time: '5分钟前', unread: true },
    { id: 2, type: 'info', message: '新增2个学生报名申请', time: '1小时前', unread: true },
    { id: 3, type: 'success', message: '赛事"AI创新大赛"已成功发布', time: '2小时前', unread: false }
  ]);
  
  const unreadCount = notifications.filter(n => n.unread).length;
  
  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  // 快捷键支持 Ctrl+K 打开搜索
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setShowSearch(true);
      }
      if (e.key === 'Escape') {
        setShowSearch(false);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // 搜索建议
  const searchSuggestions = [
    { type: '赛事', title: 'AI创新大赛', path: '/admin/contest/list' },
    { type: '学生', title: '张三的报名', path: '/admin/student/review' },
    { type: '功能', title: '创建赛事', path: '/admin/contest/create' },
    { type: '功能', title: '评审分配', path: '/admin/judge/assign' },
  ];

  const filteredSuggestions = searchQuery
    ? searchSuggestions.filter(s => 
        s.title.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : searchSuggestions.slice(0, 4);

  return (
    <>
      {/* Header */}
      <motion.header 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.3 }}
        className="fixed top-0 left-0 right-0 h-16 bg-white/80 backdrop-blur-lg shadow-sm border-b border-gray-200 z-50"
      >
        <div className="h-full flex items-center justify-between px-6">
          {/* 左侧：折叠按钮 + Logo + 系统名称 */}
          <div className="flex items-center space-x-4">
            {/* 侧边栏折叠按钮 */}
            <motion.button
              onClick={onToggleSidebar}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-2 rounded-xl hover:bg-primary-50 hover:text-primary-600 transition-all"
              title="展开/收起侧边栏"
            >
              <Menu className="w-5 h-5" />
            </motion.button>

            {/* Logo和系统名称 */}
            <Link to="/admin" className="flex items-center space-x-3 group">
              <motion.div 
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.6 }}
                className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center shadow-lg"
              >
                <TrendingUp className="w-6 h-6 text-white" />
              </motion.div>
              <div>
                <h1 className="text-base font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  高校AI竞赛管理系统
                </h1>
                <p className="text-xs text-gray-500">管理员后台</p>
              </div>
            </Link>
          </div>

          {/* 中间：搜索框 */}
          <div className="hidden lg:block flex-1 max-w-md mx-8">
            <motion.button
              whileHover={{ scale: 1.02 }}
              onClick={() => setShowSearch(true)}
              className="w-full flex items-center gap-3 px-4 py-2 bg-gray-50 hover:bg-gray-100 rounded-xl border border-gray-200 transition-all group"
            >
              <Search className="w-4 h-4 text-gray-400 group-hover:text-primary-500" />
              <span className="text-sm text-gray-500 flex-1 text-left">搜索赛事、学生...</span>
              <div className="flex items-center gap-1 px-2 py-0.5 bg-white rounded border border-gray-200 text-xs text-gray-500">
                <Command className="w-3 h-3" />
                <span>K</span>
              </div>
            </motion.button>
          </div>

          {/* 右侧：操作按钮组 */}
          <div className="flex items-center space-x-2">
            {/* 移动端搜索按钮 */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowSearch(true)}
              className="lg:hidden p-2 rounded-xl hover:bg-gray-100 transition-colors"
            >
              <Search className="w-5 h-5 text-gray-600" />
            </motion.button>

            {/* 主题切换 */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={toggleTheme}
              className="p-2 rounded-xl hover:bg-gray-100 transition-colors"
              title="切换主题"
            >
              <AnimatePresence mode="wait">
                {theme === 'light' ? (
                  <motion.div
                    key="moon"
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Moon className="w-5 h-5 text-gray-600" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="sun"
                    initial={{ rotate: 90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: -90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Sun className="w-5 h-5 text-gray-600" />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>

            {/* 通知 */}
            <div className="relative">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 rounded-xl hover:bg-gray-100 transition-colors"
                title="通知中心"
              >
                <Bell className="w-5 h-5 text-gray-600" />
                {unreadCount > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-semibold"
                  >
                    {unreadCount}
                  </motion.span>
                )}
              </motion.button>

              {/* 通知下拉面板 */}
              <AnimatePresence>
                {showNotifications && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-0 mt-2 w-96 bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden"
                  >
                    <div className="bg-gradient-to-r from-primary-500 to-primary-600 px-4 py-3 flex items-center justify-between">
                      <h3 className="text-white font-semibold flex items-center gap-2">
                        <Bell className="w-4 h-4" />
                        通知中心
                      </h3>
                      {unreadCount > 0 && (
                        <Badge variant="default" size="sm" className="bg-white text-primary-600">
                          {unreadCount} 条未读
                        </Badge>
                      )}
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      {notifications.map((notif, index) => (
                        <motion.div
                          key={notif.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className={`px-4 py-3 hover:bg-gray-50 border-b border-gray-100 cursor-pointer transition-colors ${
                            notif.unread ? 'bg-blue-50/50' : ''
                          }`}
                        >
                          <div className="flex items-start space-x-3">
                            <div className={`w-2 h-2 rounded-full mt-2 ${
                              notif.type === 'warning' ? 'bg-yellow-500' :
                              notif.type === 'info' ? 'bg-blue-500' : 'bg-green-500'
                            }`}></div>
                            <div className="flex-1">
                              <p className="text-sm text-gray-800 font-medium">{notif.message}</p>
                              <p className="text-xs text-gray-500 mt-1">{notif.time}</p>
                            </div>
                            {notif.unread && (
                              <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
                            )}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                    <Link
                      to="/admin/notifications"
                      className="block px-4 py-3 bg-gray-50 text-center text-sm text-primary-600 hover:text-primary-700 font-medium hover:bg-gray-100 transition-colors"
                    >
                      查看全部通知 →
                    </Link>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* 帮助 */}
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link
                to="/admin/help"
                className="p-2 rounded-xl hover:bg-gray-100 transition-colors block"
                title="帮助中心"
              >
                <HelpCircle className="w-5 h-5 text-gray-600" />
              </Link>
            </motion.div>

            {/* 用户菜单 */}
            <div className="relative">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center space-x-2 p-1.5 pr-3 rounded-xl hover:bg-gray-100 transition-colors"
              >
                <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center shadow-md">
                  <span className="text-white font-semibold text-sm">管</span>
                </div>
                <div className="text-left hidden md:block">
                  <p className="text-sm font-medium text-gray-900">管理员</p>
                </div>
                <ChevronDown className="w-4 h-4 text-gray-400" />
              </motion.button>

              {/* 用户下拉菜单 */}
              <AnimatePresence>
                {showUserMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden"
                  >
                    <div className="px-4 py-3 bg-gradient-to-r from-primary-50 to-purple-50 border-b border-gray-200">
                      <p className="text-sm font-semibold text-gray-900">管理员</p>
                      <p className="text-xs text-gray-500 mt-0.5">admin@system.com</p>
                    </div>
                    <div className="py-2">
                      <Link
                        to="/admin/profile"
                        className="flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-600 transition-colors group"
                      >
                        <User className="w-4 h-4 mr-3 group-hover:scale-110 transition-transform" />
                        个人中心
                      </Link>
                      <Link
                        to="/admin/settings"
                        className="flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-600 transition-colors group"
                      >
                        <SettingsIcon className="w-4 h-4 mr-3 group-hover:rotate-90 transition-transform" />
                        系统设置
                      </Link>
                    </div>
                    <div className="border-t border-gray-200">
                      <button
                        onClick={() => {
                          console.log('退出登录');
                          navigate('/login');
                        }}
                        className="flex items-center w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors group"
                      >
                        <LogOut className="w-4 h-4 mr-3 group-hover:translate-x-1 transition-transform" />
                        退出登录
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </motion.header>

      {/* 全局搜索模态框 */}
      <AnimatePresence>
        {showSearch && (
          <>
            {/* 背景遮罩 */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowSearch(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            />
            
            {/* 搜索框 */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              className="fixed top-20 left-1/2 -translate-x-1/2 w-full max-w-2xl bg-white rounded-2xl shadow-2xl z-50 overflow-hidden"
            >
              {/* 搜索输入 */}
              <div className="flex items-center gap-3 px-4 py-4 border-b border-gray-200">
                <Search className="w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="搜索赛事、学生、功能..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 text-base outline-none"
                  autoFocus
                />
                <button
                  onClick={() => setShowSearch(false)}
                  className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              {/* 搜索结果/建议 */}
              <div className="max-h-96 overflow-y-auto p-2">
                {filteredSuggestions.length > 0 ? (
                  filteredSuggestions.map((item, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Link
                        to={item.path}
                        onClick={() => setShowSearch(false)}
                        className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <div className="w-8 h-8 bg-primary-100 text-primary-600 rounded-lg flex items-center justify-center text-xs font-medium">
                          {item.type}
                        </div>
                        <span className="text-sm text-gray-700">{item.title}</span>
                      </Link>
                    </motion.div>
                  ))
                ) : (
                  <div className="px-4 py-8 text-center text-gray-500">
                    <p className="text-sm">没有找到相关结果</p>
                  </div>
                )}
              </div>

              {/* 快捷键提示 */}
              <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 flex items-center justify-between text-xs text-gray-500">
                <span>快捷键</span>
                <div className="flex items-center gap-2">
                  <kbd className="px-2 py-1 bg-white rounded border border-gray-200">↑↓</kbd>
                  <span>导航</span>
                  <kbd className="px-2 py-1 bg-white rounded border border-gray-200 ml-2">Enter</kbd>
                  <span>选择</span>
                  <kbd className="px-2 py-1 bg-white rounded border border-gray-200 ml-2">ESC</kbd>
                  <span>关闭</span>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Header;
