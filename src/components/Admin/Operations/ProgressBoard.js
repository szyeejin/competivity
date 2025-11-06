import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { API_ENDPOINTS } from '../../../config/api';

/**
 * 运营管理 - 进度看板
 * 腾讯/字节风格：数据可视化、实时监控、清晰的进度指标
 */
const ProgressBoard = () => {
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    contests: [],
    registrations: [],
    teams: [],
    stats: {
      totalContests: 0,
      activeContests: 0,
      totalRegistrations: 0,
      pendingReviews: 0,
      totalTeams: 0,
      completionRate: 0
    }
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // 并行获取所有数据
      const [contestsRes, registrationsRes, teamsRes] = await Promise.all([
        fetch(API_ENDPOINTS.CONTESTS.LIST),
        fetch(API_ENDPOINTS.REGISTRATIONS.LIST),
        fetch(API_ENDPOINTS.TEAMS.LIST)
      ]);

      const contestsData = await contestsRes.json();
      const registrationsData = await registrationsRes.json();
      const teamsData = await teamsRes.json();

      const contests = contestsData.success ? contestsData.data : [];
      const registrations = registrationsData.success ? registrationsData.data : [];
      const teams = teamsData.success ? teamsData.data : [];

      // 计算统计数据
      const stats = {
        totalContests: contests.length,
        activeContests: contests.filter(c => c.status === 'published' || c.status === 'ongoing').length,
        totalRegistrations: registrations.length,
        pendingReviews: registrations.filter(r => r.status === 'pending').length,
        totalTeams: teams.length,
        completionRate: contests.length > 0 
          ? Math.round((contests.filter(c => c.status === 'completed').length / contests.length) * 100)
          : 0
      };

      setDashboardData({ contests, registrations, teams, stats });
    } catch (error) {
      console.error('获取数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 获取赛事进度数据
  const getContestProgress = () => {
    return dashboardData.contests.map(contest => {
      const contestRegs = dashboardData.registrations.filter(r => r.contest_id === contest.id);
      const approvedRegs = contestRegs.filter(r => r.status === 'approved').length;
      const totalRegs = contestRegs.length;
      const progress = totalRegs > 0 ? Math.round((approvedRegs / totalRegs) * 100) : 0;

      return {
        id: contest.id,
        name: contest.name,
        status: contest.status,
        totalRegistrations: totalRegs,
        approvedRegistrations: approvedRegs,
        progress,
        startDate: contest.start_date,
        endDate: contest.end_date
      };
    });
  };

  const contestProgress = getContestProgress();

  // 状态颜色映射
  const statusColors = {
    draft: 'bg-gray-100 text-gray-600 border-gray-200',
    published: 'bg-blue-100 text-blue-600 border-blue-200',
    ongoing: 'bg-green-100 text-green-600 border-green-200',
    completed: 'bg-purple-100 text-purple-600 border-purple-200',
    archived: 'bg-gray-100 text-gray-500 border-gray-200'
  };

  const statusLabels = {
    draft: '草稿',
    published: '已发布',
    ongoing: '进行中',
    completed: '已完成',
    archived: '已归档'
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">进度看板</h1>
          <p className="text-sm text-gray-500 mt-1">实时监控赛事运营进度和关键指标</p>
        </div>
        <button
          onClick={fetchDashboardData}
          className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          刷新数据
        </button>
      </div>

      {/* 关键指标卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600">赛事总数</p>
              <p className="text-3xl font-bold text-blue-900 mt-2">{dashboardData.stats.totalContests}</p>
              <p className="text-xs text-blue-600 mt-1">活跃: {dashboardData.stats.activeContests}</p>
            </div>
            <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border border-green-200"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600">报名总数</p>
              <p className="text-3xl font-bold text-green-900 mt-2">{dashboardData.stats.totalRegistrations}</p>
              <p className="text-xs text-green-600 mt-1">待审核: {dashboardData.stats.pendingReviews}</p>
            </div>
            <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 border border-purple-200"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-600">团队数量</p>
              <p className="text-3xl font-bold text-purple-900 mt-2">{dashboardData.stats.totalTeams}</p>
              <p className="text-xs text-purple-600 mt-1">全部团队</p>
            </div>
            <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-6 border border-orange-200"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-orange-600">完成率</p>
              <p className="text-3xl font-bold text-orange-900 mt-2">{dashboardData.stats.completionRate}%</p>
              <p className="text-xs text-orange-600 mt-1">赛事完成度</p>
            </div>
            <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </motion.div>
      </div>

      {/* 赛事进度详情 */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">赛事进度跟踪</h2>
          <p className="text-sm text-gray-500 mt-1">各赛事报名审核进度一览</p>
        </div>

        <div className="p-6">
          {contestProgress.length === 0 ? (
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <p className="mt-2 text-sm text-gray-500">暂无赛事数据</p>
            </div>
          ) : (
            <div className="space-y-4">
              {contestProgress.map((contest, index) => (
                <motion.div
                  key={contest.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <h3 className="font-semibold text-gray-900">{contest.name}</h3>
                      <span className={`px-2 py-1 rounded-md text-xs font-medium border ${statusColors[contest.status]}`}>
                        {statusLabels[contest.status]}
                      </span>
                    </div>
                    <div className="text-sm text-gray-500">
                      进度: {contest.progress}%
                    </div>
                  </div>

                  {/* 进度条 */}
                  <div className="relative">
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${contest.progress}%` }}
                        transition={{ duration: 0.8, delay: index * 0.05 }}
                        className="h-full bg-gradient-to-r from-blue-500 to-blue-600"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-3 text-sm text-gray-600">
                    <div className="flex items-center gap-4">
                      <span>总报名: {contest.totalRegistrations}</span>
                      <span>已通过: {contest.approvedRegistrations}</span>
                    </div>
                    {contest.startDate && (
                      <span className="text-xs">
                        开始: {new Date(contest.startDate).toLocaleDateString('zh-CN')}
                      </span>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 待办事项提醒 */}
      {dashboardData.stats.pendingReviews > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-yellow-50 border border-yellow-200 rounded-xl p-6"
        >
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-yellow-900">待办提醒</h3>
              <p className="text-sm text-yellow-700 mt-1">
                当前有 <span className="font-bold">{dashboardData.stats.pendingReviews}</span> 个报名申请待审核，请及时处理
              </p>
            </div>
            <button className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors text-sm font-medium">
              去审核
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default ProgressBoard;
