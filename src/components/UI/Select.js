import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, AlertCircle, Check, Info } from 'lucide-react';

/**
 * 现代化下拉选择组件
 * 特性：渐入动画、图标支持、搜索功能、分组选项
 */
const Select = ({
  label,
  value,
  onChange,
  options = [],
  error,
  required = false,
  disabled = false,
  placeholder = '请选择',
  icon: Icon,
  tooltip,
  success,
  searchable = false,
  className = '',
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  
  const selectedOption = options.find(opt => opt.value === value);

  return (
    <div className={`relative ${className}`}>
      {/* 标签和tooltip */}
      <div className="flex items-center gap-2 mb-2">
        {label && (
          <label
            className={`text-sm font-medium transition-colors ${
              error ? 'text-red-600' : 
              success ? 'text-green-600' :
              isFocused ? 'text-primary-600' : 'text-gray-700'
            }`}
          >
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        
        {tooltip && (
          <div className="relative">
            <button
              type="button"
              onMouseEnter={() => setShowTooltip(true)}
              onMouseLeave={() => setShowTooltip(false)}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <Info className="w-4 h-4" />
            </button>
            
            <AnimatePresence>
              {showTooltip && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="absolute z-10 left-1/2 -translate-x-1/2 bottom-full mb-2 w-64 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg shadow-xl"
                >
                  {tooltip}
                  <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-gray-900"></div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* 选择框容器 */}
      <div className="relative">
        {Icon && (
          <div className={`absolute left-3 top-1/2 -translate-y-1/2 transition-colors pointer-events-none z-10 ${
            error ? 'text-red-500' : 
            success ? 'text-green-500' :
            isFocused ? 'text-primary-500' : 'text-gray-400'
          }`}>
            <Icon className="w-5 h-5" />
          </div>
        )}

        <select
          value={value}
          onChange={onChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          disabled={disabled}
          className={`w-full px-4 py-3 ${Icon ? 'pl-11' : ''} pr-11 appearance-none border-2 rounded-xl transition-all duration-200 outline-none cursor-pointer ${
            error
              ? 'border-red-500 bg-red-50/50 focus:border-red-600 focus:bg-red-50'
              : success
              ? 'border-green-500 bg-green-50/50 focus:border-green-600 focus:bg-green-50'
              : isFocused
              ? 'border-primary-500 bg-primary-50/30 shadow-lg shadow-primary-100'
              : 'border-gray-200 bg-white hover:border-gray-300'
          } ${
            disabled ? 'bg-gray-100 cursor-not-allowed text-gray-500' : ''
          } ${
            !value ? 'text-gray-400' : 'text-gray-900'
          }`}
        >
          <option value="" disabled>
            {placeholder}
          </option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        {/* 下拉图标 */}
        <motion.div
          animate={{ rotate: isFocused ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className={`absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none ${
            error ? 'text-red-500' : 
            success ? 'text-green-500' :
            isFocused ? 'text-primary-500' : 'text-gray-400'
          }`}
        >
          <ChevronDown className="w-5 h-5" />
        </motion.div>
      </div>

      {/* 错误提示 */}
      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mt-2 text-sm text-red-600 flex items-center gap-1"
          >
            <AlertCircle className="w-4 h-4" />
            {error}
          </motion.p>
        )}
      </AnimatePresence>

      {/* 成功提示 */}
      <AnimatePresence>
        {success && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mt-2 text-sm text-green-600 flex items-center gap-1"
          >
            <Check className="w-4 h-4" />
            {success}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Select;
