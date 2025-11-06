import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { API_ENDPOINTS } from '../../../config/api';
import Button from '../../UI/Button';
import Badge from '../../UI/Badge';

/**
 * 报名审核页面
 * 功能：审核学生报名申请、批量操作、详情查看
 */
const RegistrationReview = () => {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pending'); // pending, approved, rejected
  const [selectedIds, setSelectedIds] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRegistration, setSelectedRegistration] = useState(null);
  const [showDetail, setShowDetail] = useState(false);

  useEffect(() => {
    fetchRegistrations();
  }, []);

  // 获取报名数据
  const fetchRegistrations = async () => {
    try {
      setLoading(true);
      const response = await fetch(API_ENDPOINTS.REGISTRATIONS.LIST);
      const result = await response.json();
      
      if (result.success) {
        // 转换字段名：下划线转驼峰
        const formattedData = (result.data || []).map(reg => ({
          ...reg,
          studentName: reg.student_name,
          studentId: reg.student_id,
          contestName: reg.contest_name || '未知赛事',
          contestId: reg.contest_id,
          className: reg.class_name,
          teamName: reg.team_name,
          teamRole: reg.team_role,
          rejectReason: reg.reject_reason,
          reviewerName: reg.reviewer_name,
          reviewTime: reg.review_time,
          appliedAt: reg.applied_at,
          createdAt: reg.created_at
        }));
        setRegistrations(formattedData);
      } else {
        console.error('获取报名数据失败:', result.message);
      }
    } catch (err) {
      console.error('获取报名数据失败:', err);
    } finally {
      setLoading(false);
    }
  };

  // 审核通过
  const handleApprove = async (id) => {
    try {
      const response = await fetch(API_ENDPOINTS.REGISTRATIONS.APPROVE(id), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reviewer_name: '管理员' })
      });
      
      const result = await response.json();
      
      if (result.success) {
        alert('审核通过！');
        fetchRegistrations(); // 刷新列表
      } else {
        alert('审核失败：' + result.message);
      }
    } catch (err) {
      console.error('审核失败:', err);
      alert('审核失败：' + err.message);
    }
  };

  // 审核驳回
  const handleReject = async (id, reason) => {
    try {
      const response = await fetch(API_ENDPOINTS.REGISTRATIONS.REJECT(id), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          reason: reason,
          reviewer_name: '管理员' 
        })
      });
      
      const result = await response.json();
      
      if (result.success) {
        alert('已驳回！');
        fetchRegistrations(); // 刷新列表
      } else {
        alert('驳回失败：' + result.message);
      }
    } catch (err) {
      console.error('驳回失败:', err);
      alert('驳回失败：' + err.message);
    }
  };

  // 批量审核
  const handleBatchApprove = async () => {
    if (selectedIds.length === 0) {
      alert('请选择要审核的报名');
      return;
    }

    if (!confirm(`确定要批量通过 ${selectedIds.length} 个报名吗？`)) {
      return;
    }

    try {
      const response = await fetch(API_ENDPOINTS.REGISTRATIONS.BATCH_APPROVE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          ids: selectedIds,
          reviewer_name: '管理员' 
        })
      });
      
      const result = await response.json();
      
      if (result.success) {
        alert(result.message || '批量审核成功！');
        setSelectedIds([]);
        fetchRegistrations(); // 刷新列表
      } else {
        alert('批量审核失败：' + result.message);
      }
    } catch (err) {
      console.error('批量审核失败:', err);
      alert('批量审核失败：' + err.message);
    }
  };

  // 切换选择
  const toggleSelect = (id) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(sid => sid !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  // 筛选数据
  const filteredRegistrations = registrations.filter(reg => {
    const matchStatus = reg.status === activeTab;
    const matchSearch = 
      reg.studentName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      reg.studentId?.includes(searchQuery) ||
      reg.contestName?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchStatus && matchSearch;
  });

  const tabs = [
    { id: 'pending', label: '待审核', icon: '⏳', count: registrations.filter(r => r.status === 'pending').length },
    { id: 'approved', label: '已通过', icon: '✅', count: registrations.filter(r => r.status === 'approved').length },
    { id: 'rejected', label: '已驳回', icon: '❌', count: registrations.filter(r => r.status === 'rejected').length },
  ];

  return (
    <div className="space-y-6">
      {/* 页面头部 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 flex items-center gap-3">
            <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg">
              📝
            </span>
            报名审核
          </h1>
          <p className="mt-1 text-sm text-neutral-500">
            审核学生报名申请
          </p>
        </div>

        {selectedIds.length > 0 && (
          <div className="flex items-center gap-3">
            <Button
              variant="primary"
              size="md"
              onClick={handleBatchApprove}
            >
              <span className="mr-2">✅</span>
              批量通过 ({selectedIds.length})
            </Button>
          </div>
        )}
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard title="待审核" value={registrations.filter(r => r.status === 'pending').length} icon="⏳" color="amber" />
        <StatCard title="已通过" value={registrations.filter(r => r.status === 'approved').length} icon="✅" color="green" />
        <StatCard title="已驳回" value={registrations.filter(r => r.status === 'rejected').length} icon="❌" color="red" />
      </div>

      {/* 主内容区 */}
      <div className="bg-white rounded-xl shadow-sm border border-neutral-200 overflow-hidden">
        {/* 标签页 */}
        <div className="flex items-center gap-2 p-4 border-b border-neutral-200">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2
                ${activeTab === tab.id
                  ? 'bg-primary-500 text-white shadow-md'
                  : 'text-neutral-600 hover:bg-neutral-100'
                }
              `}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
              {tab.count > 0 && (
                <span className={`
                  px-2 py-0.5 rounded-full text-xs font-semibold
                  ${activeTab === tab.id ? 'bg-white text-primary-600' : 'bg-neutral-200 text-neutral-700'}
                `}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* 搜索栏 */}
        <div className="p-4 border-b border-neutral-200">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="搜索学生姓名、学号或赛事名称..."
            className="w-full px-4 py-2 bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>

        {/* 报名列表 */}
        <div className="p-6">
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="mt-4 text-neutral-600">加载中...</p>
            </div>
          ) : filteredRegistrations.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📋</div>
              <h3 className="text-lg font-semibold text-neutral-900 mb-2">暂无报名</h3>
              <p className="text-neutral-500">当前筛选条件下没有报名记录</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredRegistrations.map((registration, index) => (
                <RegistrationCard
                  key={registration.id}
                  registration={registration}
                  index={index}
                  selected={selectedIds.includes(registration.id)}
                  onSelect={toggleSelect}
                  onApprove={handleApprove}
                  onReject={handleReject}
                  onViewDetail={() => {
                    setSelectedRegistration(registration);
                    setShowDetail(true);
                  }}
                  showActions={activeTab === 'pending'}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 详情弹窗 */}
      <AnimatePresence>
        {showDetail && selectedRegistration && (
          <DetailModal
            registration={selectedRegistration}
            onClose={() => {
              setShowDetail(false);
              setSelectedRegistration(null);
            }}
            onApprove={handleApprove}
            onReject={handleReject}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

// 统计卡片
const StatCard = ({ title, value, icon, color }) => {
  const colorClasses = {
    amber: 'from-amber-400 to-orange-500',
    green: 'from-green-400 to-green-600',
    red: 'from-red-400 to-red-600',
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

// 报名卡片
const RegistrationCard = ({ registration, index, selected, onSelect, onApprove, onReject, onViewDetail, showActions }) => {
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      className="bg-neutral-50 rounded-lg p-4 border border-neutral-200 hover:border-primary-300 hover:shadow-md transition-all"
    >
      <div className="flex items-start gap-4">
        {showActions && (
          <input
            type="checkbox"
            checked={selected}
            onChange={() => onSelect(registration.id)}
            className="mt-1 w-5 h-5 text-primary-600 rounded focus:ring-primary-500"
          />
        )}

        <div className="flex-1">
          <div className="flex items-start justify-between mb-3">
            <div>
              <h3 className="font-semibold text-neutral-900 text-lg">{registration.studentName}</h3>
              <div className="flex items-center gap-4 mt-1 text-sm text-neutral-600">
                <span>🎓 {registration.studentId}</span>
                <span>📚 {registration.major}</span>
                <span>📅 {registration.grade}</span>
              </div>
            </div>
            {!showActions && (
              <Badge 
                variant={registration.status === 'approved' ? 'success' : 'danger'} 
                size="sm"
              >
                {registration.status === 'approved' ? '✅ 已通过' : '❌ 已驳回'}
              </Badge>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4 mb-3">
            <div className="text-sm">
              <span className="text-neutral-600">报名赛事：</span>
              <span className="font-medium text-neutral-900">{registration.contestName}</span>
            </div>
            <div className="text-sm">
              <span className="text-neutral-600">团队角色：</span>
              <span className="font-medium text-neutral-900">{registration.role} - {registration.teamName}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 mb-3">
            {registration.skills.map((skill, idx) => (
              <span key={idx} className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                {skill}
              </span>
            ))}
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-neutral-200">
            <span className="text-xs text-neutral-500">
              申请时间：{new Date(registration.appliedAt).toLocaleString('zh-CN')}
            </span>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={onViewDetail}>
                查看详情
              </Button>
              {showActions && (
                <>
                  <Button 
                    variant="primary" 
                    size="sm" 
                    onClick={() => onApprove(registration.id)}
                  >
                    ✅ 通过
                  </Button>
                  <Button 
                    variant="danger" 
                    size="sm" 
                    onClick={() => setShowRejectModal(true)}
                  >
                    ❌ 驳回
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 驳回原因输入 */}
      {showRejectModal && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <label className="block text-sm font-medium text-neutral-900 mb-2">
            驳回原因
          </label>
          <textarea
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            placeholder="请输入驳回原因..."
            rows={3}
            className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
          />
          <div className="flex items-center gap-2 mt-3">
            <Button
              variant="danger"
              size="sm"
              onClick={() => {
                if (!rejectReason.trim()) {
                  alert('请输入驳回原因');
                  return;
                }
                onReject(registration.id, rejectReason);
                setShowRejectModal(false);
                setRejectReason('');
              }}
            >
              确认驳回
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setShowRejectModal(false);
                setRejectReason('');
              }}
            >
              取消
            </Button>
          </div>
        </div>
      )}
    </motion.div>
  );
};

// 详情弹窗
const DetailModal = ({ registration, onClose, onApprove, onReject }) => {
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
        className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white border-b border-neutral-200 p-6 flex items-center justify-between">
          <h2 className="text-xl font-bold text-neutral-900">报名详情</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-neutral-100 flex items-center justify-center text-neutral-600"
          >
            ✕
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* 学生信息 */}
          <div>
            <h3 className="font-semibold text-neutral-900 mb-3">👨‍🎓 学生信息</h3>
            <div className="bg-neutral-50 rounded-lg p-4 space-y-2">
              <div className="flex justify-between">
                <span className="text-neutral-600">姓名</span>
                <span className="font-medium">{registration.studentName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-600">学号</span>
                <span className="font-medium">{registration.studentId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-600">专业</span>
                <span className="font-medium">{registration.major}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-600">年级</span>
                <span className="font-medium">{registration.grade}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-600">邮箱</span>
                <span className="font-medium">{registration.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-600">手机</span>
                <span className="font-medium">{registration.phone}</span>
              </div>
            </div>
          </div>

          {/* 报名信息 */}
          <div>
            <h3 className="font-semibold text-neutral-900 mb-3">🏆 报名信息</h3>
            <div className="bg-neutral-50 rounded-lg p-4 space-y-2">
              <div className="flex justify-between">
                <span className="text-neutral-600">赛事名称</span>
                <span className="font-medium">{registration.contestName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-600">团队名称</span>
                <span className="font-medium">{registration.teamName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-600">担任角色</span>
                <span className="font-medium">{registration.role}</span>
              </div>
            </div>
          </div>

          {/* 技能特长 */}
          <div>
            <h3 className="font-semibold text-neutral-900 mb-3">💪 技能特长</h3>
            <div className="flex flex-wrap gap-2">
              {registration.skills.map((skill, idx) => (
                <span key={idx} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {/* 竞赛经验 */}
          <div>
            <h3 className="font-semibold text-neutral-900 mb-3">🎖️ 竞赛经验</h3>
            <div className="bg-neutral-50 rounded-lg p-4">
              <p className="text-neutral-700 whitespace-pre-wrap">{registration.experience}</p>
            </div>
          </div>

          {/* 参赛动机 */}
          <div>
            <h3 className="font-semibold text-neutral-900 mb-3">💡 参赛动机</h3>
            <div className="bg-neutral-50 rounded-lg p-4">
              <p className="text-neutral-700 whitespace-pre-wrap">{registration.motivation}</p>
            </div>
          </div>
        </div>

        {/* 操作按钮 */}
        {registration.status === 'pending' && (
          <div className="sticky bottom-0 bg-white border-t border-neutral-200 p-6 flex items-center justify-end gap-3">
            <Button variant="outline" onClick={onClose}>
              关闭
            </Button>
            <Button variant="danger" onClick={() => {
              const reason = prompt('请输入驳回原因：');
              if (reason) {
                onReject(registration.id, reason);
                onClose();
              }
            }}>
              ❌ 驳回
            </Button>
            <Button variant="primary" onClick={() => {
              onApprove(registration.id);
              onClose();
            }}>
              ✅ 通过
            </Button>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};

export default RegistrationReview;
