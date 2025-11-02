import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, Info, Check } from 'lucide-react';

/**
 * 现代化输入框组件
 * 特性：浮动标签、实时验证、图标支持、tooltip提示
 */
const Input = ({
  label,
  value,
  onChange,
  error,
  type = 'text',
  placeholder,
  required = false,
  disabled = false,
  icon: Icon,
  tooltip,
  success,
  className = '',
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  
  const hasValue = value && value.toString().length > 0;
  const shouldFloat = isFocused || hasValue;

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

      {/* 输入框容器 */}
      <div className="relative">
        {Icon && (
          <div className={`absolute left-3 top-1/2 -translate-y-1/2 transition-colors ${
            error ? 'text-red-500' : 
            success ? 'text-green-500' :
            isFocused ? 'text-primary-500' : 'text-gray-400'
          }`}>
            <Icon className="w-5 h-5" />
          </div>
        )}

        <motion.input
          type={type}
          value={value}
          onChange={onChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          disabled={disabled}
          placeholder={placeholder}
          whileFocus={{ scale: 1.01 }}
          transition={{ duration: 0.2 }}
          className={`w-full px-4 py-3 ${Icon ? 'pl-11' : ''} ${
            error || success ? 'pr-11' : ''
          } border-2 rounded-xl transition-all duration-200 outline-none ${
            error
              ? 'border-red-500 bg-red-50/50 focus:border-red-600 focus:bg-red-50'
              : success
              ? 'border-green-500 bg-green-50/50 focus:border-green-600 focus:bg-green-50'
              : isFocused
              ? 'border-primary-500 bg-primary-50/30 shadow-lg shadow-primary-100'
              : 'border-gray-200 bg-white hover:border-gray-300'
          } ${
            disabled ? 'bg-gray-100 cursor-not-allowed text-gray-500' : ''
          } placeholder:text-gray-400`}
          {...props}
        />

        {/* 状态图标 */}
        {(error || success) && (
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            className="absolute right-3 top-1/2 -translate-y-1/2"
          >
            {error ? (
              <AlertCircle className="w-5 h-5 text-red-500" />
            ) : (
              <Check className="w-5 h-5 text-green-500" />
            )}
          </motion.div>
        )}
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

export default Input;
