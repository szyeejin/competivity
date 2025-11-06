import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ReviewStats from './ReviewStats';
import ReviewTable from './ReviewTable';
import ReviewDrawer from './ReviewDrawer';
import ConflictPanel from './ConflictPanel';
import Button from '../../UI/Button';
import Badge from '../../UI/Badge';

/**
 * 赛事审核主页面 - 互联网大厂设计风格
 * 特性：
 * - 统计概览卡片
 * - 多状态筛选
 * - 实时审核
 * - 冲突检测
 * - 审核记录
 */
const ContestReview = () => {
  // 当前激活的标签页
  const [activeTab, setActiveTab] = useState('pending');
  
  // 审核抽屉状态
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedContest, setSelectedContest] = useState(null);
  
  // 冲突面板状态
  const [conflictPanelOpen, setConflictPanelOpen] = useState(false);
  const [conflictData, setConflictData] = useState(null);
  
  // 搜索和筛选
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  
  // 模拟数据
  const [contests, setContests] = useState([
    {
      id: 1,
      name: '全国大学生数学建模竞赛',
      organizer: '教育部高等教育司',
      category: '学科竞赛',
      level: '国家级',
      status: 'pending',
      priority: 'high',
      submitTime: '2024-11-04 10:30',
      applicant: '张三',
      conflicts: ['时间冲突', '场地冲突'],
      participants: 500,
      budget: 50000,
    },
    {
      id: 2,
      name: 'ACM国际大学生程序设计竞赛',
      organizer: '计算机学院',
      category: '专业技能',
      level: '国际级',
      status: 'pending',
      priority: 'high',
      submitTime: '2024-11-04 09:15',
      applicant: '李四',
      conflicts: [],
      participants: 300,
      budget: 80000,
    },
    {
      id: 3,
      name: '互联网+创新创业大赛',
      organizer: '创新创业学院',
      category: '创新创业',
      level: '省级',
      status: 'reviewing',
      priority: 'medium',
      submitTime: '2024-11-03 15:20',
      applicant: '王五',
      conflicts: ['资源冲突'],
      participants: 200,
      budget: 30000,
    },
    {
      id: 4,
      name: '大学生电子设计竞赛',
      organizer: '电子工程学院',
      category: '学科竞赛',
      level: '国家级',
      status: 'approved',
      priority: 'medium',
      submitTime: '2024-11-02 14:00',
      applicant: '赵六',
      conflicts: [],
      participants: 150,
      budget: 40000,
      reviewer: '审核员A',
      reviewTime: '2024-11-03 10:00',
    },
    {
      id: 5,
      name: '校园歌手大赛',
      organizer: '学生会',
      category: '文艺活动',
      level: '校级',
      status: 'rejected',
      priority: 'low',
      submitTime: '2024-11-01 16:30',
      applicant: '孙七',
      conflicts: ['预算超标', '合规问题'],
      participants: 100,
      budget: 20000,
      reviewer: '审核员B',
      reviewTime: '2024-11-02 09:30',
      rejectReason: '预算超出校级活动标准，建议重新规划',
    },
  ]);

  // 统计数据
  const stats = {
    pending: contests.filter(c => c.status === 'pending').length,
    reviewing: contests.filter(c => c.status === 'reviewing').length,
    approved: contests.filter(c => c.status === 'approved').length,
    rejected: contests.filter(c => c.status === 'rejected').length,
    total: contests.length,
    conflicts: contests.filter(c => c.conflicts.length > 0).length,
  };

  // 标签页配置
  const tabs = [
    { id: 'pending', label: '待审核', count: stats.pending, color: 'warning' },
    { id: 'reviewing', label: '审核中', count: stats.reviewing, color: 'info' },
    { id: 'approved', label: '已通过', count: stats.approved, color: 'success' },
    { id: 'rejected', label: '已驳回', count: stats.rejected, color: 'danger' },
    { id: 'all', label: '全部', count: stats.total, color: 'default' },
  ];

  // 打开审核抽屉
  const handleReviewContest = (contest) => {
    setSelectedContest(contest);
    setDrawerOpen(true);
  };

  // 查看冲突详情
  const handleViewConflicts = (contest) => {
    setConflictData({
      contestId: contest.id,
      contestName: contest.name,
      conflicts: contest.conflicts,
    });
    setConflictPanelOpen(true);
  };

  // 提交审核结果
  const handleSubmitReview = (contestId, result, comment) => {
    setContests(prev => prev.map(c => 
      c.id === contestId 
        ? { 
            ...c, 
            status: result, 
            reviewer: '当前审核员',
            reviewTime: new Date().toISOString(),
            rejectReason: result === 'rejected' ? comment : undefined,
          }
        : c
    ));
    setDrawerOpen(false);
  };

  // 筛选数据
  const filteredContests = contests.filter(contest => {
    const matchTab = activeTab === 'all' || contest.status === activeTab;
    const matchSearch = contest.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                       contest.organizer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchTab && matchSearch;
  });

  return (
    <div className="space-y-6">
      {/* 页面头部 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 flex items-center gap-3">
            <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 text-white shadow-lg">
              📋
            </span>
            赛事审核管理
          </h1>
          <p className="mt-1 text-sm text-neutral-500">
            审核赛事申请、检测冲突、管理流程
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="md"
            onClick={() => window.location.reload()}
          >
            <span className="mr-2">🔄</span>
            刷新数据
          </Button>
          
          <Button
            variant="primary"
            size="md"
            onClick={() => {/* 导出报表 */}}
          >
            <span className="mr-2">📊</span>
            导出报表
          </Button>
        </div>
      </div>

      <div className="space-y-6">
        {/* 统计卡片 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <ReviewStats stats={stats} />
        </motion.div>

        {/* 筛选区域 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6"
        >
          {/* 标签页 */}
          <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  relative px-4 py-2.5 rounded-lg font-medium text-sm transition-all duration-200 whitespace-nowrap
                  ${activeTab === tab.id
                    ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg shadow-primary-500/30'
                    : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                  }
                `}
              >
                <span className="flex items-center gap-2">
                  {tab.label}
                  <Badge 
                    variant={activeTab === tab.id ? 'default' : tab.color}
                    size="sm"
                    className={activeTab === tab.id ? 'bg-white/20 text-white' : ''}
                  >
                    {tab.count}
                  </Badge>
                </span>
                
                {activeTab === tab.id && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 bg-gradient-to-r from-primary-500 to-primary-600 rounded-lg -z-10"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
              </button>
            ))}
          </div>

          {/* 搜索栏 */}
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="搜索赛事名称、主办方..."
                className="w-full px-4 py-2.5 pl-11 bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
              />
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400">
                🔍
              </span>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                >
                  ✕
                </button>
              )}
            </div>
            
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
            >
              <option value="all">全部等级</option>
              <option value="international">国际级</option>
              <option value="national">国家级</option>
              <option value="provincial">省级</option>
              <option value="school">校级</option>
            </select>
          </div>
        </motion.div>

        {/* 审核列表 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <ReviewTable
            contests={filteredContests}
            onReview={handleReviewContest}
            onViewConflicts={handleViewConflicts}
          />
        </motion.div>
      </div>

      {/* 审核详情抽屉 */}
      <AnimatePresence>
        {drawerOpen && (
          <ReviewDrawer
            contest={selectedContest}
            onClose={() => setDrawerOpen(false)}
            onSubmit={handleSubmitReview}
          />
        )}
      </AnimatePresence>

      {/* 冲突检测面板 */}
      <AnimatePresence>
        {conflictPanelOpen && (
          <ConflictPanel
            data={conflictData}
            onClose={() => setConflictPanelOpen(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default ContestReview;
