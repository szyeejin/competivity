import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Badge from '../../UI/Badge';
import Button from '../../UI/Button';

/**
 * 审核列表表格组件 - 互联网大厂设计
 * 特性：动画效果、状态标签、快速操作
 */
const ReviewTable = ({ contests, onReview, onViewConflicts }) => {
  const [sortField, setSortField] = useState('submitTime');
  const [sortOrder, setSortOrder] = useState('desc');
  const [expandedRows, setExpandedRows] = useState([]);

  // 状态配置
  const statusConfig = {
    pending: { label: '待审核', variant: 'warning', icon: '⏳' },
    reviewing: { label: '审核中', variant: 'info', icon: '🔍' },
    approved: { label: '已通过', variant: 'success', icon: '✅' },
    rejected: { label: '已驳回', variant: 'danger', icon: '❌' },
  };

  // 等级配置
  const levelConfig = {
    '国际级': { variant: 'danger', icon: '🌍' },
    '国家级': { variant: 'warning', icon: '🏆' },
    '省级': { variant: 'info', icon: '🎯' },
    '校级': { variant: 'default', icon: '🏫' },
  };

  // 优先级配置
  const priorityConfig = {
    high: { label: '高', variant: 'danger', icon: '🔥' },
    medium: { label: '中', variant: 'warning', icon: '⚡' },
    low: { label: '低', variant: 'default', icon: '📌' },
  };

  // 排序处理
  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  // 展开/收起行详情
  const toggleRow = (id) => {
    setExpandedRows(prev =>
      prev.includes(id) ? prev.filter(rowId => rowId !== id) : [...prev, id]
    );
  };

  // 排序数据
  const sortedContests = [...contests].sort((a, b) => {
    const aVal = a[sortField];
    const bVal = b[sortField];
    const multiplier = sortOrder === 'asc' ? 1 : -1;
    
    if (typeof aVal === 'string') {
      return aVal.localeCompare(bVal) * multiplier;
    }
    return (aVal - bVal) * multiplier;
  });

  const tableVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  };

  const rowVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { type: 'spring', stiffness: 100, damping: 15 },
    },
    exit: { opacity: 0, x: 20 },
  };

  if (contests.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-12 text-center">
        <div className="text-6xl mb-4">📭</div>
        <h3 className="text-lg font-semibold text-neutral-700 mb-2">暂无数据</h3>
        <p className="text-sm text-neutral-500">当前筛选条件下没有赛事申请</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-neutral-200 overflow-hidden">
      {/* 表格头部 */}
      <div className="px-6 py-4 border-b border-neutral-200 bg-neutral-50">
        <h3 className="text-lg font-semibold text-neutral-900">
          审核列表
          <span className="ml-2 text-sm font-normal text-neutral-500">
            （共 {contests.length} 项）
          </span>
        </h3>
      </div>

      {/* 表格内容 */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-neutral-50 border-b border-neutral-200">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-neutral-600 uppercase tracking-wider">
                赛事信息
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-neutral-600 uppercase tracking-wider">
                等级/类别
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-neutral-600 uppercase tracking-wider">
                参与/预算
              </th>
              <th 
                className="px-6 py-4 text-left text-xs font-semibold text-neutral-600 uppercase tracking-wider cursor-pointer hover:text-primary-600 transition-colors"
                onClick={() => handleSort('submitTime')}
              >
                <span className="flex items-center gap-1">
                  提交时间
                  {sortField === 'submitTime' && (
                    <span>{sortOrder === 'asc' ? '↑' : '↓'}</span>
                  )}
                </span>
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-neutral-600 uppercase tracking-wider">
                状态
              </th>
              <th className="px-6 py-4 text-right text-xs font-semibold text-neutral-600 uppercase tracking-wider">
                操作
              </th>
            </tr>
          </thead>
          <motion.tbody
            variants={tableVariants}
            initial="hidden"
            animate="visible"
            className="divide-y divide-neutral-200"
          >
            <AnimatePresence mode="popLayout">
              {sortedContests.map((contest) => {
                const isExpanded = expandedRows.includes(contest.id);
                const status = statusConfig[contest.status];
                const level = levelConfig[contest.level];
                const priority = priorityConfig[contest.priority];

                return (
                  <React.Fragment key={contest.id}>
                    <motion.tr
                      variants={rowVariants}
                      layout
                      className="hover:bg-neutral-50 transition-colors group"
                    >
                      {/* 赛事信息 */}
                      <td className="px-6 py-4">
                        <div className="flex items-start gap-3">
                          <button
                            onClick={() => toggleRow(contest.id)}
                            className="mt-1 text-neutral-400 hover:text-primary-600 transition-colors"
                          >
                            <motion.span
                              animate={{ rotate: isExpanded ? 90 : 0 }}
                              transition={{ duration: 0.2 }}
                            >
                              ▶
                            </motion.span>
                          </button>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="text-sm font-semibold text-neutral-900 truncate">
                                {contest.name}
                              </h4>
                              {contest.priority === 'high' && (
                                <Badge variant="danger" size="sm" pulse>
                                  {priority.icon} 紧急
                                </Badge>
                              )}
                            </div>
                            <p className="text-xs text-neutral-500">
                              主办方: {contest.organizer}
                            </p>
                            <p className="text-xs text-neutral-400 mt-0.5">
                              申请人: {contest.applicant}
                            </p>
                            {contest.conflicts.length > 0 && (
                              <div className="flex items-center gap-1 mt-1">
                                <span className="text-xs text-amber-600 font-medium">
                                  ⚠️ {contest.conflicts.length} 个冲突
                                </span>
                                <button
                                  onClick={() => onViewConflicts(contest)}
                                  className="text-xs text-primary-600 hover:text-primary-700 hover:underline"
                                >
                                  查看详情
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* 等级/类别 */}
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <Badge variant={level.variant} size="sm">
                            {level.icon} {contest.level}
                          </Badge>
                          <div className="text-xs text-neutral-500">
                            {contest.category}
                          </div>
                        </div>
                      </td>

                      {/* 参与/预算 */}
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <div className="text-sm text-neutral-700">
                            👥 {contest.participants} 人
                          </div>
                          <div className="text-xs text-neutral-500">
                            💰 ¥{contest.budget.toLocaleString()}
                          </div>
                        </div>
                      </td>

                      {/* 提交时间 */}
                      <td className="px-6 py-4">
                        <div className="text-sm text-neutral-700">
                          {contest.submitTime.split(' ')[0]}
                        </div>
                        <div className="text-xs text-neutral-500">
                          {contest.submitTime.split(' ')[1]}
                        </div>
                      </td>

                      {/* 状态 */}
                      <td className="px-6 py-4">
                        <Badge variant={status.variant} size="md">
                          {status.icon} {status.label}
                        </Badge>
                        {contest.priority === 'high' && contest.status === 'pending' && (
                          <motion.div
                            animate={{ opacity: [0.5, 1, 0.5] }}
                            transition={{ repeat: Infinity, duration: 2 }}
                            className="text-xs text-amber-600 font-medium mt-1"
                          >
                            需优先处理
                          </motion.div>
                        )}
                      </td>

                      {/* 操作 */}
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {contest.status === 'pending' || contest.status === 'reviewing' ? (
                            <Button
                              variant="primary"
                              size="sm"
                              onClick={() => onReview(contest)}
                            >
                              立即审核
                            </Button>
                          ) : (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => onReview(contest)}
                            >
                              查看详情
                            </Button>
                          )}
                        </div>
                      </td>
                    </motion.tr>

                    {/* 展开的详细信息 */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.tr
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <td colSpan="6" className="px-6 py-4 bg-neutral-50">
                            <div className="space-y-3">
                              {/* 冲突信息 */}
                              {contest.conflicts.length > 0 && (
                                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                                  <h5 className="text-sm font-semibold text-amber-800 mb-2">
                                    ⚠️ 检测到以下冲突：
                                  </h5>
                                  <div className="space-y-1">
                                    {contest.conflicts.map((conflict, idx) => (
                                      <div key={idx} className="text-sm text-amber-700">
                                        • {conflict}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* 审核信息 */}
                              {contest.reviewer && (
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                  <h5 className="text-sm font-semibold text-blue-800 mb-2">
                                    审核信息
                                  </h5>
                                  <div className="grid grid-cols-2 gap-2 text-sm">
                                    <div>
                                      <span className="text-neutral-600">审核人：</span>
                                      <span className="text-neutral-800 font-medium">
                                        {contest.reviewer}
                                      </span>
                                    </div>
                                    <div>
                                      <span className="text-neutral-600">审核时间：</span>
                                      <span className="text-neutral-800">
                                        {contest.reviewTime}
                                      </span>
                                    </div>
                                  </div>
                                  {contest.rejectReason && (
                                    <div className="mt-2">
                                      <span className="text-neutral-600">驳回原因：</span>
                                      <p className="text-red-700 mt-1">{contest.rejectReason}</p>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          </td>
                        </motion.tr>
                      )}
                    </AnimatePresence>
                  </React.Fragment>
                );
              })}
            </AnimatePresence>
          </motion.tbody>
        </table>
      </div>
    </div>
  );
};

export default ReviewTable;
