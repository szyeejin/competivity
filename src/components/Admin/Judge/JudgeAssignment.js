import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { API_ENDPOINTS } from '../../../config/api';
import Button from '../../UI/Button';
import Badge from '../../UI/Badge';

/**
 * 评审分配页面
 * 功能：分配评审专家、查看评审进度、管理评审任务
 */
const JudgeAssignment = () => {
  const [assignments, setAssignments] = useState([]);
  const [experts, setExperts] = useState([]);
  const [contests, setContests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterContest, setFilterContest] = useState('all');
  const [showAssignModal, setShowAssignModal] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  // 获取数据
  const fetchData = async () => {
    try {
      setLoading(true);
      
      // 并行获取数据
      const [assignmentsRes, expertsRes, contestsRes] = await Promise.all([
        fetch(API_ENDPOINTS.JUDGE_ASSIGNMENTS.LIST),
        fetch(API_ENDPOINTS.EXPERTS.LIST),
        fetch(API_ENDPOINTS.CONTESTS.LIST)
      ]);

      const [assignmentsData, expertsData, contestsData] = await Promise.all([
        assignmentsRes.json(),
        expertsRes.json(),
        contestsRes.json()
      ]);

      if (assignmentsData.success) setAssignments(assignmentsData.data || []);
      if (expertsData.success) setExperts(expertsData.data || []);
      if (contestsData.success) setContests(contestsData.data || []);
    } catch (err) {
      console.error('获取数据失败:', err);
    } finally {
      setLoading(false);
    }
  };

  // 筛选分配
  const filteredAssignments = assignments.filter(assignment => {
    const matchStatus = filterStatus === 'all' || assignment.status === filterStatus;
    const matchContest = filterContest === 'all' || assignment.contest_id === parseInt(filterContest);
    return matchStatus && matchContest;
  });

  // 统计数据
  const stats = {
    total: assignments.length,
    pending: assignments.filter(a => a.status === 'pending').length,
    accepted: assignments.filter(a => a.status === 'accepted').length,
    completed: assignments.filter(a => a.status === 'completed').length
  };

  return (
    <div className="space-y-6">
      {/* 页面头部 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 flex items-center gap-3">
            <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg">
              📋
            </span>
            评审分配
          </h1>
          <p className="mt-1 text-sm text-neutral-500">
            管理赛事评审任务分配
          </p>
        </div>

        <Button variant="primary" size="md" onClick={() => setShowAssignModal(true)}>
          <span className="mr-2">➕</span>
          分配评审
        </Button>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard title="总分配数" value={stats.total} icon="📋" color="blue" />
        <StatCard title="待确认" value={stats.pending} icon="⏳" color="amber" />
        <StatCard title="已接受" value={stats.accepted} icon="✅" color="green" />
        <StatCard title="已完成" value={stats.completed} icon="🎯" color="purple" />
      </div>

      {/* 筛选栏 */}
      <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* 状态筛选 */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="all">全部状态</option>
            <option value="pending">⏳ 待确认</option>
            <option value="accepted">✅ 已接受</option>
            <option value="rejected">❌ 已拒绝</option>
            <option value="completed">🎯 已完成</option>
          </select>

          {/* 赛事筛选 */}
          <select
            value={filterContest}
            onChange={(e) => setFilterContest(e.target.value)}
            className="px-4 py-2 bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="all">全部赛事</option>
            {contests.map(contest => (
              <option key={contest.id} value={contest.id}>{contest.name}</option>
            ))}
          </select>
        </div>

        <div className="mt-4 text-sm text-neutral-600">
          共 {assignments.length} 个分配，筛选结果: {filteredAssignments.length} 个
        </div>
      </div>

      {/* 分配列表 */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-neutral-600">加载中...</p>
          </div>
        ) : filteredAssignments.length === 0 ? (
          <div className="bg-white rounded-xl border border-neutral-200 p-12 text-center">
            <div className="text-6xl mb-4">📋</div>
            <h3 className="text-lg font-semibold text-neutral-900 mb-2">暂无分配</h3>
            <p className="text-neutral-500">当前筛选条件下没有评审分配</p>
          </div>
        ) : (
          filteredAssignments.map((assignment, index) => (
            <AssignmentCard
              key={assignment.id}
              assignment={assignment}
              index={index}
            />
          ))
        )}
      </div>

      {/* 分配弹窗 */}
      <AnimatePresence>
        {showAssignModal && (
          <AssignModal
            experts={experts}
            contests={contests}
            onClose={() => setShowAssignModal(false)}
            onSuccess={() => {
              setShowAssignModal(false);
              fetchData();
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

// 统计卡片
const StatCard = ({ title, value, icon, color }) => {
  const colorClasses = {
    blue: 'from-blue-400 to-blue-600',
    amber: 'from-amber-400 to-orange-500',
    green: 'from-green-400 to-green-600',
    purple: 'from-purple-400 to-purple-600',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl border border-neutral-200 p-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-neutral-600 mb-1">{title}</p>
          <p className="text-3xl font-bold text-neutral-900">{value}</p>
        </div>
        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${colorClasses[color]} flex items-center justify-center text-white text-2xl shadow-lg`}>
          {icon}
        </div>
      </div>
    </motion.div>
  );
};

// 分配卡片
const AssignmentCard = ({ assignment, index }) => {
  const statusConfig = {
    pending: { label: '⏳ 待确认', color: 'warning' },
    accepted: { label: '✅ 已接受', color: 'success' },
    rejected: { label: '❌ 已拒绝', color: 'danger' },
    completed: { label: '🎯 已完成', color: 'info' }
  };

  const roleConfig = {
    primary: { label: '主评审', color: 'primary' },
    secondary: { label: '副评审', color: 'info' },
    reviewer: { label: '复审', color: 'default' }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="bg-white rounded-xl border border-neutral-200 p-6 hover:shadow-lg transition-all"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-xl font-bold text-neutral-900">{assignment.contest_name}</h3>
            <Badge variant={statusConfig[assignment.status]?.color}>
              {statusConfig[assignment.status]?.label}
            </Badge>
            <Badge variant={roleConfig[assignment.role]?.color} size="sm">
              {roleConfig[assignment.role]?.label}
            </Badge>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        {/* 专家信息 */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-lg font-bold">
              {assignment.expert_name?.charAt(0)}
            </div>
            <div className="flex-1">
              <div className="font-semibold text-neutral-900">{assignment.expert_name}</div>
              <div className="text-sm text-neutral-600">{assignment.expert_title}</div>
              <div className="text-xs text-neutral-500">{assignment.expert_organization}</div>
            </div>
          </div>
        </div>

        {/* 评审信息 */}
        <div className="bg-neutral-50 rounded-lg p-4">
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-neutral-600">分配日期：</span>
              <span className="font-medium">{assignment.assigned_date}</span>
            </div>
            {assignment.score && (
              <div className="flex justify-between">
                <span className="text-neutral-600">评审分数：</span>
                <span className="font-semibold text-blue-600">{assignment.score} 分</span>
              </div>
            )}
            {assignment.submitted_at && (
              <div className="flex justify-between">
                <span className="text-neutral-600">提交时间：</span>
                <span className="font-medium">{new Date(assignment.submitted_at).toLocaleDateString('zh-CN')}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 评审意见 */}
      {assignment.comments && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="text-sm font-semibold text-green-800 mb-2">💬 评审意见：</div>
          <div className="text-sm text-green-700">{assignment.comments}</div>
        </div>
      )}
    </motion.div>
  );
};

// 分配弹窗
const AssignModal = ({ experts, contests, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    contest_id: '',
    expert_id: '',
    role: 'primary'
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.contest_id || !formData.expert_id) {
      alert('请选择赛事和专家！');
      return;
    }

    try {
      setSubmitting(true);
      
      const response = await fetch(API_ENDPOINTS.JUDGE_ASSIGNMENTS.ASSIGN, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      const result = await response.json();
      
      if (result.success) {
        alert('分配成功！');
        onSuccess();
      } else {
        alert('分配失败：' + result.message);
      }
    } catch (err) {
      console.error('分配失败:', err);
      alert('分配失败：' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-xl shadow-2xl max-w-md w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="border-b border-neutral-200 p-6">
          <h2 className="text-xl font-bold text-neutral-900">分配评审</h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              选择赛事 <span className="text-red-500">*</span>
            </label>
            <select
              required
              value={formData.contest_id}
              onChange={(e) => setFormData({...formData, contest_id: e.target.value})}
              className="w-full px-4 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">请选择赛事</option>
              {contests.map(contest => (
                <option key={contest.id} value={contest.id}>{contest.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              选择专家 <span className="text-red-500">*</span>
            </label>
            <select
              required
              value={formData.expert_id}
              onChange={(e) => setFormData({...formData, expert_id: e.target.value})}
              className="w-full px-4 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">请选择专家</option>
              {experts.map(expert => (
                <option key={expert.id} value={expert.id}>
                  {expert.name} - {expert.title} ({expert.field})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              评审角色 <span className="text-red-500">*</span>
            </label>
            <select
              required
              value={formData.role}
              onChange={(e) => setFormData({...formData, role: e.target.value})}
              className="w-full px-4 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="primary">主评审</option>
              <option value="secondary">副评审</option>
              <option value="reviewer">复审</option>
            </select>
          </div>

          <div className="flex items-center gap-3 pt-4">
            <Button type="submit" variant="primary" disabled={submitting}>
              {submitting ? '分配中...' : '确认分配'}
            </Button>
            <Button type="button" variant="outline" onClick={onClose}>
              取消
            </Button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default JudgeAssignment;
