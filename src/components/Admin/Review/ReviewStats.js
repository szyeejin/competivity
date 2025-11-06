import React from 'react';
import { motion } from 'framer-motion';

/**
 * 审核统计卡片组件 - 互联网大厂风格
 * 特性：渐变背景、动画效果、实时数据
 */
const ReviewStats = ({ stats }) => {
  const statCards = [
    {
      id: 'pending',
      title: '待审核',
      value: stats.pending,
      icon: '⏳',
      gradient: 'from-amber-400 to-orange-500',
      bgGradient: 'from-amber-50 to-orange-50',
      textColor: 'text-amber-700',
      description: '需要立即处理',
      trend: '+3',
      trendUp: true,
    },
    {
      id: 'reviewing',
      title: '审核中',
      value: stats.reviewing,
      icon: '🔍',
      gradient: 'from-blue-400 to-cyan-500',
      bgGradient: 'from-blue-50 to-cyan-50',
      textColor: 'text-blue-700',
      description: '正在审核处理',
      trend: '+2',
      trendUp: true,
    },
    {
      id: 'approved',
      title: '已通过',
      value: stats.approved,
      icon: '✅',
      gradient: 'from-green-400 to-emerald-500',
      bgGradient: 'from-green-50 to-emerald-50',
      textColor: 'text-green-700',
      description: '审核已通过',
      trend: '+5',
      trendUp: true,
    },
    {
      id: 'rejected',
      title: '已驳回',
      value: stats.rejected,
      icon: '❌',
      gradient: 'from-red-400 to-rose-500',
      bgGradient: 'from-red-50 to-rose-50',
      textColor: 'text-red-700',
      description: '需要重新申请',
      trend: '-1',
      trendUp: false,
    },
    {
      id: 'conflicts',
      title: '冲突检测',
      value: stats.conflicts,
      icon: '⚠️',
      gradient: 'from-purple-400 to-pink-500',
      bgGradient: 'from-purple-50 to-pink-50',
      textColor: 'text-purple-700',
      description: '发现资源冲突',
      highlight: true,
    },
    {
      id: 'total',
      title: '总申请数',
      value: stats.total,
      icon: '📊',
      gradient: 'from-indigo-400 to-blue-500',
      bgGradient: 'from-indigo-50 to-blue-50',
      textColor: 'text-indigo-700',
      description: '累计申请数量',
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: 'spring',
        stiffness: 100,
        damping: 15,
      },
    },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4"
    >
      {statCards.map((card, index) => (
        <motion.div
          key={card.id}
          variants={cardVariants}
          whileHover={{ 
            y: -8, 
            scale: 1.02,
            transition: { type: 'spring', stiffness: 400, damping: 20 }
          }}
          className={`
            relative overflow-hidden rounded-xl border border-neutral-200
            bg-gradient-to-br ${card.bgGradient}
            hover:shadow-xl transition-shadow duration-300 cursor-pointer
            ${card.highlight ? 'ring-2 ring-purple-400 ring-offset-2' : ''}
          `}
        >
          {/* 背景装饰 */}
          <div className="absolute top-0 right-0 w-32 h-32 opacity-10">
            <div className={`absolute inset-0 bg-gradient-to-br ${card.gradient} rounded-full blur-2xl`} />
          </div>

          <div className="relative p-5">
            {/* 图标和标题 */}
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="text-sm font-medium text-neutral-600 mb-1">
                  {card.title}
                </p>
                <motion.p
                  key={card.value}
                  initial={{ scale: 1.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className={`text-3xl font-bold ${card.textColor}`}
                >
                  {card.value}
                </motion.p>
              </div>
              
              <motion.div
                whileHover={{ rotate: 360, scale: 1.2 }}
                transition={{ duration: 0.6 }}
                className={`
                  flex items-center justify-center w-12 h-12 rounded-xl
                  bg-gradient-to-br ${card.gradient} shadow-lg text-white text-2xl
                `}
              >
                {card.icon}
              </motion.div>
            </div>

            {/* 描述文字 */}
            <p className="text-xs text-neutral-500 mb-2">
              {card.description}
            </p>

            {/* 趋势指示器 */}
            {card.trend && (
              <div className="flex items-center gap-1">
                <span className={`text-xs font-semibold ${
                  card.trendUp ? 'text-green-600' : 'text-red-600'
                }`}>
                  {card.trendUp ? '↑' : '↓'} {card.trend}
                </span>
                <span className="text-xs text-neutral-400">本周</span>
              </div>
            )}

            {/* 脉冲动画（待审核卡片） */}
            {card.id === 'pending' && card.value > 0 && (
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="absolute top-2 right-2"
              >
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
                </span>
              </motion.div>
            )}

            {/* 高亮指示器 */}
            {card.highlight && card.value > 0 && (
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-400 to-pink-500" />
            )}
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
};

export default ReviewStats;
