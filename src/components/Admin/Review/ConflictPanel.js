import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '../../UI/Button';
import Badge from '../../UI/Badge';

/**
 * 冲突检测面板组件 - 模态框展示
 * 特性：详细的冲突分析、解决建议、自动检测
 */
const ConflictPanel = ({ data, onClose }) => {
  const [activeTab, setActiveTab] = useState('overview');

  // 冲突类型详细配置
  const conflictDetails = {
    '时间冲突': {
      icon: '📅',
      color: 'amber',
      severity: 'high',
      description: '该赛事的时间安排与其他赛事存在重叠',
      conflicts: [
        {
          name: '全国大学生英语竞赛',
          time: '2024-11-15 09:00 - 12:00',
          overlap: '2小时重叠',
          venue: '教学楼A区',
        },
        {
          name: '数学建模初赛',
          time: '2024-11-15 10:00 - 14:00',
          overlap: '完全重叠',
          venue: '实验楼B区',
        },
      ],
      suggestions: [
        '建议调整赛事时间至11月16日',
        '可以考虑分批次进行，错开时间段',
        '与相关赛事负责人协调，调整其中一方时间',
      ],
    },
    '场地冲突': {
      icon: '🏢',
      color: 'red',
      severity: 'high',
      description: '申请的场地资源在该时段已被占用',
      conflicts: [
        {
          venue: '体育馆',
          occupied: '篮球联赛',
          time: '2024-11-15 全天',
          capacity: 1000,
        },
        {
          venue: '大礼堂',
          occupied: '学术讲座',
          time: '2024-11-15 14:00-17:00',
          capacity: 500,
        },
      ],
      suggestions: [
        '建议更换为室外运动场',
        '可以预约图书馆报告厅作为备选',
        '向场地管理部门申请协调使用时间',
      ],
    },
    '资源冲突': {
      icon: '⚙️',
      color: 'orange',
      severity: 'medium',
      description: '所需的设备或人力资源存在使用冲突',
      conflicts: [
        {
          resource: '音响设备（10套）',
          available: 5,
          required: 10,
          inUse: '音乐节活动',
        },
        {
          resource: '志愿者（50人）',
          available: 30,
          required: 50,
          inUse: '多个活动同时进行',
        },
      ],
      suggestions: [
        '减少设备需求或租赁外部设备',
        '提前一周发布志愿者招募通知',
        '与其他活动协调共享部分资源',
      ],
    },
    '预算超标': {
      icon: '💰',
      color: 'purple',
      severity: 'medium',
      description: '申请预算超出该级别赛事的标准范围',
      conflicts: [
        {
          item: '场地租赁',
          budget: 15000,
          standard: 10000,
          excess: 5000,
        },
        {
          item: '奖品费用',
          budget: 20000,
          standard: 15000,
          excess: 5000,
        },
      ],
      suggestions: [
        '优化预算分配，压缩非必要支出',
        '寻找赞助商分担部分费用',
        '申请专项资金支持',
      ],
    },
    '合规问题': {
      icon: '📋',
      color: 'red',
      severity: 'high',
      description: '赛事存在不符合相关规定的情况',
      conflicts: [
        {
          issue: '缺少安全应急预案',
          requirement: '大型活动必须提供',
          status: '未提交',
        },
        {
          issue: '参赛资格限制不明确',
          requirement: '需明确说明参赛条件',
          status: '描述不清',
        },
      ],
      suggestions: [
        '补充完整的安全应急预案文档',
        '明确参赛资格和报名条件',
        '咨询相关部门确保符合所有规定',
      ],
    },
  };

  // 获取当前赛事的所有冲突详情
  const getCurrentConflicts = () => {
    return data.conflicts.map(conflictName => {
      const detail = conflictDetails[conflictName];
      return detail ? { name: conflictName, ...detail } : null;
    }).filter(Boolean);
  };

  const conflicts = getCurrentConflicts();

  // 严重程度配置
  const severityConfig = {
    high: { label: '高', color: 'text-red-600', bg: 'bg-red-100', icon: '🔴' },
    medium: { label: '中', color: 'text-orange-600', bg: 'bg-orange-100', icon: '🟠' },
    low: { label: '低', color: 'text-yellow-600', bg: 'bg-yellow-100', icon: '🟡' },
  };

  return (
    <>
      {/* 背景遮罩 */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      >
        {/* 面板内容 */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col"
        >
          {/* 头部 */}
          <div className="px-6 py-5 border-b border-neutral-200 bg-gradient-to-r from-amber-50 to-red-50">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-2xl font-bold text-neutral-900 flex items-center gap-3">
                  <span className="text-3xl">⚠️</span>
                  冲突检测报告
                </h2>
                <p className="text-sm text-neutral-600 mt-2">
                  赛事：{data.contestName}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="danger" size="sm">
                    {conflicts.length} 个冲突
                  </Badge>
                  <Badge variant="warning" size="sm">
                    需要处理
                  </Badge>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-10 h-10 rounded-full hover:bg-white/50 flex items-center justify-center text-neutral-600 hover:text-neutral-900 transition-colors"
              >
                ✕
              </button>
            </div>
          </div>

          {/* 标签页 */}
          <div className="px-6 py-3 border-b border-neutral-200 bg-neutral-50">
            <div className="flex gap-2">
              <button
                onClick={() => setActiveTab('overview')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === 'overview'
                    ? 'bg-white text-primary-600 shadow-sm'
                    : 'text-neutral-600 hover:text-neutral-900'
                }`}
              >
                概览
              </button>
              <button
                onClick={() => setActiveTab('details')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === 'details'
                    ? 'bg-white text-primary-600 shadow-sm'
                    : 'text-neutral-600 hover:text-neutral-900'
                }`}
              >
                详细信息
              </button>
              <button
                onClick={() => setActiveTab('suggestions')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === 'suggestions'
                    ? 'bg-white text-primary-600 shadow-sm'
                    : 'text-neutral-600 hover:text-neutral-900'
                }`}
              >
                解决建议
              </button>
            </div>
          </div>

          {/* 内容区域 */}
          <div className="flex-1 overflow-y-auto p-6">
            <AnimatePresence mode="wait">
              {activeTab === 'overview' && (
                <motion.div
                  key="overview"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="space-y-4"
                >
                  {conflicts.map((conflict, index) => {
                    const severity = severityConfig[conflict.severity];
                    return (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className={`p-5 rounded-xl border-2 border-${conflict.color}-200 bg-${conflict.color}-50`}
                      >
                        <div className="flex items-start gap-4">
                          <div className={`flex-shrink-0 w-12 h-12 rounded-xl bg-${conflict.color}-400 flex items-center justify-center text-2xl`}>
                            {conflict.icon}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="text-lg font-semibold text-neutral-900">
                                {conflict.name}
                              </h3>
                              <Badge variant="danger" size="sm">
                                {severity.icon} {severity.label}严重
                              </Badge>
                            </div>
                            <p className="text-sm text-neutral-700 mb-3">
                              {conflict.description}
                            </p>
                            <div className="flex items-center gap-2 text-xs">
                              <span className={`px-2 py-1 rounded ${severity.bg} ${severity.color} font-medium`}>
                                影响: {conflict.conflicts?.length || 0} 项
                              </span>
                              <span className="text-neutral-500">
                                建议: {conflict.suggestions?.length || 0} 条
                              </span>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </motion.div>
              )}

              {activeTab === 'details' && (
                <motion.div
                  key="details"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="space-y-6"
                >
                  {conflicts.map((conflict, index) => (
                    <div key={index} className="bg-neutral-50 rounded-xl p-5 border border-neutral-200">
                      <h3 className="text-lg font-semibold text-neutral-900 mb-4 flex items-center gap-2">
                        <span className="text-2xl">{conflict.icon}</span>
                        {conflict.name} - 详细信息
                      </h3>
                      <div className="space-y-3">
                        {conflict.conflicts?.map((item, idx) => (
                          <div key={idx} className="bg-white rounded-lg p-4 border border-neutral-200">
                            {Object.entries(item).map(([key, value]) => (
                              <div key={key} className="flex justify-between items-center py-1">
                                <span className="text-sm text-neutral-600 capitalize">
                                  {key === 'name' ? '名称' :
                                   key === 'time' ? '时间' :
                                   key === 'overlap' ? '重叠时长' :
                                   key === 'venue' ? '场地' :
                                   key === 'occupied' ? '占用方' :
                                   key === 'capacity' ? '容量' :
                                   key === 'resource' ? '资源' :
                                   key === 'available' ? '可用' :
                                   key === 'required' ? '需求' :
                                   key === 'inUse' ? '使用方' :
                                   key === 'item' ? '项目' :
                                   key === 'budget' ? '预算' :
                                   key === 'standard' ? '标准' :
                                   key === 'excess' ? '超出' :
                                   key === 'issue' ? '问题' :
                                   key === 'requirement' ? '要求' :
                                   key === 'status' ? '状态' : key}:
                                </span>
                                <span className="text-sm font-medium text-neutral-900">
                                  {typeof value === 'number' ? value.toLocaleString() : value}
                                </span>
                              </div>
                            ))}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </motion.div>
              )}

              {activeTab === 'suggestions' && (
                <motion.div
                  key="suggestions"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="space-y-6"
                >
                  {conflicts.map((conflict, index) => (
                    <div key={index} className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-5 border border-blue-200">
                      <h3 className="text-lg font-semibold text-neutral-900 mb-4 flex items-center gap-2">
                        <span className="text-2xl">💡</span>
                        {conflict.name} - 解决方案
                      </h3>
                      <div className="space-y-3">
                        {conflict.suggestions?.map((suggestion, idx) => (
                          <motion.div
                            key={idx}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className="flex items-start gap-3 bg-white rounded-lg p-4"
                          >
                            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-500 text-white text-xs flex items-center justify-center font-semibold">
                              {idx + 1}
                            </span>
                            <p className="text-sm text-neutral-700 flex-1">
                              {suggestion}
                            </p>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* 底部操作栏 */}
          <div className="border-t border-neutral-200 px-6 py-4 bg-neutral-50">
            <div className="flex items-center justify-between">
              <div className="text-sm text-neutral-600">
                💡 提示：建议与申请人沟通，协商解决冲突后再进行审核
              </div>
              <div className="flex gap-3">
                <Button variant="outline" size="md" onClick={onClose}>
                  关闭
                </Button>
                <Button variant="primary" size="md">
                  <span className="mr-2">📧</span>
                  通知申请人
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </>
  );
};

export default ConflictPanel;
