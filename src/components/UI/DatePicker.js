import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Clock, X, Info } from 'lucide-react';

/**
 * DatePicker 日历选择器 - 大厂风格
 * 特性：日历弹窗、快捷选择、时间联动校验、动画效果
 */
const DatePicker = ({
  label,
  value,
  onChange,
  error,
  required = false,
  disabled = false,
  placeholder = '请选择日期',
  showTime = false,
  minDate,
  maxDate,
  tooltip,
  quickOptions = false, // 显示快捷选择
  className = '',
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  // 快捷日期选项
  const quickDateOptions = [
    { label: '今天', getValue: () => new Date().toISOString().split('T')[0] },
    { label: '明天', getValue: () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      return tomorrow.toISOString().split('T')[0];
    }},
    { label: '一周后', getValue: () => {
      const nextWeek = new Date();
      nextWeek.setDate(nextWeek.getDate() + 7);
      return nextWeek.toISOString().split('T')[0];
    }},
  ];

  const handleQuickSelect = (option) => {
    if (onChange) {
      const event = { target: { value: option.getValue() } };
      onChange(event);
    }
  };

  return (
    <div className={`relative ${className}`}>
      {/* 标签和tooltip */}
      <div className="flex items-center gap-2 mb-2">
        {label && (
          <label
            className={`text-sm font-medium transition-colors ${
              error ? 'text-red-600' : 
              isFocused ? 'text-primary-600' : 'text-neutral-700'
            }`}
          >
            {label}
            {required && (
              <span 
                className="text-red-500 ml-1 cursor-help" 
                title="该字段为必填项"
                onMouseEnter={() => setShowTooltip(true)}
                onMouseLeave={() => setShowTooltip(false)}
              >
                *
              </span>
            )}
          </label>
        )}
        
        {tooltip && (
          <div className="relative">
            <button
              type="button"
              onMouseEnter={() => setShowTooltip(true)}
              onMouseLeave={() => setShowTooltip(false)}
              className="text-neutral-400 hover:text-neutral-600 transition-colors"
            >
              <Info className="w-4 h-4" />
            </button>
            
            <AnimatePresence>
              {showTooltip && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="absolute z-20 left-1/2 -translate-x-1/2 bottom-full mb-2 w-64 px-3 py-2 bg-neutral-900 text-white text-xs rounded-lg shadow-xl"
                >
                  {tooltip}
                  <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-neutral-900"></div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* 输入框容器 */}
      <div className="relative">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 z-10 pointer-events-none">
          <Calendar 
            className={`w-5 h-5 transition-colors ${
              error ? 'text-red-500' : 
              isFocused ? 'text-primary-500' : 'text-neutral-400'
            }`} 
          />
        </div>

        <motion.input
          type={showTime ? 'datetime-local' : 'date'}
          value={value}
          onChange={onChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          disabled={disabled}
          min={minDate}
          max={maxDate}
          placeholder={placeholder}
          whileFocus={{ scale: 1.005 }}
          transition={{ duration: 0.2 }}
          className={`w-full px-4 py-3 pl-11 border-2 rounded-xl transition-all duration-200 outline-none ${
            error
              ? 'border-red-500 bg-red-50/50 focus:border-red-600 focus:bg-red-50 focus:shadow-lg focus:shadow-red-100'
              : isFocused
              ? 'border-transparent bg-gradient-to-r from-primary-600 to-purple-700 bg-clip-padding focus:shadow-xl focus:shadow-primary-100'
              : 'border-neutral-200 bg-white hover:border-neutral-300'
          } ${
            disabled ? 'bg-neutral-100 cursor-not-allowed text-neutral-500' : ''
          }`}
          style={
            isFocused && !error
              ? {
                  backgroundClip: 'padding-box',
                  border: '2px solid transparent',
                  backgroundImage: 'linear-gradient(white, white), linear-gradient(to right, #4066FF, #722ED1)',
                  backgroundOrigin: 'border-box',
                  backgroundClip: 'padding-box, border-box',
                }
              : {}
          }
        />

        {/* 清除按钮 */}
        {value && !disabled && (
          <motion.button
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            type="button"
            onClick={() => onChange && onChange({ target: { value: '' } })}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </motion.button>
        )}
      </div>

      {/* 快捷选择 */}
      {quickOptions && !disabled && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-2 flex gap-2"
        >
          {quickDateOptions.map((option, index) => (
            <motion.button
              key={index}
              type="button"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleQuickSelect(option)}
              className="px-3 py-1.5 text-xs font-medium text-primary-600 bg-primary-50 rounded-lg hover:bg-primary-100 transition-colors"
            >
              {option.label}
            </motion.button>
          ))}
        </motion.div>
      )}

      {/* 错误提示 */}
      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mt-2 text-sm text-red-600 flex items-center gap-1"
          >
            <X className="w-4 h-4" />
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DatePicker;
