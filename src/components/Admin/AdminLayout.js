import React, { useState } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';

/**
 * 管理员端主布局组件
 * 采用：顶部导航栏 + 左侧边栏 + 主内容区的经典后台布局
 */
const AdminLayout = ({ children }) => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };
 
  return (
    <div className="min-h-screen bg-gray-50">
      {/* 顶部导航栏 - 固定在顶部 */}
      <Header onToggleSidebar={toggleSidebar} />
      
      <div className="flex pt-16">
        {/* 左侧边栏 - 固定高度，可折叠 */}
        <Sidebar isCollapsed={isSidebarCollapsed} />
        
        {/* 主内容区 - 动态加载内容 */}
        <main 
          className={`flex-1 transition-all duration-300 ${
            isSidebarCollapsed ? 'ml-20' : 'ml-64'
          }`}
        >
          <div className="p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
