import React from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

/**
 * 按钮组件 - 大厂顶级标准
 * 特性：渐变反向hover效果、精致加载动画、字重600、10px圆角、点击缩放微变
 */
const Button = ({ 
  children, 
  variant = 'primary',  // primary, secondary, ghost, danger
  size = 'md',          // sm, md, lg
  icon,
  iconPosition = 'left',
  disabled = false,
  loading = false,
  fullWidth = false,
  onClick,
  className = '',
  ...props 
}) => {
  // 基础样式 - 字重600, 10px圆角
  const baseStyles = 'relative inline-flex items-center justify-center font-semibold overflow-hidden transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed group';
  
  // 变体样式配置
  const variantConfig = {
    primary: {
      base: 'text-white shadow-md',
      gradient: 'bg-gradient-to-r from-primary-600 to-purple-700',
      hoverGradient: 'bg-gradient-to-r from-purple-700 to-primary-600',
      ring: 'focus:ring-primary-500',
    },
    secondary: {
      base: 'text-white shadow-md',
      gradient: 'bg-gradient-to-r from-secondary-500 to-secondary-600',
      hoverGradient: 'bg-gradient-to-r from-secondary-600 to-secondary-700',
      ring: 'focus:ring-secondary-500',
    },
    outline: {
      base: 'bg-white text-neutral-700 border-2 border-neutral-300',
      gradient: '',
      hoverGradient: '',
      ring: 'focus:ring-primary-500',
    },
    ghost: {
      base: 'bg-white text-neutral-700 border-2 border-neutral-300',
      gradient: '',
      hoverGradient: '',
      ring: 'focus:ring-primary-500',
    },
    success: {
      base: 'text-white shadow-md',
      gradient: 'bg-gradient-to-r from-green-500 to-green-600',
      hoverGradient: 'bg-gradient-to-r from-green-600 to-green-700',
      ring: 'focus:ring-green-500',
    },
    danger: {
      base: 'text-white shadow-md',
      gradient: 'bg-gradient-to-r from-red-500 to-red-600',
      hoverGradient: 'bg-gradient-to-r from-red-600 to-red-700',
      ring: 'focus:ring-red-500',
    },
  };
  
  // 尺寸样式 - 字号14px (text-sm), 高度24px标准
  const sizeStyles = {
    sm: 'px-3 py-1.5 text-xs gap-1.5 rounded-lg h-8',
    md: 'px-5 py-2.5 text-sm gap-2 rounded-[10px] min-h-[40px]', // 14px字号，10px圆角
    lg: 'px-8 py-3 text-base gap-2.5 rounded-xl min-h-[48px]',
  };

  const config = variantConfig[variant];
  
  // 动画变体 - 缩放+颜色微变
  const buttonVariants = {
    tap: { scale: 0.97 },
    hover: { scale: 1.01 },
  };

  return (
    <motion.button
      whileHover={!disabled && !loading ? "hover" : ""}
      whileTap={!disabled && !loading ? "tap" : ""}
      variants={buttonVariants}
      onClick={onClick}
      disabled={disabled || loading}
      className={`
        ${baseStyles}
        ${config.base}
        ${config.gradient}
        ${config.ring}
        ${sizeStyles[size]}
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
      {...props}
    >
      {/* 渐变反向hover效果 */}
      {config.hoverGradient && (
        <div className={`absolute inset-0 ${config.hoverGradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
      )}
      
      {/* Ghost/Outline按钮的hover效果 */}
      {(variant === 'ghost' || variant === 'outline') && (
        <div className="absolute inset-0 bg-neutral-100 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      )}

      {/* 内容区 */}
      <span className="relative z-10 flex items-center gap-2">
        {loading ? (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          >
            <Loader2 className="w-4 h-4" />
          </motion.div>
        ) : (
          icon && iconPosition === 'left' && <span>{icon}</span>
        )}
        <span>{children}</span>
        {!loading && icon && iconPosition === 'right' && <span>{icon}</span>}
      </span>
    </motion.button>
  );
};

export default Button;
