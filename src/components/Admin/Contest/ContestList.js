import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { API_ENDPOINTS } from '../../../config/api';
import Button from '../../UI/Button';
import Badge from '../../UI/Badge';

/**
 * 赛事列表页面 - 展示所有赛事
 * 特性：卡片布局、筛选搜索、分页、详情查看
 */
const ContestList = () => {
  const [contests, setContests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');

  // 获取赛事列表
  useEffect(() => {
    fetchContests();
  }, []);

  const fetchContests = async () => {
    try {
      setLoading(true);
      const response = await fetch(API_ENDPOINTS.CONTESTS.LIST);
      const result = await response.json();
      
      if (result.success) {
        setContests(result.data);
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError('获取赛事列表失败：' + err.message);
      console.error('获取赛事列表错误:', err);
    } finally {
      setLoading(false);
    }
  };

  // 筛选赛事
  const filteredContests = contests.filter(contest => {
    const matchSearch = contest.name?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchStatus = filterStatus === 'all' || contest.status === filterStatus;
    const matchType = filterType === 'all' || contest.type === filterType;
    return matchSearch && matchStatus && matchType;
  });

  // 状态映射
  const statusConfig = {
    draft: { label: '草稿', color: 'default', icon: '📝' },
    pending: { label: '待审核', color: 'warning', icon: '⏳' },
    approved: { label: '已通过', color: 'success', icon: '✅' },
    published: { label: '已发布', color: 'info', icon: '📢' },
    ongoing: { label: '进行中', color: 'primary', icon: '🔥' },
    completed: { label: '已完成', color: 'default', icon: '🏆' },
    rejected: { label: '已驳回', color: 'danger', icon: '❌' },
    archived: { label: '已归档', color: 'default', icon: '📦' },
  };

  // 赛事类型列表
  const contestTypes = ['学科竞赛', '创新创业', '文体活动', '技能竞赛', '科技竞赛'];

  return (
    <div className="space-y-6">
      {/* 页面头部 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 flex items-center gap-3">
            <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg">
              🏆
            </span>
            赛事列表
          </h1>
          <p className="mt-1 text-sm text-neutral-500">
            浏览和管理所有竞赛活动
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          onClick={() => window.location.href = '/admin/contest/create'}
        >
          <span className="mr-2">➕</span>
          创建赛事
        </Button>
      </div>

      {/* 筛选栏 */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* 搜索框 */}
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="搜索赛事名称..."
              className="w-full px-4 py-2.5 pl-11 bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400">
              🔍
            </span>
          </div>

          {/* 状态筛选 */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="all">全部状态</option>
            <option value="draft">草稿</option>
            <option value="pending">待审核</option>
            <option value="approved">已通过</option>
            <option value="published">已发布</option>
            <option value="ongoing">进行中</option>
            <option value="completed">已完成</option>
            <option value="rejected">已驳回</option>
          </select>

          {/* 类型筛选 */}
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="all">全部类型</option>
            {contestTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>

        {/* 统计信息 */}
        <div className="mt-4 flex items-center gap-4 text-sm text-neutral-600">
          <span>共 {contests.length} 个赛事</span>
          <span>•</span>
          <span>筛选结果: {filteredContests.length} 个</span>
        </div>
      </motion.div>

      {/* 加载状态 */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="inline-block w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-neutral-600">加载中...</p>
          </div>
        </div>
      )}

      {/* 错误状态 */}
      {error && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-red-50 border border-red-200 rounded-xl p-6 text-center"
        >
          <div className="text-4xl mb-3">❌</div>
          <p className="text-red-800 font-medium">{error}</p>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchContests}
            className="mt-4"
          >
            重试
          </Button>
        </motion.div>
      )}

      {/* 赛事列表 */}
      {!loading && !error && (
        <AnimatePresence mode="popLayout">
          {filteredContests.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="bg-white rounded-xl border border-neutral-200 p-12 text-center"
            >
              <div className="text-6xl mb-4">📋</div>
              <h3 className="text-lg font-semibold text-neutral-900 mb-2">
                暂无赛事
              </h3>
              <p className="text-neutral-500 mb-6">
                {searchQuery || filterStatus !== 'all' || filterType !== 'all'
                  ? '没有符合条件的赛事，试试调整筛选条件'
                  : '还没有创建任何赛事，点击上方按钮创建第一个赛事吧'}
              </p>
              {(searchQuery || filterStatus !== 'all' || filterType !== 'all') && (
                <Button
                  variant="outline"
                  size="md"
                  onClick={() => {
                    setSearchQuery('');
                    setFilterStatus('all');
                    setFilterType('all');
                  }}
                >
                  清除筛选
                </Button>
              )}
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredContests.map((contest, index) => (
                <ContestCard
                  key={contest.id}
                  contest={contest}
                  index={index}
                  statusConfig={statusConfig}
                />
              ))}
            </div>
          )}
        </AnimatePresence>
      )}
    </div>
  );
};

/**
 * 赛事卡片组件
 */
const ContestCard = ({ contest, index, statusConfig }) => {
  const status = statusConfig[contest.status] || statusConfig.draft;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ y: -8, transition: { duration: 0.2 } }}
      className="bg-white rounded-xl border border-neutral-200 overflow-hidden shadow-sm hover:shadow-xl transition-shadow cursor-pointer"
    >
      {/* 卡片头部 - 彩色条纹 */}
      <div className={`h-2 bg-gradient-to-r ${
        contest.status === 'draft' ? 'from-gray-400 to-gray-500' :
        contest.status === 'pending' ? 'from-amber-400 to-orange-500' :
        contest.status === 'approved' || contest.status === 'published' ? 'from-green-400 to-emerald-500' :
        contest.status === 'ongoing' ? 'from-blue-400 to-blue-600' :
        contest.status === 'completed' ? 'from-purple-400 to-purple-600' :
        contest.status === 'rejected' ? 'from-red-400 to-red-600' :
        'from-gray-400 to-gray-500'
      }`} />

      <div className="p-6">
        {/* 状态和类型 */}
        <div className="flex items-center justify-between mb-3">
          <Badge variant={status.color} size="sm">
            {status.icon} {status.label}
          </Badge>
          <span className="text-xs text-neutral-500">{contest.type}</span>
        </div>

        {/* 赛事名称 */}
        <h3 className="text-lg font-bold text-neutral-900 mb-2 line-clamp-2 hover:text-primary-600 transition-colors">
          {contest.name}
        </h3>

        {/* 赛事信息 */}
        <div className="space-y-2 mb-4">
          {contest.start_date && (
            <div className="flex items-center gap-2 text-sm text-neutral-600">
              <span>📅</span>
              <span>{new Date(contest.start_date).toLocaleDateString('zh-CN')}</span>
            </div>
          )}
          {contest.location && (
            <div className="flex items-center gap-2 text-sm text-neutral-600">
              <span>📍</span>
              <span className="line-clamp-1">{contest.location}</span>
            </div>
          )}
        </div>

        {/* 奖励信息 */}
        {(contest.first_prize || contest.certificate) && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4">
            <div className="flex items-center gap-2 text-xs text-amber-800">
              <span>🏆</span>
              {contest.first_prize && <span>{contest.first_prize}</span>}
              {contest.certificate && <span>• 证书</span>}
            </div>
          </div>
        )}

        {/* 底部操作 */}
        <div className="flex items-center justify-between pt-4 border-t border-neutral-100">
          <div className="text-xs text-neutral-500">
            ID: #{contest.id}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                window.location.href = `/admin/contest/${contest.id}`;
              }}
              className="px-3 py-1.5 text-sm font-medium text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
            >
              查看详情
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ContestList;
