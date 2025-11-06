import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileText, Calendar, MapPin, Award, Trophy, 
  Clock, ChevronDown, Plus, X, Globe
} from 'lucide-react';
import Input from '../../UI/Input';
import Select from '../../UI/Select';
import Button from '../../UI/Button';
import Switch from '../../UI/Switch';
import DatePicker from '../../UI/DatePicker';

// 折叠面板组件 - 移到外部避免重新渲染
const SectionPanel = ({ title, icon: Icon, sectionKey, required, children, isExpanded, onToggle }) => {
  return (
    <div className="border border-neutral-200 rounded-xl overflow-hidden bg-white hover:shadow-md transition-all duration-300">
      <button
        onClick={() => onToggle(sectionKey)}
        className="w-full flex items-center justify-between p-5 transition-colors hover:bg-gray-50"
      >
        <div className="flex items-center gap-4">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
            isExpanded
              ? 'bg-gradient-to-br from-primary-600 to-purple-700 shadow-lg'
              : 'bg-neutral-100'
          }`}>
            <Icon className={`w-5 h-5 ${isExpanded ? 'text-white' : 'text-neutral-500'}`} />
          </div>
          <div className="text-left">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold text-neutral-900">{title}</h3>
              {required && (
                <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs font-medium rounded-full">
                  必填
                </span>
              )}
            </div>
          </div>
        </div>
        
        <ChevronDown className={`w-5 h-5 text-neutral-400 transition-transform duration-200 ${
          isExpanded ? 'rotate-180' : ''
        }`} />
      </button>

      {isExpanded && (
        <div className="p-6 bg-gradient-to-br from-neutral-50 to-white border-t border-neutral-100">
          {children}
        </div>
      )}
    </div>
  );
};

/**
 * 赛事基础信息表单 - 大厂顶级标准
 * 特性：两列等宽布局、Switch开关、卡片内分栏、浮动标签、渐变边框
 */
const BasicInfoForm = ({ data, errors, onChange }) => {
  const [expandedSections, setExpandedSections] = useState({
    basic: true,
    timePlace: true,
    incentives: true,
  });

  const toggleSection = (section) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const handleChange = (field, value) => {
    onChange({ ...data, [field]: value });
  };

  const handleNestedChange = (parent, field, value) => {
    onChange({
      ...data,
      [parent]: { ...data[parent], [field]: value }
    });
  };

  const contestTypeOptions = [
    { value: 'algorithm', label: '🧮 算法竞赛' },
    { value: 'application', label: '💻 应用开发' },
    { value: 'innovation', label: '💡 创新设计' },
    { value: 'research', label: '📚 科研论文' },
    { value: 'comprehensive', label: '🎯 综合竞赛' }
  ];

  return (
    <div className="p-6 space-y-6">
      {/* 1. 基础信息：赛事名称与类型 */}
      <SectionPanel
        title="赛事名称与类型"
        icon={Trophy}
        sectionKey="basic"
        required
        isExpanded={expandedSections.basic}
        onToggle={toggleSection}
      >
        {/* 两列等宽布局 (屏幕宽度≥1200px) */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <Input
            label="赛事名称"
            value={data.name}
            onChange={(e) => handleChange('name', e.target.value)}
            error={errors.name}
            required
            placeholder="例如：2024年全国大学生AI创新大赛"
            icon={Trophy}
            tooltip="请输入具有辨识度的赛事名称，建议包含年份、范围和主题"
          />

          <Select
            label="赛事类型"
            value={data.type}
            onChange={(e) => handleChange('type', e.target.value)}
            options={contestTypeOptions}
            error={errors.type}
            required
            placeholder="请选择赛事类型"
            icon={Award}
            tooltip="选择最符合赛事主题的类型"
          />
        </div>
      </SectionPanel>

      {/* 2. 时间与地点 */}
      <SectionPanel
        title="时间与地点"
        icon={Calendar}
        sectionKey="timePlace"
        required
        isExpanded={expandedSections.timePlace}
        onToggle={toggleSection}
      >
        {/* 两列布局 */}
        <div className="space-y-6">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <DatePicker
              label="赛事开始时间"
              value={data.timeAndPlace.startDate}
              onChange={(e) => handleNestedChange('timeAndPlace', 'startDate', e.target.value)}
              error={errors.startDate}
              required
              showTime
              quickOptions
              tooltip="赛事正式开始的时间"
            />

            <DatePicker
              label="赛事结束时间"
              value={data.timeAndPlace.endDate}
              onChange={(e) => handleNestedChange('timeAndPlace', 'endDate', e.target.value)}
              error={errors.endDate}
              required
              showTime
              minDate={data.timeAndPlace.startDate}
              tooltip="赛事正式结束的时间"
            />
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <DatePicker
              label="报名开始时间"
              value={data.timeAndPlace.registrationStart}
              onChange={(e) => handleNestedChange('timeAndPlace', 'registrationStart', e.target.value)}
              showTime
              quickOptions
              tooltip="参赛者可以开始报名的时间"
            />

            <DatePicker
              label="报名截止时间"
              value={data.timeAndPlace.registrationEnd}
              onChange={(e) => handleNestedChange('timeAndPlace', 'registrationEnd', e.target.value)}
              showTime
              minDate={data.timeAndPlace.registrationStart}
              maxDate={data.timeAndPlace.startDate}
              tooltip="报名通道关闭的时间，应早于赛事开始时间"
            />
          </div>

          {/* Switch开关组件 */}
          <div className="p-4 bg-white rounded-xl border border-neutral-200">
            <Switch
              checked={data.timeAndPlace.onlineMode}
              onChange={(checked) => handleNestedChange('timeAndPlace', 'onlineMode', checked)}
              label="线上赛事"
              description={data.timeAndPlace.onlineMode ? "无需填写地点" : "请在下方填写赛事地点"}
            />
          </div>

          {/* 地点输入框 - 自动折叠 */}
          {!data.timeAndPlace.onlineMode && (
            <div>
              <Input
                  label="赛事地点"
                  value={data.timeAndPlace.location}
                  onChange={(e) => handleNestedChange('timeAndPlace', 'location', e.target.value)}
                  error={errors.location}
                  required={!data.timeAndPlace.onlineMode}
                  placeholder="例如：北京市海淀区中关村大街1号"
                  icon={MapPin}
                />
            </div>
          )}

          {/* 线上赛事提示 */}
          {data.timeAndPlace.onlineMode && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-700 flex items-center gap-2"
            >
              <Globe className="w-4 h-4" />
              <span>线上赛事无需填写地点</span>
            </motion.div>
          )}
        </div>
      </SectionPanel>

      {/* 3. 赛事激励设置 - 卡片内分栏 */}
      <SectionPanel
        title="赛事激励设置"
        icon={Award}
        sectionKey="incentives"
        isExpanded={expandedSections.incentives}
        onToggle={toggleSection}
      >
        <div className="space-y-6">
          {/* 卡片内三列分栏 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* 一等奖 */}
            <div className="p-4 bg-gradient-to-br from-yellow-50 to-yellow-100 border-2 border-yellow-300 rounded-xl">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                  1
                </div>
                <span className="font-semibold text-yellow-900">一等奖</span>
              </div>
              <Input
                value={data.incentives.firstPrize}
                onChange={(e) => handleNestedChange('incentives', 'firstPrize', e.target.value)}
                placeholder="10000元 + 证书"
                className="!bg-white"
              />
            </div>

            {/* 二等奖 */}
            <div className="p-4 bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-gray-300 rounded-xl">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 bg-gradient-to-br from-gray-500 to-gray-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                  2
                </div>
                <span className="font-semibold text-gray-900">二等奖</span>
              </div>
              <Input
                value={data.incentives.secondPrize}
                onChange={(e) => handleNestedChange('incentives', 'secondPrize', e.target.value)}
                placeholder="5000元 + 证书"
                className="!bg-white"
              />
            </div>

            {/* 三等奖 */}
            <div className="p-4 bg-gradient-to-br from-orange-50 to-orange-100 border-2 border-orange-300 rounded-xl">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                  3
                </div>
                <span className="font-semibold text-orange-900">三等奖</span>
              </div>
              <Input
                value={data.incentives.thirdPrize}
                onChange={(e) => handleNestedChange('incentives', 'thirdPrize', e.target.value)}
                placeholder="2000元 + 证书"
                className="!bg-white"
              />
            </div>
          </div>

          {/* 额外激励 */}
          <div className="p-4 bg-white rounded-xl border border-neutral-200">
            <Switch
              checked={data.incentives.certificate}
              onChange={(checked) => handleNestedChange('incentives', 'certificate', checked)}
              label="颁发参赛证书"
              description={data.incentives.certificate ? "所有完成赛事的选手都将获得证书" : "仅获奖选手获得证书"}
            />
          </div>

          <Input
            label="其他奖励"
            value={data.incentives.scholarship}
            onChange={(e) => handleNestedChange('incentives', 'scholarship', e.target.value)}
            placeholder="例如：奖学金、实习机会、科研合作等"
            icon={Award}
          />
        </div>
      </SectionPanel>

      {/* 4. 赛事规则 */}
      <SectionPanel
        title="赛事规则说明"
        icon={FileText}
        sectionKey="rules"
        isExpanded={expandedSections.rules}
        onToggle={toggleSection}
      >
        <textarea
          value={data.rules}
          onChange={(e) => handleChange('rules', e.target.value)}
          placeholder="请详细描述赛事的规则、评分标准、作品要求等内容..."
          className="w-full px-4 py-3 border-2 border-neutral-200 rounded-xl focus:border-transparent focus:outline-none focus:shadow-xl focus:shadow-primary-100 min-h-[200px] resize-y"
          style={{
            backgroundClip: 'padding-box',
            border: '2px solid transparent',
            backgroundImage: 'linear-gradient(white, white), linear-gradient(to right, #4066FF, #722ED1)',
            backgroundOrigin: 'border-box',
            backgroundClip: 'padding-box, border-box',
          }}
        />
      </SectionPanel>
    </div>
  );
};

export default BasicInfoForm;
