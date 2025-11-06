import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

/**
 * 动态进度条组件 - 大厂标准
 * 特性：流畅的数值变化动画、渐变色、动态颜色
 */
const AnimatedProgress = ({
  value = 0,
  max = 100,
  showPercentage = true,
  showValue = false,
  variant = 'primary', // primary, success, warning, error
  size = 'md', // sm, md, lg
  className = '',
}) => {
  const [displayValue, setDisplayValue] = useState(0);
  const percentage = Math.min((value / max) * 100, 100);

  // 数值动画
  useEffect(() => {
    const duration = 500;
    const steps = 30;
    const increment = (percentage - displayValue) / steps;
    let currentStep = 0;

    const timer = setInterval(() => {
      currentStep++;
      setDisplayValue((prev) => {
        const newValue = prev + increment;
        if (currentStep >= steps) {
          clearInterval(timer);
          return percentage;
        }
        return newValue;
      });
    }, duration / steps);

    return () => clearInterval(timer);
  }, [percentage]);

  const variants = {
    primary: 'from-blue-500 to-blue-600',
    success: 'from-green-500 to-green-600',
    warning: 'from-orange-500 to-orange-600',
    error: 'from-red-500 to-red-600',
  };

  const textColors = {
    primary: 'text-blue-600',
    success: 'text-green-600',
    warning: 'text-orange-600',
    error: 'text-red-600',
  };

  const heights = {
    sm: 'h-2',
    md: 'h-3',
    lg: 'h-4',
  };

  return (
    <div className={`w-full ${className}`}>
      <div className="flex items-center justify-between mb-2">
        {showValue && (
          <span className="text-sm font-medium text-gray-700">
            {value.toLocaleString()} / {max.toLocaleString()}
          </span>
        )}
        {showPercentage && (
          <motion.span
            key={displayValue}
            initial={{ scale: 1.2 }}
            animate={{ scale: 1 }}
            className={`text-sm font-semibold ${textColors[variant]}`}
          >
            {displayValue.toFixed(1)}%
          </motion.span>
        )}
      </div>
      <div className={`relative w-full ${heights[size]} bg-gray-200 rounded-full overflow-hidden`}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
          className={`h-full bg-gradient-to-r ${variants[variant]} rounded-full relative overflow-hidden`}
        >
          {/* 光泽效果 */}
          <motion.div
            animate={{
              x: ['-100%', '200%'],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'linear',
            }}
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
          />
        </motion.div>
      </div>
    </div>
  );
};

export default AnimatedProgress;
