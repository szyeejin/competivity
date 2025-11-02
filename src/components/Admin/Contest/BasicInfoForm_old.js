import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileText, Calendar, MapPin, Award, Users, 
  FileCheck, Info, X, ChevronDown, Trophy, 
  Sparkles, Clock, Plus, Trash2, Globe
} from 'lucide-react';
import Input from '../../UI/Input';
import Select from '../../UI/Select';
import Button from '../../UI/Button';
import Switch from '../../UI/Switch';
import DatePicker from '../../UI/DatePicker';

/**
 * 赛事基础信息表单组件 - 大厂标准升级版
 * 特性：两列等宽布局、Switch开关组件、卡片内分栏、渐变边框、浮动标签
 */
const BasicInfoForm = ({ data, errors, onChange }) => {
  // 展开/收起各个卡片
  const [expandedSections, setExpandedSections] = useState({
    basic: true,
    timePlace: true,
    incentives: true,
    milestones: false,
    scope: false,
    registration: false,
    rules: false
  });

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // 更新字段值
  const handleChange = (field, value) => {
    onChange({ ...data, [field]: value });
  };

  // 更新嵌套字段值
  const handleNestedChange = (parent, field, value) => {
    onChange({
      ...data,
      [parent]: {
        ...data[parent],
        [field]: value
      }
    });
  };

  // 添加关键节点
  const addMilestone = () => {
    const newMilestone = {
      id: Date.now(),
      title: '',
      date: '',
      description: ''
    };
    onChange({
      ...data,
      milestones: [...data.milestones, newMilestone]
    });
  };

  // 删除关键节点
  const removeMilestone = (id) => {
    onChange({
      ...data,
      milestones: data.milestones.filter(m => m.id !== id)
    });
  };

  // 更新关键节点
  const updateMilestone = (id, field, value) => {
    onChange({
      ...data,
      milestones: data.milestones.map(m =>
        m.id === id ? { ...m, [field]: value } : m
      )
    });
  };

  // 添加自定义报名字段
  const addCustomField = () => {
    const newField = {
      id: Date.now(),
      label: '',
      type: 'text',
      required: false
    };
    onChange({
      ...data,
      registrationRules: {
        ...data.registrationRules,
        customFields: [...data.registrationRules.customFields, newField]
      }
    });
  };

  // 删除自定义报名字段
  const removeCustomField = (id) => {
    onChange({
      ...data,
      registrationRules: {
        ...data.registrationRules,
        customFields: data.registrationRules.customFields.filter(f => f.id !== id)
      }
    });
  };

  // 更新自定义报名字段
  const updateCustomField = (id, field, value) => {
    onChange({
      ...data,
      registrationRules: {
        ...data.registrationRules,
        customFields: data.registrationRules.customFields.map(f =>
          f.id === id ? { ...f, [field]: value } : f
        )
      }
    });
  };

  // 卡片标题组件 - 大厂风格
  const SectionHeader = ({ title, icon: Icon, sectionKey, badge, description }) => (
    <motion.button
      onClick={() => toggleSection(sectionKey)}
      whileHover={{ backgroundColor: '#f9fafb' }}
      className="w-full flex items-center justify-between p-5 transition-colors group"
    >
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-600 to-primary-700 flex items-center justify-center text-white shadow-card">
          <Icon className="w-5 h-5" />
        </div>
        <div className="text-left">
          <div className="flex items-center gap-2 mb-0.5">
            <h3 className="text-base font-semibold text-neutral-900">{title}</h3>
            {badge && (
              <span className="px-2 py-0.5 bg-primary-100 text-primary-700 text-xs font-medium rounded-full">
                {badge}
              </span>
            )}
          </div>
          {description && (
            <p className="text-xs text-neutral-500">{description}</p>
          )}
        </div>
      </div>
      <motion.div
        animate={{ rotate: expandedSections[sectionKey] ? 180 : 0 }}
        transition={{ duration: 0.3 }}
      >
        <ChevronDown className="w-5 h-5 text-neutral-400 group-hover:text-primary-600" />
      </motion.div>
    </motion.button>
  );

  // 赛事类型选项
  const contestTypeOptions = [
    { value: 'algorithm', label: '🧠 算法竞赛' },
    { value: 'application', label: '📱 应用开发' },
    { value: 'innovation', label: '💡 创新设计' },
    { value: 'research', label: '📚 科研论文' },
    { value: 'comprehensive', label: '🏆 综合竞赛' },
  ];

  return (
    <div className="p-6 space-y-5">
      {/* 1. 基础信息：赛事名称与类型 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="border border-neutral-200 rounded-xl overflow-hidden shadow-card hover:shadow-card-hover transition-shadow duration-300"
      >
        <SectionHeader
          title="赛事名称与类型"
          icon={FileText}
          sectionKey="basic"
          badge="必填"
          description="设置赛事的基本信息"
        />
        <AnimatePresence>
          {expandedSections.basic && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className="p-6 space-y-5 bg-neutral-50">
                {/* 两列布局 (屏幕宽度≥ 1200px) */}
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
                  {/* 赛事名称 */}
                  <div>
                    <FloatingLabelInput
                      label="赛事名称"
                      value={data.name}
                      onChange={(value) => handleChange('name', value)}
                      error={errors.name}
                      required
                      placeholder="例如：2024年全国大学生AI创新大赛"
                    />
                  </div>

                  {/* 赛事类型 */}
                  <div>
                    <AnimatedSelect
                      label="赛事类型"
                      value={data.type}
                      onChange={(value) => handleChange('type', value)}
                      options={contestTypeOptions}
                      error={errors.type}
                      required
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* 2. 时间与地点 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="border border-neutral-200 rounded-xl overflow-hidden shadow-card hover:shadow-card-hover transition-shadow duration-300"
      >
        <SectionHeader
          title="赛事时间与地点"
          icon={Calendar}
          sectionKey="timePlace"
          badge="必填"
          description="配置赛事的关键时间节点和举办地点"
        />
        <AnimatePresence>
          {expandedSections.timePlace && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className="p-6 space-y-5 bg-neutral-50">
                {/* 报名时间 - 两列布局 */}
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
                  <div>
                    <FloatingLabelInput
                      label="报名开始时间"
                      value={data.timeAndPlace.registrationStart}
                      onChange={(value) => handleNestedChange('timeAndPlace', 'registrationStart', value)}
                      type="datetime-local"
                      required
                    />
                  </div>
                  <div>
                    <FloatingLabelInput
                      label="报名截止时间"
                      value={data.timeAndPlace.registrationEnd}
                      onChange={(value) => handleNestedChange('timeAndPlace', 'registrationEnd', value)}
                      type="datetime-local"
                      required
                    />
                  </div>
                </div>

                {/* 赛事时间 - 两列布局 */}
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
                  <div>
                    <FloatingLabelInput
                      label="赛事开始时间"
                      value={data.timeAndPlace.startDate}
                      onChange={(value) => handleNestedChange('timeAndPlace', 'startDate', value)}
                      error={errors.startDate}
                      type="datetime-local"
                      required
                    />
                  </div>
                  <div>
                    <FloatingLabelInput
                      label="赛事结束时间"
                      value={data.timeAndPlace.endDate}
                      onChange={(value) => handleNestedChange('timeAndPlace', 'endDate', value)}
                      error={errors.endDate}
                      type="datetime-local"
                      required
                    />
                  </div>
                </div>

                {/* 线上/线下模式切换 */}
                <div className="bg-white rounded-xl p-5 border border-neutral-200">
                  <Switch
                    checked={data.timeAndPlace.onlineMode}
                    onChange={(checked) => handleNestedChange('timeAndPlace', 'onlineMode', checked)}
                    label="线上赛事"
                    description="开启后无需填写赛事地点"
                  />
                </div>

                {/* 赛事地点 - 有展开/收起动画 */}
                <AnimatePresence>
                  {!data.timeAndPlace.onlineMode ? (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <FloatingLabelInput
                        label="赛事地点"
                        value={data.timeAndPlace.location}
                        onChange={(value) => handleNestedChange('timeAndPlace', 'location', value)}
                        error={errors.location}
                        required
                        placeholder="例如：北京市海淀区清华大学"
                      />
                    </motion.div>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="flex items-center gap-2 text-sm text-neutral-500 bg-primary-50 px-4 py-3 rounded-lg border border-primary-200"
                    >
                      <Info className="w-4 h-4 text-primary-600" />
                      <span>线上赛事无需填写地点</span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* 3. 激励设置 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
        className="border border-neutral-200 rounded-xl overflow-hidden shadow-card hover:shadow-card-hover transition-shadow duration-300"
      >
        <SectionHeader
          title="赛事激励设置"
          icon={Trophy}
          sectionKey="incentives"
          description="配置奖项和其他激励措施"
        />
        <AnimatePresence>
          {expandedSections.incentives && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className="p-6 space-y-5 bg-neutral-50">
                {/* 奖项设置 - 卡片内分栏 */}
                <div className="bg-white rounded-xl p-5 border border-neutral-200">
                  <div className="flex items-center gap-2 mb-4">
                    <Award className="w-5 h-5 text-accent-500" />
                    <h4 className="text-sm font-semibold text-neutral-800">奖项设置</h4>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* 一等奖 */}
                    <div className="relative">
                      <FloatingLabelInput
                        label="🥇 一等奖"
                        value={data.incentives.firstPrize}
                        onChange={(value) => handleNestedChange('incentives', 'firstPrize', value)}
                        placeholder="10000元 + 证书"
                      />
                      {!data.incentives.firstPrize && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-neutral-400 pointer-events-none"
                        >
                          示例：10000元+证书
                        </motion.div>
                      )}
                    </div>

                    {/* 二等奖 */}
                    <div className="relative">
                      <FloatingLabelInput
                        label="🥈 二等奖"
                        value={data.incentives.secondPrize}
                        onChange={(value) => handleNestedChange('incentives', 'secondPrize', value)}
                        placeholder="5000元 + 证书"
                      />
                      {!data.incentives.secondPrize && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-neutral-400 pointer-events-none"
                        >
                          示例：5000元+证书
                        </motion.div>
                      )}
                    </div>

                    {/* 三等奖 */}
                    <div className="relative">
                      <FloatingLabelInput
                        label="🥉 三等奖"
                        value={data.incentives.thirdPrize}
                        onChange={(value) => handleNestedChange('incentives', 'thirdPrize', value)}
                        placeholder="2000元 + 证书"
                      />
                      {!data.incentives.thirdPrize && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-neutral-400 pointer-events-none"
                        >
                          示例：2000元+证书
                        </motion.div>
                      )}
                    </div>
                  </div>
                </div>

                {/* 其他激励 */}
                <div className="bg-white rounded-xl p-5 border border-neutral-200 space-y-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Sparkles className="w-5 h-5 text-accent-500" />
                    <h4 className="text-sm font-semibold text-neutral-800">其他激励</h4>
                  </div>
                  
                  {/* 参赛证书开关 */}
                  <Switch
                    checked={data.incentives.certificate}
                    onChange={(checked) => handleNestedChange('incentives', 'certificate', checked)}
                    label="颁发参赛证书"
                    description="所有完成赛事的选手都将获得证书"
                  />

                  {/* 其他奖励 */}
                  <FloatingLabelInput
                    label="其他奖励"
                    value={data.incentives.scholarship}
                    onChange={(value) => handleNestedChange('incentives', 'scholarship', value)}
                    placeholder="例如：奖学金、实习机会等"
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* 4. 关键节点 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.3 }}
        className="border border-neutral-200 rounded-xl overflow-hidden shadow-card hover:shadow-card-hover transition-shadow duration-300"
      >
        <SectionHeader
          title="关键赛程节点"
          icon={Clock}
          sectionKey="milestones"
          description="设置赛事的重要时间节点"
        />
        <AnimatePresence>
          {expandedSections.milestones && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className="p-6 space-y-4 bg-neutral-50">
                <AnimatePresence>
                  {data.milestones.map((milestone, index) => (
                    <motion.div
                      key={milestone.id}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -100 }}
                      className="p-4 bg-white rounded-xl border border-neutral-200 shadow-sm hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <span className="px-2 py-1 bg-primary-100 text-primary-700 text-xs font-semibold rounded-full">
                          节点 {index + 1}
                        </span>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => removeMilestone(milestone.id)}
                          className="text-red-500 hover:text-red-700 transition-colors"
                        >
                          <X className="w-5 h-5" />
                        </motion.button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <FloatingLabelInput
                          label="节点名称"
                          value={milestone.title}
                          onChange={(value) => updateMilestone(milestone.id, 'title', value)}
                          placeholder="例如：初赛提交"
                        />
                        <FloatingLabelInput
                          label="节点日期"
                          value={milestone.date}
                          onChange={(value) => updateMilestone(milestone.id, 'date', value)}
                          type="date"
                        />
                      </div>
                      <div className="mt-3">
                        <FloatingLabelInput
                          label="节点说明"
                          value={milestone.description}
                          onChange={(value) => updateMilestone(milestone.id, 'description', value)}
                          placeholder="详细说明该节点的要求"
                        />
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
                <motion.button
                  whileHover={{ scale: 1.01, borderColor: '#4066FF' }}
                  whileTap={{ scale: 0.99 }}
                  onClick={addMilestone}
                  className="w-full py-3 border-2 border-dashed border-neutral-300 rounded-xl text-neutral-600 hover:text-primary-600 transition-colors font-medium"
                >
                  + 添加关键节点
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* 5. 参与对象范围 */}
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <SectionHeader
          title="配置参赛对象范围"
          icon="👥"
          sectionKey="scope"
        />
        {expandedSections.scope && (
          <div className="p-4 space-y-4 bg-gray-50">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                学校类型
              </label>
              <div className="flex flex-wrap gap-3">
                {['985高校', '211高校', '双一流', '普通本科', '高职高专'].map(type => (
                  <label key={type} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={data.participantScope.schoolTypes.includes(type)}
                      onChange={(e) => {
                        const newTypes = e.target.checked
                          ? [...data.participantScope.schoolTypes, type]
                          : data.participantScope.schoolTypes.filter(t => t !== type);
                        handleNestedChange('participantScope', 'schoolTypes', newTypes);
                      }}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">{type}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                年级范围
              </label>
              <div className="flex flex-wrap gap-3">
                {['大一', '大二', '大三', '大四', '研究生', '博士生'].map(grade => (
                  <label key={grade} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={data.participantScope.grades.includes(grade)}
                      onChange={(e) => {
                        const newGrades = e.target.checked
                          ? [...data.participantScope.grades, grade]
                          : data.participantScope.grades.filter(g => g !== grade);
                        handleNestedChange('participantScope', 'grades', newGrades);
                      }}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">{grade}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  最小团队人数
                </label>
                <input
                  type="number"
                  min="1"
                  value={data.participantScope.minTeamSize}
                  onChange={(e) => handleNestedChange('participantScope', 'minTeamSize', parseInt(e.target.value))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  最大团队人数
                </label>
                <input
                  type="number"
                  min="1"
                  value={data.participantScope.maxTeamSize}
                  onChange={(e) => handleNestedChange('participantScope', 'maxTeamSize', parseInt(e.target.value))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 6. 报名条件与限制 */}
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <SectionHeader
          title="配置报名条件与限制"
          icon="📋"
          sectionKey="registration"
        />
        {expandedSections.registration && (
          <div className="p-4 space-y-4 bg-gray-50">
            <div className="flex items-center space-x-6">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={data.registrationRules.requireResume}
                  onChange={(e) => {
                    onChange({
                      ...data,
                      registrationRules: {
                        ...data.registrationRules,
                        requireResume: e.target.checked
                      }
                    });
                  }}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">要求上传简历</span>
              </label>

              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={data.registrationRules.requirePortfolio}
                  onChange={(e) => {
                    onChange({
                      ...data,
                      registrationRules: {
                        ...data.registrationRules,
                        requirePortfolio: e.target.checked
                      }
                    });
                  }}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">要求作品集</span>
              </label>
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-medium text-gray-700">
                  自定义报名字段
                </label>
              </div>

              {data.registrationRules.customFields.map((field, index) => (
                <div key={field.id} className="p-3 bg-white rounded-lg border border-gray-200 mb-3">
                  <div className="flex items-start justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">字段 {index + 1}</span>
                    <button
                      onClick={() => removeCustomField(field.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <input
                      type="text"
                      value={field.label}
                      onChange={(e) => updateCustomField(field.id, 'label', e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="字段名称"
                    />
                    <select
                      value={field.type}
                      onChange={(e) => updateCustomField(field.id, 'type', e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="text">文本</option>
                      <option value="number">数字</option>
                      <option value="email">邮箱</option>
                      <option value="tel">电话</option>
                      <option value="date">日期</option>
                      <option value="file">文件</option>
                    </select>
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={field.required}
                        onChange={(e) => updateCustomField(field.id, 'required', e.target.checked)}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">必填</span>
                    </label>
                  </div>
                </div>
              ))}

              <button
                onClick={addCustomField}
                className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-500 hover:text-blue-600 transition-colors"
              >
                + 添加自定义字段
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 7. 赛事规则说明 */}
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <SectionHeader
          title="自定义赛事规则说明"
          icon="📖"
          sectionKey="rules"
        />
        {expandedSections.rules && (
          <div className="p-4 bg-gray-50">
            <textarea
              value={data.rules}
              onChange={(e) => handleChange('rules', e.target.value)}
              rows="8"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="请输入赛事的详细规则说明，包括评分标准、提交要求、注意事项等..."
            ></textarea>
            <p className="mt-2 text-sm text-gray-500">
              支持Markdown格式，可以添加标题、列表、链接等
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BasicInfoForm;
