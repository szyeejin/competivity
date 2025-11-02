import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Trophy, FileText, Users, GraduationCap, 
  TrendingUp, Clock, AlertCircle, CheckCircle2,
  Plus, BarChart3, UserPlus, Settings
} from 'lucide-react';
import { LineChart, Line, AreaChart, Area, PieChart, Pie, Cell, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { StatCard } from '../UI/Card';
import Button from '../UI/Button';
import Badge from '../UI/Badge';

/**
 * 管理员仪表板（首页）- 全面升级版
 * 现代设计 + 数据可视化 + 微动画
 */
const Dashboard = () => {
  // 数据统计
  const stats = [
    {
      title: '进行中的赛事',
      value: '12',
      change: '+3',
      changeType: 'increase',
      icon: <Trophy className="w-6 h-6" />,
      bgColor: 'bg-gradient-to-br from-blue-500 to-blue-600',
      link: '/admin/contest/list'
    },
    {
      title: '待审核报名',
      value: '28',
      change: '+5',
      changeType: 'increase',
      icon: <FileText className="w-6 h-6" />,
      bgColor: 'bg-gradient-to-br from-yellow-500 to-orange-500',
      link: '/admin/student/review'
    },
    {
      title: '注册学生总数',
      value: '1,234',
      change: '+89',
      changeType: 'increase',
      icon: <Users className="w-6 h-6" />,
      bgColor: 'bg-gradient-to-br from-green-500 to-emerald-600',
      link: '/admin/student/list'
    },
    {
      title: '评审专家',
      value: '56',
      change: '+2',
      changeType: 'increase',
      icon: <GraduationCap className="w-6 h-6" />,
      bgColor: 'bg-gradient-to-br from-purple-500 to-indigo-600',
      link: '/admin/judge/experts'
    }
  ];

  // 趋势数据（用于图表）
  const trendData = [
    { name: '周一', 报名数: 12, 赛事: 3 },
    { name: '周二', 报名数: 19, 赛事: 5 },
    { name: '周三', 报名数: 15, 赛事: 4 },
    { name: '周四', 报名数: 25, 赛事: 6 },
    { name: '周五', 报名数: 22, 赛事: 5 },
    { name: '周六', 报名数: 30, 赛事: 8 },
    { name: '周日', 报名数: 28, 赛事: 7 },
  ];

  // 赛事分布数据（饼图）
  const contestDistribution = [
    { name: 'AI创新', value: 35, color: '#6366f1' },
    { name: '机器学习', value: 28, color: '#8b5cf6' },
    { name: '数据分析', value: 22, color: '#ec4899' },
    { name: '其他', value: 15, color: '#06b6d4' },
  ];

  // 待处理任务
  const pendingTasks = [
    {
      id: 1,
      priority: 'urgent',
      title: 'AI创新大赛作品评审截止',
      description: '还有2天截止，当前完成度：60%',
      time: '2天后',
      countdown: '48小时',
      progress: 60,
      action: '/admin/judge/assign',
      icon: <AlertCircle className="w-5 h-5" />
    },
    {
      id: 2,
      priority: 'high',
      title: '3个赛事报名审核待处理',
      description: '包含清华大学、北京大学等高校学生',
      time: '今天',
      countdown: '12小时',
      progress: 0,
      action: '/admin/contest/review',
      icon: <FileText className="w-5 h-5" />
    },
    {
      id: 3,
      priority: 'normal',
      title: '5个学生报名信息需确认',
      description: '部分学生信息填写不完整',
      time: '1小时前',
      countdown: null,
      progress: 40,
      action: '/admin/student/review',
      icon: <Users className="w-5 h-5" />
    },
    {
      id: 4,
      priority: 'normal',
      title: '新增2个评审专家申请',
      description: '需审核专家资质和领域匹配度',
      time: '3小时前',
      countdown: null,
      progress: 0,
      action: '/admin/judge/experts',
      icon: <GraduationCap className="w-5 h-5" />
    }
  ];

  // 快捷操作
  const quickActions = [
    {
      title: '创建新赛事',
      description: '发布新的AI竞赛活动',
      icon: <Plus className="w-6 h-6" />,
      bgColor: 'bg-gradient-to-br from-primary-500 to-primary-600',
      link: '/admin/contest/create'
    },
    {
      title: '查看进度看板',
      description: '监控所有赛事运营状态',
      icon: <BarChart3 className="w-6 h-6" />,
      bgColor: 'bg-gradient-to-br from-green-500 to-emerald-600',
      link: '/admin/operation/dashboard'
    },
    {
      title: '分配评审任务',
      description: '为赛事指派评审专家',
      icon: <UserPlus className="w-6 h-6" />,
      bgColor: 'bg-gradient-to-br from-purple-500 to-indigo-600',
      link: '/admin/judge/assign'
    },
    {
      title: '资源调配',
      description: '管理服务器和存储资源',
      icon: <Settings className="w-6 h-6" />,
      bgColor: 'bg-gradient-to-br from-orange-500 to-red-500',
      link: '/admin/operation/resources'
    }
  ];

  // 最近活动
  const recentActivities = [
    {
      id: 1,
      user: '张三',
      action: '提交了作品',
      target: '《基于深度学习的图像识别系统》',
      time: '5分钟前',
      type: 'submit',
      avatar: 'ZS',
      bgColor: 'from-blue-400 to-blue-500'
    },
    {
      id: 2,
      user: '李四',
      action: '完成了评审',
      target: 'AI创新大赛第一轮评审',
      time: '15分钟前',
      type: 'review',
      avatar: 'LS',
      bgColor: 'from-purple-400 to-purple-500'
    },
    {
      id: 3,
      user: '王五',
      action: '创建了新赛事',
      target: '《2024年机器学习挑战赛》',
      time: '1小时前',
      type: 'create',
      avatar: 'WW',
      bgColor: 'from-green-400 to-green-500'
    },
    {
      id: 4,
      user: '赵六',
      action: '加入了团队',
      target: 'AI先锋队',
      time: '2小时前',
      type: 'join',
      avatar: 'ZL',
      bgColor: 'from-orange-400 to-orange-500'
    },
    {
      id: 5,
      user: '孙七',
      action: '提交了评审报告',
      target: '深度学习项目评审',
      time: '3小时前',
      type: 'report',
      avatar: 'SQ',
      bgColor: 'from-pink-400 to-pink-500'
    }
  ];

  // 动画变体
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.3,
        ease: [0.4, 0, 0.2, 1]
      }
    }
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* 页面标题 */}
      <motion.div variants={itemVariants} className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
            管理员控制台
          </h1>
          <p className="text-gray-600 mt-2 flex items-center gap-2">
            <span>欢迎回来！</span>
            <span className="text-gray-400">•</span>
            <span className="text-sm">这是您的数据概览</span>
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="ghost" onClick={() => console.log('导出报表')}>
            导出报表
          </Button>
          <Link to="/admin/contest/create">
            <Button 
              variant="primary" 
              icon={<Plus className="w-4 h-4" />}
            >
              创建赛事
            </Button>
          </Link>
        </div>
      </motion.div>

      {/* 数据统计卡片 */}
      <motion.div 
        variants={itemVariants}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        {stats.map((stat, index) => (
          <Link key={index} to={stat.link}>
            <StatCard
              title={stat.title}
              value={stat.value}
              change={stat.change}
              changeType={stat.changeType}
              icon={stat.icon}
              bgColor={stat.bgColor}
            />
          </Link>
        ))}
      </motion.div>

      {/* 数据可视化区域 */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 趋势图 */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-md p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">数据趋势</h2>
              <p className="text-sm text-gray-500 mt-1">过去7天的报名和赛事变化</p>
            </div>
            <Badge variant="primary" pulse>实时更新</Badge>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={trendData}>
              <defs>
                <linearGradient id="colorEnroll" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0.1}/>
                </linearGradient>
                <linearGradient id="colorContest" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.1}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="name" stroke="#9ca3af" style={{ fontSize: '12px' }} />
              <YAxis stroke="#9ca3af" style={{ fontSize: '12px' }} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                }}
              />
              <Legend wrapperStyle={{ fontSize: '14px' }} />
              <Area 
                type="monotone" 
                dataKey="报名数" 
                stroke="#6366f1" 
                strokeWidth={2}
                fillOpacity={1} 
                fill="url(#colorEnroll)" 
              />
              <Area 
                type="monotone" 
                dataKey="赛事" 
                stroke="#06b6d4" 
                strokeWidth={2}
                fillOpacity={1} 
                fill="url(#colorContest)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* 赛事分布饼图 */}
        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900">赛事分布</h2>
            <p className="text-sm text-gray-500 mt-1">按类别统计</p>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie
                data={contestDistribution}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={5}
                dataKey="value"
              >
                {contestDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-4 space-y-2">
            {contestDistribution.map((item, index) => (
              <div key={index} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: item.color }}
                  ></div>
                  <span className="text-gray-700">{item.name}</span>
                </div>
                <span className="font-semibold text-gray-900">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 左侧：待处理任务 */}
        <div className="lg:col-span-2 space-y-6">
          {/* 待处理任务列表 */}
          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">待处理任务</h2>
                <p className="text-sm text-gray-500 mt-1">按优先级排序</p>
              </div>
              <Badge variant="danger" size="md">
                {pendingTasks.length} 个任务
              </Badge>
            </div>
            <div className="space-y-3">
              {pendingTasks.map(task => (
                <motion.div
                  key={task.id}
                  whileHover={{ x: 4 }}
                  transition={{ duration: 0.2 }}
                >
                  <Link
                    to={task.action}
                    className="block p-4 rounded-xl border border-gray-200 hover:border-primary-300 hover:shadow-md transition-all bg-gradient-to-r from-white to-gray-50"
                  >
                    <div className="flex items-start gap-4">
                      {/* 图标 */}
                      <div className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center ${
                        task.priority === 'urgent' ? 'bg-red-100 text-red-600' :
                        task.priority === 'high' ? 'bg-yellow-100 text-yellow-600' :
                        'bg-blue-100 text-blue-600'
                      }`}>
                        {task.icon}
                      </div>
                      
                      {/* 内容 */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-semibold text-gray-900">{task.title}</h3>
                            <Badge 
                              variant={
                                task.priority === 'urgent' ? 'danger' : 
                                task.priority === 'high' ? 'warning' : 'info'
                              }
                              size="sm"
                            >
                              {task.priority === 'urgent' ? '紧急' : 
                               task.priority === 'high' ? '重要' : '普通'}
                            </Badge>
                            {task.countdown && (
                              <div className="flex items-center gap-1 text-xs text-gray-500">
                                <Clock className="w-3 h-3" />
                                <span>{task.countdown}</span>
                              </div>
                            )}
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 mb-3">{task.description}</p>
                        
                        {/* 进度条 */}
                        {task.progress > 0 && (
                          <div className="space-y-1">
                            <div className="flex justify-between text-xs text-gray-500">
                              <span>完成度</span>
                              <span className="font-medium">{task.progress}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${task.progress}%` }}
                                transition={{ duration: 1, ease: "easeOut" }}
                                className={`h-full rounded-full ${
                                  task.progress < 30 ? 'bg-red-500' :
                                  task.progress < 70 ? 'bg-yellow-500' :
                                  'bg-green-500'
                                }`}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                      
                      {/* 时间戳 */}
                      <span className="text-xs text-gray-400 whitespace-nowrap">{task.time}</span>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>

          {/* 快捷操作 */}
          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900">快捷操作</h2>
              <p className="text-sm text-gray-500 mt-1">常用功能入口</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {quickActions.map((action, index) => (
                <motion.div
                  key={index}
                  whileHover={{ scale: 1.05, y: -4 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                >
                  <Link
                    to={action.link}
                    className={`${action.bgColor} text-white rounded-xl p-5 block shadow-lg hover:shadow-xl transition-all overflow-hidden relative`}
                  >
                    {/* 装饰性背景 */}
                    <div className="absolute top-0 right-0 w-20 h-20 bg-white opacity-10 rounded-full -mr-8 -mt-8"></div>
                    
                    <div className="relative z-10">
                      <div className="mb-3">{action.icon}</div>
                      <h3 className="font-semibold mb-1.5 text-base">{action.title}</h3>
                      <p className="text-xs opacity-90 leading-relaxed">{action.description}</p>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* 右侧：最近活动 - 时间线布局 */}
        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900">最近活动</h2>
            <p className="text-sm text-gray-500 mt-1">实时动态</p>
          </div>
          
          <div className="relative space-y-6">
            {/* 时间线 */}
            <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary-200 via-purple-200 to-pink-200"></div>
            
            {recentActivities.map((activity, index) => (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="relative pl-14 group"
              >
                {/* 头像 */}
                <div className={`absolute left-0 w-10 h-10 bg-gradient-to-br ${activity.bgColor} rounded-full flex items-center justify-center text-white font-semibold text-xs shadow-md group-hover:scale-110 transition-transform duration-200`}>
                  {activity.avatar}
                </div>
                
                {/* 内容卡片 */}
                <motion.div 
                  whileHover={{ x: 4 }}
                  className="bg-gray-50 rounded-lg p-4 border border-gray-100 hover:border-primary-200 hover:shadow-md transition-all cursor-pointer"
                >
                  <div className="flex items-start justify-between mb-2">
                    <p className="text-sm text-gray-900 font-medium">
                      {activity.user}
                    </p>
                    <div className="flex items-center gap-1 text-xs text-gray-400">
                      <Clock className="w-3 h-3" />
                      <span>{activity.time}</span>
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-1">
                    {activity.action}
                  </p>
                  
                  <p className="text-xs text-gray-500 bg-white px-2 py-1 rounded inline-block">
                    {activity.target}
                  </p>
                </motion.div>
              </motion.div>
            ))}
          </div>
          
          <Link to="/admin/activities">
            <Button variant="ghost" className="w-full mt-6" size="sm">
              查看全部活动 →
            </Button>
          </Link>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default Dashboard;
