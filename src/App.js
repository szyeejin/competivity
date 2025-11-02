import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import AdminLayout from './components/Admin/AdminLayout';
import Dashboard from './components/Admin/Dashboard';
import CreateContest from './components/Admin/Contest/CreateContest';

function App() {
  return (
    <Router>
      <Routes>
        {/* 默认路由 - 跳转到登录页 */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        
        {/* 登录注册路由 */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* 管理员后台路由 */}
        <Route path="/admin" element={<AdminLayout><Dashboard /></AdminLayout>} />
        
        {/* 赛事管理路由 */}
        <Route path="/admin/contest/create" element={<AdminLayout><CreateContest /></AdminLayout>} />
        <Route path="/admin/contest/review" element={<AdminLayout><div className="p-6"><h1 className="text-2xl font-bold">赛事审核</h1><p className="text-gray-600 mt-2">此页面开发中...</p></div></AdminLayout>} />
        <Route path="/admin/contest/list" element={<AdminLayout><div className="p-6"><h1 className="text-2xl font-bold">赛事列表</h1><p className="text-gray-600 mt-2">此页面开发中...</p></div></AdminLayout>} />
        <Route path="/admin/contest/archive" element={<AdminLayout><div className="p-6"><h1 className="text-2xl font-bold">赛事归档</h1><p className="text-gray-600 mt-2">此页面开发中...</p></div></AdminLayout>} />
        
        {/* 学生管理路由 */}
        <Route path="/admin/student/review" element={<AdminLayout><div className="p-6"><h1 className="text-2xl font-bold">报名审核</h1><p className="text-gray-600 mt-2">此页面开发中...</p></div></AdminLayout>} />
        <Route path="/admin/student/team" element={<AdminLayout><div className="p-6"><h1 className="text-2xl font-bold">组队管理</h1><p className="text-gray-600 mt-2">此页面开发中...</p></div></AdminLayout>} />
        <Route path="/admin/student/list" element={<AdminLayout><div className="p-6"><h1 className="text-2xl font-bold">学生列表</h1><p className="text-gray-600 mt-2">此页面开发中...</p></div></AdminLayout>} />
        
        {/* 评审管理路由 */}
        <Route path="/admin/judge/experts" element={<AdminLayout><div className="p-6"><h1 className="text-2xl font-bold">专家库</h1><p className="text-gray-600 mt-2">此页面开发中...</p></div></AdminLayout>} />
        <Route path="/admin/judge/assign" element={<AdminLayout><div className="p-6"><h1 className="text-2xl font-bold">评审分配</h1><p className="text-gray-600 mt-2">此页面开发中...</p></div></AdminLayout>} />
        <Route path="/admin/judge/results" element={<AdminLayout><div className="p-6"><h1 className="text-2xl font-bold">结果公示</h1><p className="text-gray-600 mt-2">此页面开发中...</p></div></AdminLayout>} />
        
        {/* 运营管理路由 */}
        <Route path="/admin/operation/dashboard" element={<AdminLayout><div className="p-6"><h1 className="text-2xl font-bold">进度看板</h1><p className="text-gray-600 mt-2">此页面开发中...</p></div></AdminLayout>} />
        <Route path="/admin/operation/resources" element={<AdminLayout><div className="p-6"><h1 className="text-2xl font-bold">资源调配</h1><p className="text-gray-600 mt-2">此页面开发中...</p></div></AdminLayout>} />
        
        {/* 系统设置路由 */}
        <Route path="/admin/system/permission" element={<AdminLayout><div className="p-6"><h1 className="text-2xl font-bold">权限管理</h1><p className="text-gray-600 mt-2">此页面开发中...</p></div></AdminLayout>} />
        <Route path="/admin/system/api" element={<AdminLayout><div className="p-6"><h1 className="text-2xl font-bold">接口配置</h1><p className="text-gray-600 mt-2">此页面开发中...</p></div></AdminLayout>} />
        
        {/* 其他管理员路由 */}
        <Route path="/admin/profile" element={<AdminLayout><div className="p-6"><h1 className="text-2xl font-bold">个人中心</h1><p className="text-gray-600 mt-2">此页面开发中...</p></div></AdminLayout>} />
        <Route path="/admin/settings" element={<AdminLayout><div className="p-6"><h1 className="text-2xl font-bold">系统设置</h1><p className="text-gray-600 mt-2">此页面开发中...</p></div></AdminLayout>} />
        <Route path="/admin/notifications" element={<AdminLayout><div className="p-6"><h1 className="text-2xl font-bold">通知中心</h1><p className="text-gray-600 mt-2">此页面开发中...</p></div></AdminLayout>} />
        <Route path="/admin/help" element={<AdminLayout><div className="p-6"><h1 className="text-2xl font-bold">帮助中心</h1><p className="text-gray-600 mt-2">此页面开发中...</p></div></AdminLayout>} />
        <Route path="/admin/activities" element={<AdminLayout><div className="p-6"><h1 className="text-2xl font-bold">活动记录</h1><p className="text-gray-600 mt-2">此页面开发中...</p></div></AdminLayout>} />
      </Routes>
    </Router>
  );
}

export default App;
