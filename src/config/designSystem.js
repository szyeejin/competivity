/**
 * 设计系统配置
 * 定义统一的视觉风格、动画参数等
 */

// 字节跳动风格的配色系统
export const colors = {
  // 主色调 - 蓝紫渐变
  primary: {
    50: '#f0f4ff',
    100: '#e0eaff',
    200: '#c7d7fe',
    300: '#a5b9fc',
    400: '#818cf8',
    500: '#6366f1',
    600: '#4f46e5',
    700: '#4338ca',
    800: '#3730a3',
    900: '#312e81',
  },
  // 辅助色 - 青色
  secondary: {
    50: '#ecfeff',
    100: '#cffafe',
    200: '#a5f3fc',
    300: '#67e8f9',
    400: '#22d3ee',
    500: '#06b6d4',
    600: '#0891b2',
    700: '#0e7490',
    800: '#155e75',
    900: '#164e63',
  },
  // 成功色
  success: {
    50: '#f0fdf4',
    100: '#dcfce7',
    200: '#bbf7d0',
    300: '#86efac',
    400: '#4ade80',
    500: '#22c55e',
    600: '#16a34a',
    700: '#15803d',
    800: '#166534',
    900: '#14532d',
  },
  // 警告色
  warning: {
    50: '#fffbeb',
    100: '#fef3c7',
    200: '#fde68a',
    300: '#fcd34d',
    400: '#fbbf24',
    500: '#f59e0b',
    600: '#d97706',
    700: '#b45309',
    800: '#92400e',
    900: '#78350f',
  },
  // 错误色
  error: {
    50: '#fef2f2',
    100: '#fee2e2',
    200: '#fecaca',
    300: '#fca5a5',
    400: '#f87171',
    500: '#ef4444',
    600: '#dc2626',
    700: '#b91c1c',
    800: '#991b1b',
    900: '#7f1d1d',
  },
  // 中性色
  neutral: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827',
  }
};

// 动画配置
export const animations = {
  // 缓动函数
  easing: {
    easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    easeOut: 'cubic-bezier(0.0, 0, 0.2, 1)',
    easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
    sharp: 'cubic-bezier(0.4, 0, 0.6, 1)',
  },
  // 持续时间
  duration: {
    shortest: 150,
    shorter: 200,
    short: 250,
    standard: 300,
    complex: 375,
    enteringScreen: 225,
    leavingScreen: 195,
  },
  // Framer Motion 变体
  variants: {
    fadeIn: {
      initial: { opacity: 0, y: 20 },
      animate: { opacity: 1, y: 0 },
      exit: { opacity: 0, y: -20 },
      transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] }
    },
    slideIn: {
      initial: { x: -20, opacity: 0 },
      animate: { x: 0, opacity: 1 },
      exit: { x: 20, opacity: 0 },
      transition: { duration: 0.25, ease: [0.4, 0, 0.2, 1] }
    },
    scaleIn: {
      initial: { scale: 0.9, opacity: 0 },
      animate: { scale: 1, opacity: 1 },
      exit: { scale: 0.9, opacity: 0 },
      transition: { duration: 0.2, ease: [0.4, 0, 0.2, 1] }
    },
    stagger: {
      animate: {
        transition: {
          staggerChildren: 0.1
        }
      }
    }
  }
};

// 阴影层级
export const shadows = {
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  DEFAULT: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
  inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
};

// 圆角
export const borderRadius = {
  none: '0',
  sm: '0.25rem',    // 4px
  DEFAULT: '0.5rem', // 8px - 主要使用
  md: '0.75rem',    // 12px
  lg: '1rem',       // 16px
  xl: '1.5rem',     // 24px
  '2xl': '2rem',    // 32px
  full: '9999px',
};

// 字体层级
export const typography = {
  // 标题
  h1: {
    fontSize: '2rem',      // 32px
    fontWeight: '700',
    lineHeight: '2.5rem',
    letterSpacing: '-0.02em',
  },
  h2: {
    fontSize: '1.5rem',    // 24px
    fontWeight: '600',
    lineHeight: '2rem',
    letterSpacing: '-0.01em',
  },
  h3: {
    fontSize: '1.25rem',   // 20px
    fontWeight: '600',
    lineHeight: '1.75rem',
  },
  h4: {
    fontSize: '1.125rem',  // 18px
    fontWeight: '600',
    lineHeight: '1.5rem',
  },
  // 正文
  bodyLarge: {
    fontSize: '1rem',      // 16px
    fontWeight: '400',
    lineHeight: '1.5rem',
  },
  body: {
    fontSize: '0.875rem',  // 14px
    fontWeight: '400',
    lineHeight: '1.25rem',
  },
  bodySmall: {
    fontSize: '0.75rem',   // 12px
    fontWeight: '400',
    lineHeight: '1rem',
  },
  // 标签
  label: {
    fontSize: '0.875rem',  // 14px
    fontWeight: '500',
    lineHeight: '1.25rem',
  },
  caption: {
    fontSize: '0.75rem',   // 12px
    fontWeight: '400',
    lineHeight: '1rem',
    color: '#6b7280',      // gray-500
  },
};

// 间距系统
export const spacing = {
  0: '0',
  1: '0.25rem',   // 4px
  2: '0.5rem',    // 8px
  3: '0.75rem',   // 12px
  4: '1rem',      // 16px
  5: '1.25rem',   // 20px
  6: '1.5rem',    // 24px
  8: '2rem',      // 32px
  10: '2.5rem',   // 40px
  12: '3rem',     // 48px
  16: '4rem',     // 64px
  20: '5rem',     // 80px
  24: '6rem',     // 96px
};

export default {
  colors,
  animations,
  shadows,
  borderRadius,
  typography,
  spacing,
};
