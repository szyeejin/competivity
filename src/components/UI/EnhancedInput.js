import React, { useState } from 'react';
import { motion } from 'framer-motion';

/**
 * 增强输入框组件 - 大厂标准
 * 特性：聚焦动效、格式引导、错误提示、前缀/后缀图标
 */
const EnhancedInput = ({
  label,
  value,
  onChange,
  type = 'text',
  placeholder,
  prefix,
  suffix,
  error,
  helper,
  required = false,
  disabled = false,
  className = '',
  inputClassName = '',
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <div className={`w-full ${className}`}>
      {/* 标签 */}
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      {/* 输入框容器 */}
      <motion.div
        animate={{
          scale: isFocused ? 1.01 : 1,
        }}
        transition={{ duration: 0.2 }}
        className={`relative flex items-center rounded-lg border-2 transition-all duration-200 ${
          error
            ? 'border-red-500 bg-red-50'
            : isFocused
            ? 'border-blue-500 bg-blue-50/50 shadow-md shadow-blue-100'
            : 'border-gray-300 bg-white hover:border-gray-400'
        } ${disabled ? 'opacity-60 cursor-not-allowed' : ''}`}
      >
        {/* 前缀图标 */}
        {prefix && (
          <span className="flex items-center justify-center pl-3 text-gray-500">
            {prefix}
          </span>
        )}

        {/* 输入框 */}
        <input
          type={type}
          value={value}
          onChange={onChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          disabled={disabled}
          className={`flex-1 px-4 py-2.5 bg-transparent outline-none text-gray-900 placeholder:text-gray-400 ${
            prefix ? 'pl-2' : ''
          } ${suffix ? 'pr-2' : ''} ${inputClassName}`}
          {...props}
        />

        {/* 后缀图标 */}
        {suffix && (
          <span className="flex items-center justify-center pr-3 text-gray-500">
            {suffix}
          </span>
        )}

        {/* 聚焦动效线 */}
        {isFocused && (
          <motion.div
            layoutId="input-focus"
            className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 to-blue-600"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            exit={{ scaleX: 0 }}
            transition={{ duration: 0.3 }}
          />
        )}
      </motion.div>

      {/* 帮助文本或错误信息 */}
      {(helper || error) && (
        <motion.p
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className={`mt-1.5 text-xs ${
            error ? 'text-red-600' : 'text-gray-500'
          }`}
        >
          {error || helper}
        </motion.p>
      )}
    </div>
  );
};

export default EnhancedInput;
