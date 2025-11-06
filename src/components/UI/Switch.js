import React from 'react';
import { motion } from 'framer-motion';

/**
 * Switch 开关组件 - 大厂标准
 * 特性：流畅切换动画、蓝色滑块、灰色关闭状态
 */
const Switch = ({
  checked = false,
  onChange,
  disabled = false,
  label,
  description,
  size = 'md', // sm, md, lg
  className = '',
}) => {
  const handleToggle = () => {
    if (!disabled && onChange) {
      onChange(!checked);
    }
  };

  // 尺寸配置
  const sizes = {
    sm: {
      track: 'w-9 h-5',
      thumb: 'w-4 h-4',
      translate: 'translate-x-4',
    },
    md: {
      track: 'w-11 h-6',
      thumb: 'w-5 h-5',
      translate: 'translate-x-5',
    },
    lg: {
      track: 'w-14 h-7',
      thumb: 'w-6 h-6',
      translate: 'translate-x-7',
    },
  };

  const sizeConfig = sizes[size];

  return (
    <div className={`flex items-start gap-3 ${className}`}>
      {/* 开关主体 */}
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={handleToggle}
        disabled={disabled}
        className={`relative inline-flex flex-shrink-0 ${sizeConfig.track} rounded-pill transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 ${
          disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'
        } ${
          checked
            ? 'bg-gradient-to-r from-primary-600 to-primary-700 shadow-md'
            : 'bg-neutral-300'
        }`}
      >
        {/* 滑块 */}
        <motion.span
          animate={{
            x: checked ? (size === 'sm' ? 16 : size === 'md' ? 20 : 28) : 2,
          }}
          transition={{
            type: 'spring',
            stiffness: 500,
            damping: 30,
          }}
          className={`inline-block ${sizeConfig.thumb} rounded-full bg-white shadow-lg`}
        />
      </button>

      {/* 标签和描述 */}
      {(label || description) && (
        <div className="flex-1">
          {label && (
            <label
              onClick={!disabled ? handleToggle : undefined}
              className={`block text-sm font-medium text-neutral-800 ${
                disabled ? 'cursor-not-allowed' : 'cursor-pointer'
              }`}
            >
              {label}
            </label>
          )}
          {description && (
            <p className="mt-0.5 text-xs text-neutral-500">{description}</p>
          )}
        </div>
      )}
    </div>
  );
};

export default Switch;
