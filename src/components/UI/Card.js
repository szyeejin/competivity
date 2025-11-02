import React from 'react';
import { motion } from 'framer-motion';

/**
 * 卡片组件 - 现代设计风格
 * 支持hover效果、渐变背景等
 */
const Card = ({ 
  children, 
  title,
  subtitle,
  icon,
  gradient = false,
  gradientColors = 'from-blue-500 to-purple-600',
  hoverable = true,
  onClick,
  className = '',
  headerAction,
  ...props 
}) => {
  const baseStyles = 'bg-white rounded-lg border border-gray-100 overflow-hidden';
  const hoverStyles = hoverable ? 'transition-all duration-300 hover:shadow-lg hover:border-primary-300 cursor-pointer' : '';
  const shadowStyles = 'shadow-md';

  const cardVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    hover: hoverable ? { y: -4, transition: { duration: 0.2 } } : {},
  };

  return (
    <motion.div
      variants={cardVariants}
      initial="initial"
      animate="animate"
      whileHover="hover"
      onClick={onClick}
      className={`${baseStyles} ${shadowStyles} ${hoverStyles} ${className}`}
      {...props}
    >
      {/* 渐变头部（可选） */}
      {gradient && (
        <div className={`h-2 bg-gradient-to-r ${gradientColors}`}></div>
      )}

      {/* 卡片头部 */}
      {(title || icon || headerAction) && (
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {icon && (
              <div className="flex-shrink-0">
                {icon}
              </div>
            )}
            <div>
              {title && (
                <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
              )}
              {subtitle && (
                <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>
              )}
            </div>
          </div>
          {headerAction && (
            <div>{headerAction}</div>
          )}
        </div>
      )}

      {/* 卡片内容 */}
      <div className="p-6">
        {children}
      </div>
    </motion.div>
  );
};

// 数据卡片特殊变体
export const StatCard = ({ 
  title, 
  value, 
  change, 
  changeType = 'increase', 
  icon, 
  bgColor = 'bg-gradient-to-br from-blue-500 to-blue-600',
  onClick,
  className = ''
}) => {
  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.02 }}
      onClick={onClick}
      className={`bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 p-6 border border-gray-100 hover:border-primary-300 cursor-pointer ${className}`}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mb-2">{value}</p>
          {change && (
            <div className="flex items-center">
              <span className={`text-sm font-medium ${
                changeType === 'increase' ? 'text-green-600' : 'text-red-600'
              }`}>
                {changeType === 'increase' ? '↑' : '↓'} {change}
              </span>
              <span className="text-xs text-gray-500 ml-1">较上周</span>
            </div>
          )}
        </div>
        <motion.div 
          whileHover={{ rotate: 360 }}
          transition={{ duration: 0.6 }}
          className={`w-14 h-14 ${bgColor} rounded-xl flex items-center justify-center text-white shadow-lg`}
        >
          {icon}
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Card;
