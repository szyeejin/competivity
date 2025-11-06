import React from 'react';
import { motion } from 'framer-motion';
import { GripVertical } from 'lucide-react';

/**
 * 可拖拽卡片组件 - 大厂标准
 * 特性：拖拽手柄、悬浮效果、流畅动画
 */
const DraggableCard = ({
  children,
  onDragStart,
  onDragEnd,
  isDragging = false,
  className = '',
  showHandle = true,
}) => {
  return (
    <motion.div
      drag={showHandle ? 'y' : false}
      dragConstraints={{ top: 0, bottom: 0 }}
      dragElastic={0.1}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      whileHover={{ scale: 1.02, boxShadow: '0 10px 30px rgba(0,0,0,0.12)' }}
      whileDrag={{ scale: 1.05, boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}
      className={`relative bg-white rounded-xl border border-gray-200 transition-all duration-200 ${
        isDragging ? 'opacity-50' : ''
      } ${className}`}
    >
      {showHandle && (
        <div className="absolute left-2 top-1/2 -translate-y-1/2 cursor-grab active:cursor-grabbing">
          <GripVertical className="w-5 h-5 text-gray-400" />
        </div>
      )}
      <div className={showHandle ? 'pl-8' : ''}>{children}</div>
    </motion.div>
  );
};

export default DraggableCard;
