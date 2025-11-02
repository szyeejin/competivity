import React from 'react';
import { motion } from 'framer-motion';

/**
 * 徽章组件 - 用于显示状态、数量等
 */
const Badge = ({ 
  children, 
  variant = 'default',  // default, primary, success, warning, danger, info
  size = 'md',          // sm, md, lg
  dot = false,          // 是否只显示圆点
  pulse = false,        // 是否添加脉冲动画
  className = '',
  ...props 
}) => {
  // 变体样式
  const variantStyles = {
    default: 'bg-gray-100 text-gray-700',
    primary: 'bg-primary-100 text-primary-700',
    success: 'bg-green-100 text-green-700',
    warning: 'bg-yellow-100 text-yellow-700',
    danger: 'bg-red-100 text-red-700',
    info: 'bg-blue-100 text-blue-700',
  };

  // 尺寸样式
  const sizeStyles = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-xs px-2.5 py-1',
    lg: 'text-sm px-3 py-1.5',
  };

  // 圆点样式
  const dotStyles = {
    default: 'bg-gray-500',
    primary: 'bg-primary-500',
    success: 'bg-green-500',
    warning: 'bg-yellow-500',
    danger: 'bg-red-500',
    info: 'bg-blue-500',
  };

  if (dot) {
    return (
      <span className="relative inline-flex">
        <span className={`inline-block w-2 h-2 rounded-full ${dotStyles[variant]}`}></span>
        {pulse && (
          <span className={`absolute inline-flex h-full w-full rounded-full ${dotStyles[variant]} opacity-75 animate-ping`}></span>
        )}
      </span>
    );
  }

  return (
    <motion.span
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      className={`
        inline-flex items-center justify-center font-medium rounded-full
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${className}
      `}
      {...props}
    >
      {pulse && (
        <span className={`mr-1.5 w-2 h-2 rounded-full ${dotStyles[variant]} animate-pulse`}></span>
      )}
      {children}
    </motion.span>
  );
};

export default Badge;
