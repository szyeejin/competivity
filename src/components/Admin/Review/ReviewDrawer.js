import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Button from '../../UI/Button';
import Badge from '../../UI/Badge';
import Switch from '../../UI/Switch';

/**
 * 审核详情抽屉组件 - 侧边滑出面板
 * 特性：完整审核信息、审核表单、快速操作
 * 性能优化：使用 tween 动画、硬件加速、平滑滚动
 */
const ReviewDrawer = ({ contest, onClose, onSubmit }) => {
  const [reviewResult, setReviewResult] = useState(null);
  const [comment, setComment] = useState('');
  const [checklist, setChecklist] = useState({
    timeConflict: false,
    venueConflict: false,
    resourceConflict: false,
    budgetValid: false,
    rulesValid: false,
    complianceValid: false,
  });

  // 审核项配置
  const checklistItems = [
    { id: 'timeConflict', label: '时间地点冲突检查', icon: '📅', tip: '检查是否与其他赛事时间冲突' },
    { id: 'venueConflict', label: '场地资源冲突检查', icon: '🏢', tip: '检查场地是否可用' },
    { id: 'resourceConflict', label: '资源使用冲突检查', icon: '⚙️', tip: '检查设备、人员等资源冲突' },
    { id: 'budgetValid', label: '预算合规性审核', icon: '💰', tip: '检查预算是否合理' },
    { id: 'rulesValid', label: '规则合理性审核', icon: '📋', tip: '审核赛事规则是否完善' },
    { id: 'complianceValid', label: '合规性问题审核', icon: '✅', tip: '检查是否符合相关政策要求' },
  ];

  // 处理审核项变更
  const handleChecklistChange = (id, value) => {
    setChecklist(prev => ({ ...prev, [id]: value }));
  };

  // 提交审核
  const handleSubmitReview = () => {
    if (!reviewResult) {
      alert('请选择审核结果');
      return;
    }
    
    if (reviewResult === 'rejected' && !comment.trim()) {
      alert('驳回时必须填写理由');
      return;
    }
    
    onSubmit(contest.id, reviewResult, comment);
  };

  // 快速通过
  const handleQuickApprove = () => {
    setReviewResult('approved');
    setComment('审核通过，符合要求');
    setTimeout(() => {
      onSubmit(contest.id, 'approved', '审核通过，符合要求');
    }, 100);
  };

  // 审核完成度
  const completedChecks = Object.values(checklist).filter(Boolean).length;
  const totalChecks = Object.keys(checklist).length;
  const progress = (completedChecks / totalChecks) * 100;

  return (
    <>
      {/* 背景遮罩 */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
      />

      {/* 抽屉内容 */}
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ 
          type: 'tween',
          duration: 0.3,
          ease: [0.4, 0, 0.2, 1]  // cubic-bezier 缓动函数，更平滑
        }}
        style={{ 
          willChange: 'transform',  // 提示浏览器优化这个属性
          transform: 'translateZ(0)'  // 启用硬件加速
        }}
        className="fixed right-0 top-0 bottom-0 w-full max-w-2xl bg-white shadow-2xl z-50 overflow-hidden flex flex-col"
      >
        {/* 头部 */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 bg-gradient-to-r from-primary-50 to-primary-100">
          <div>
            <h2 className="text-xl font-bold text-neutral-900 flex items-center gap-2">
              <span className="text-2xl">🔍</span>
              赛事审核
            </h2>
            <p className="text-sm text-neutral-600 mt-1">
              审核编号: #{contest.id}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full hover:bg-white/50 flex items-center justify-center text-neutral-600 hover:text-neutral-900 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* 内容区域 */}
        <div 
          className="flex-1 overflow-y-auto p-6 space-y-6"
          style={{
            WebkitOverflowScrolling: 'touch',  // iOS 平滑滚动
            scrollBehavior: 'smooth',  // 平滑滚动
            overscrollBehavior: 'contain'  // 防止滚动链
          }}
        >
          {/* 赛事基本信息 */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
            <h3 className="text-lg font-semibold text-neutral-900 mb-4 flex items-center gap-2">
              <span>📋</span>
              赛事基本信息
            </h3>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-neutral-600 font-medium">赛事名称</label>
                  <p className="text-sm text-neutral-900 font-semibold mt-1">{contest.name}</p>
                </div>
                <div>
                  <label className="text-xs text-neutral-600 font-medium">赛事等级</label>
                  <div className="mt-1">
                    <Badge variant="warning" size="sm">{contest.level}</Badge>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-neutral-600 font-medium">主办方</label>
                  <p className="text-sm text-neutral-800 mt-1">{contest.organizer}</p>
                </div>
                <div>
                  <label className="text-xs text-neutral-600 font-medium">赛事类别</label>
                  <p className="text-sm text-neutral-800 mt-1">{contest.category}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-neutral-600 font-medium">申请人</label>
                  <p className="text-sm text-neutral-800 mt-1">{contest.applicant}</p>
                </div>
                <div>
                  <label className="text-xs text-neutral-600 font-medium">提交时间</label>
                  <p className="text-sm text-neutral-800 mt-1">{contest.submitTime}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-neutral-600 font-medium">预计参与人数</label>
                  <p className="text-sm text-neutral-800 mt-1 font-semibold">
                    👥 {contest.participants} 人
                  </p>
                </div>
                <div>
                  <label className="text-xs text-neutral-600 font-medium">预算金额</label>
                  <p className="text-sm text-neutral-800 mt-1 font-semibold">
                    💰 ¥{contest.budget.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* 冲突警告 */}
          {contest.conflicts.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="bg-amber-50 border-2 border-amber-300 rounded-xl p-5"
            >
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-10 h-10 bg-amber-400 rounded-full flex items-center justify-center text-white text-xl">
                  ⚠️
                </div>
                <div className="flex-1">
                  <h4 className="text-base font-semibold text-amber-900 mb-2">
                    检测到 {contest.conflicts.length} 个冲突
                  </h4>
                  <ul className="space-y-1">
                    {contest.conflicts.map((conflict, idx) => (
                      <li key={idx} className="text-sm text-amber-800">
                        • {conflict}
                      </li>
                    ))}
                  </ul>
                  <p className="text-xs text-amber-700 mt-3">
                    💡 建议：请与申请人沟通解决冲突后再进行审核
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {/* 审核检查清单 */}
          <div className="bg-white rounded-xl border border-neutral-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-neutral-900 flex items-center gap-2">
                <span>✅</span>
                审核检查清单
              </h3>
              <div className="text-sm">
                <span className="text-neutral-600">完成度：</span>
                <span className="font-semibold text-primary-600">
                  {completedChecks}/{totalChecks}
                </span>
              </div>
            </div>

            {/* 进度条 */}
            <div className="mb-6">
              <div className="h-2 bg-neutral-100 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.3, ease: 'easeInOut' }}
                  style={{ willChange: 'width' }}
                  className="h-full bg-gradient-to-r from-primary-500 to-primary-600"
                />
              </div>
            </div>

            {/* 检查项列表 */}
            <div className="space-y-4">
              {checklistItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-start gap-3 p-3 rounded-lg hover:bg-neutral-50 transition-colors"
                >
                  <span className="text-2xl flex-shrink-0">{item.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-sm font-medium text-neutral-800">
                        {item.label}
                      </label>
                      <Switch
                        checked={checklist[item.id]}
                        onChange={(checked) => handleChecklistChange(item.id, checked)}
                        size="sm"
                      />
                    </div>
                    <p className="text-xs text-neutral-500">{item.tip}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 审核结果选择 */}
          <div className="bg-white rounded-xl border border-neutral-200 p-6">
            <h3 className="text-lg font-semibold text-neutral-900 mb-4 flex items-center gap-2">
              <span>🎯</span>
              审核结果
            </h3>
            
            <div className="grid grid-cols-2 gap-3 mb-4">
              <button
                onClick={() => setReviewResult('approved')}
                className={`
                  p-4 rounded-xl border-2 transition-all
                  ${reviewResult === 'approved'
                    ? 'border-green-500 bg-green-50 shadow-lg'
                    : 'border-neutral-200 hover:border-green-300 hover:bg-green-50/50'
                  }
                `}
              >
                <div className="text-3xl mb-2">✅</div>
                <div className="text-sm font-semibold text-neutral-900">通过审核</div>
                <div className="text-xs text-neutral-500 mt-1">赛事符合要求</div>
              </button>
              
              <button
                onClick={() => setReviewResult('rejected')}
                className={`
                  p-4 rounded-xl border-2 transition-all
                  ${reviewResult === 'rejected'
                    ? 'border-red-500 bg-red-50 shadow-lg'
                    : 'border-neutral-200 hover:border-red-300 hover:bg-red-50/50'
                  }
                `}
              >
                <div className="text-3xl mb-2">❌</div>
                <div className="text-sm font-semibold text-neutral-900">驳回申请</div>
                <div className="text-xs text-neutral-500 mt-1">需要修改后重新提交</div>
              </button>
            </div>

            {/* 审核意见 */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                审核意见 {reviewResult === 'rejected' && <span className="text-red-500">*</span>}
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder={
                  reviewResult === 'approved'
                    ? '选填：可以添加审核通过的说明...'
                    : reviewResult === 'rejected'
                    ? '必填：请详细说明驳回原因，以便申请人修改...'
                    : '请先选择审核结果'
                }
                rows={4}
                className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
              />
              <p className="text-xs text-neutral-500 mt-2">
                💡 提示：清晰的审核意见有助于申请人了解审核结果
              </p>
            </div>
          </div>
        </div>

        {/* 底部操作栏 */}
        <div className="border-t border-neutral-200 p-6 bg-neutral-50">
          <div className="flex items-center justify-between gap-4">
            <Button
              variant="outline"
              size="lg"
              onClick={onClose}
              className="flex-1"
            >
              取消
            </Button>
            
            {contest.status === 'pending' && contest.conflicts.length === 0 && (
              <Button
                variant="success"
                size="lg"
                onClick={handleQuickApprove}
                className="flex-1"
              >
                <span className="mr-2">⚡</span>
                快速通过
              </Button>
            )}
            
            <Button
              variant="primary"
              size="lg"
              onClick={handleSubmitReview}
              disabled={!reviewResult}
              className="flex-1"
            >
              <span className="mr-2">📝</span>
              提交审核
            </Button>
          </div>
        </div>
      </motion.div>
    </>
  );
};

export default ReviewDrawer;
