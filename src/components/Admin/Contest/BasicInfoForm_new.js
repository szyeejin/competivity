import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText, Calendar, Trophy, MapPin, Users, ClipboardList,
  ChevronDown, Plus, X, Award, Clock, Info, Check, Globe
} from 'lucide-react';
import Input from '../../UI/Input';
import Select from '../../UI/Select';
import Button from '../../UI/Button';
import Badge from '../../UI/Badge';

/**
 * 赛事基础信息表单 - 大厂标准升级版
 * 特性：折叠面板、微动画、实时验证、智能提示
 */
const BasicInfoForm = ({ data, errors, onChange }) => {
  const [expandedSections, setExpandedSections] = useState({
    basic: true,
    timePlace: true,
    incentives: false,
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

  const handleChange = (field, value) => {
    onChange({ ...data, [field]: value });
  };

  const handleNestedChange = (parent, field, value) => {
    onChange({
      ...data,
      [parent]: { ...data[parent], [field]: value }
    });
  };

  // 关键节点操作
  const addMilestone = () => {
    onChange({
      ...data,
      milestones: [...data.milestones, {
        id: Date.now(),
        title: '',
        date: '',
        description: ''
      }]
    });
  };

  const removeMilestone = (id) => {
    onChange({
      ...data,
      milestones: data.milestones.filter(m => m.id !== id)
    });
  };

  const updateMilestone = (id, field, value) => {
    onChange({
      ...data,
      milestones: data.milestones.map(m =>
        m.id === id ? { ...m, [field]: value } : m
      )
    });
  };

  // 自定义字段操作
  const addCustomField = () => {
    onChange({
      ...data,
      registrationRules: {
        ...data.registrationRules,
        customFields: [...data.registrationRules.customFields, {
          id: Date.now(),
          label: '',
          type: 'text',
          required: false
        }]
      }
    });
  };

  const removeCustomField = (id) => {
    onChange({
      ...data,
      registrationRules: {
        ...data.registrationRules,
        customFields: data.registrationRules.customFields.filter(f => f.id !== id)
      }
    });
  };

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

  // 折叠面板组件
  const SectionPanel = ({ title, icon: Icon, sectionKey, badge, children, required }) => {
    const isExpanded = expandedSections[sectionKey];
    
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="border border-gray-200 rounded-xl overflow-hidden bg-white hover:shadow-md transition-shadow"
      >
        {/* 标题栏 */}
        <motion.button
          onClick={() => toggleSection(sectionKey)}
          whileHover={{ backgroundColor: '#f9fafb' }}
          className="w-full flex items-center justify-between p-5 transition-colors"
        >
          <div className="flex items-center gap-4">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
              isExpanded
                ? 'bg-gradient-to-br from-primary-500 to-primary-600 shadow-lg'
                : 'bg-gray-100'
            }`}>
              <Icon className={`w-5 h-5 ${isExpanded ? 'text-white' : 'text-gray-500'}`} />
            </div>
            <div className="text-left">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
                {required && <Badge variant="danger" size="sm">必填</Badge>}
                {badge && <Badge variant="primary" size="sm">{badge}</Badge>}
              </div>
            </div>
          </div>
          
          <motion.div
            animate={{ rotate: isExpanded ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronDown className="w-5 h-5 text-gray-400" />
          </motion.div>
        </motion.button>

        {/* 内容区 */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
            >
              <div className="p-6 bg-gradient-to-br from-gray-50 to-white border-t border-gray-100">
                {children}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    );
  };

  const contestTypeOptions = [
    { value: '', label: '请选择赛事类型' },
    { value: 'algorithm', label: '🧮 算法竞赛' },
    { value: 'application', label: '💻 应用开发' },
    { value: 'innovation', label: '💡 创新设计' },
    { value: 'research', label: '📚 科研论文' },
    { value: 'comprehensive', label: '🎯 综合竞赛' }
  ];

  return (
    <div className="p-6 space-y-6">
      {/* 1. 基础信息 */}
      <SectionPanel
        title="赛事名称与类型"
        icon={FileText}
        sectionKey="basic"
        required
      >
        <div className="space-y-5">
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
            error={errors.type}
            options={contestTypeOptions}
            required
            icon={Award}
            tooltip="选择最符合赛事性质的类型，这将影响报名表单和评审流程"
          />
        </div>
      </SectionPanel>

      {/* 2. 时间与地点 */}
      <SectionPanel
        title="赛事时间与地点"
        icon={Calendar}
        sectionKey="timePlace"
        required
      >
        <div className="space-y-5">
          {/* 报名时间 */}
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="报名开始时间"
              type="datetime-local"
              value={data.timeAndPlace.registrationStart}
              onChange={(e) => handleNestedChange('timeAndPlace', 'registrationStart', e.target.value)}
              required
              icon={Clock}
            />
            <Input
              label="报名截止时间"
              type="datetime-local"
              value={data.timeAndPlace.registrationEnd}
              onChange={(e) => handleNestedChange('timeAndPlace', 'registrationEnd', e.target.value)}
              required
              icon={Clock}
            />
          </div>

          {/* 赛事时间 */}
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="赛事开始时间"
              type="datetime-local"
              value={data.timeAndPlace.startDate}
              onChange={(e) => handleNestedChange('timeAndPlace', 'startDate', e.target.value)}
              error={errors.startDate}
              required
              icon={Calendar}
              tooltip="赛事正式开始的时间"
            />
            <Input
              label="赛事结束时间"
              type="datetime-local"
              value={data.timeAndPlace.endDate}
              onChange={(e) => handleNestedChange('timeAndPlace', 'endDate', e.target.value)}
              error={errors.endDate}
              required
              icon={Calendar}
              tooltip="赛事正式结束的时间"
            />
          </div>

          {/* 线上/线下 */}
          <div className="space-y-4">
            <motion.label
              whileHover={{ x: 2 }}
              className="flex items-center gap-3 p-4 bg-white rounded-xl border-2 border-gray-200 hover:border-primary-300 transition-all cursor-pointer"
            >
              <input
                type="checkbox"
                checked={data.timeAndPlace.onlineMode}
                onChange={(e) => handleNestedChange('timeAndPlace', 'onlineMode', e.target.checked)}
                className="w-5 h-5 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
              />
              <Globe className="w-5 h-5 text-primary-500" />
              <div className="flex-1">
                <span className="font-medium text-gray-900">线上赛事</span>
                <p className="text-sm text-gray-500">勾选后无需填写具体地点</p>
              </div>
              {data.timeAndPlace.onlineMode && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                >
                  <Check className="w-5 h-5 text-green-500" />
                </motion.div>
              )}
            </motion.label>

            <AnimatePresence>
              {!data.timeAndPlace.onlineMode && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <Input
                    label="赛事地点"
                    value={data.timeAndPlace.location}
                    onChange={(e) => handleNestedChange('timeAndPlace', 'location', e.target.value)}
                    error={errors.location}
                    required
                    placeholder="例如：北京市海淀区清华大学"
                    icon={MapPin}
                    tooltip="请提供详细的赛事举办地址"
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </SectionPanel>

      {/* 3. 激励设置 */}
      <SectionPanel
        title="赛事激励设置"
        icon={Trophy}
        sectionKey="incentives"
      >
        <div className="space-y-5">
          <div className="grid grid-cols-3 gap-4">
            <Input
              label="一等奖奖励"
              value={data.incentives.firstPrize}
              onChange={(e) => handleNestedChange('incentives', 'firstPrize', e.target.value)}
              placeholder="10000元+证书"
              icon={Trophy}
            />
            <Input
              label="二等奖奖励"
              value={data.incentives.secondPrize}
              onChange={(e) => handleNestedChange('incentives', 'secondPrize', e.target.value)}
              placeholder="5000元+证书"
              icon={Award}
            />
            <Input
              label="三等奖奖励"
              value={data.incentives.thirdPrize}
              onChange={(e) => handleNestedChange('incentives', 'thirdPrize', e.target.value)}
              placeholder="2000元+证书"
              icon={Award}
            />
          </div>

          <div className="flex items-center gap-4">
            <motion.label
              whileHover={{ x: 2 }}
              className="flex items-center gap-3 p-4 bg-white rounded-xl border-2 border-gray-200 hover:border-primary-300 transition-all cursor-pointer flex-1"
            >
              <input
                type="checkbox"
                checked={data.incentives.certificate}
                onChange={(e) => handleNestedChange('incentives', 'certificate', e.target.checked)}
                className="w-5 h-5 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
              />
              <span className="font-medium text-gray-700">颁发参赛证书</span>
              {data.incentives.certificate && (
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                  <Check className="w-5 h-5 text-green-500" />
                </motion.div>
              )}
            </motion.label>

            <Input
              value={data.incentives.scholarship}
              onChange={(e) => handleNestedChange('incentives', 'scholarship', e.target.value)}
              placeholder="其他奖励（选填）"
              className="flex-1"
            />
          </div>
        </div>
      </SectionPanel>

      {/* 4. 关键节点 */}
      <SectionPanel
        title="关键赛程节点"
        icon={ClipboardList}
        sectionKey="milestones"
        badge={`${data.milestones.length} 个节点`}
      >
        <div className="space-y-4">
          <AnimatePresence>
            {data.milestones.map((milestone, index) => (
              <motion.div
                key={milestone.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="p-4 bg-white rounded-xl border-2 border-gray-200 hover:border-primary-200 transition-all"
              >
                <div className="flex items-start justify-between mb-3">
                  <Badge variant="primary" size="sm">节点 {index + 1}</Badge>
                  <motion.button
                    whileHover={{ scale: 1.1, rotate: 90 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => removeMilestone(milestone.id)}
                    className="text-red-500 hover:text-red-600 p-1 rounded-lg hover:bg-red-50 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </motion.button>
                </div>
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <Input
                    value={milestone.title}
                    onChange={(e) => updateMilestone(milestone.id, 'title', e.target.value)}
                    placeholder="节点名称"
                  />
                  <Input
                    type="date"
                    value={milestone.date}
                    onChange={(e) => updateMilestone(milestone.id, 'date', e.target.value)}
                  />
                </div>
                <Input
                  value={milestone.description}
                  onChange={(e) => updateMilestone(milestone.id, 'description', e.target.value)}
                  placeholder="节点说明"
                />
              </motion.div>
            ))}
          </AnimatePresence>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={addMilestone}
            className="w-full py-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-600 hover:border-primary-500 hover:text-primary-600 hover:bg-primary-50 transition-all flex items-center justify-center gap-2 font-medium"
          >
            <Plus className="w-5 h-5" />
            添加关键节点
          </motion.button>
        </div>
      </SectionPanel>

      {/* 5. 参与范围 */}
      <SectionPanel
        title="配置参赛对象范围"
        icon={Users}
        sectionKey="scope"
      >
        <div className="space-y-5">
          {/* 学校类型 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              学校类型
            </label>
            <div className="flex flex-wrap gap-3">
              {['985高校', '211高校', '双一流', '普通本科', '高职高专'].map(type => (
                <motion.label
                  key={type}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl border-2 cursor-pointer transition-all ${
                    data.participantScope.schoolTypes.includes(type)
                      ? 'border-primary-500 bg-primary-50 text-primary-700'
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={data.participantScope.schoolTypes.includes(type)}
                    onChange={(e) => {
                      const newTypes = e.target.checked
                        ? [...data.participantScope.schoolTypes, type]
                        : data.participantScope.schoolTypes.filter(t => t !== type);
                      handleNestedChange('participantScope', 'schoolTypes', newTypes);
                    }}
                    className="sr-only"
                  />
                  <span className="text-sm font-medium">{type}</span>
                  {data.participantScope.schoolTypes.includes(type) && (
                    <Check className="w-4 h-4" />
                  )}
                </motion.label>
              ))}
            </div>
          </div>

          {/* 年级范围 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              年级范围
            </label>
            <div className="flex flex-wrap gap-3">
              {['大一', '大二', '大三', '大四', '研究生', '博士生'].map(grade => (
                <motion.label
                  key={grade}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl border-2 cursor-pointer transition-all ${
                    data.participantScope.grades.includes(grade)
                      ? 'border-primary-500 bg-primary-50 text-primary-700'
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={data.participantScope.grades.includes(grade)}
                    onChange={(e) => {
                      const newGrades = e.target.checked
                        ? [...data.participantScope.grades, grade]
                        : data.participantScope.grades.filter(g => g !== grade);
                      handleNestedChange('participantScope', 'grades', newGrades);
                    }}
                    className="sr-only"
                  />
                  <span className="text-sm font-medium">{grade}</span>
                  {data.participantScope.grades.includes(grade) && (
                    <Check className="w-4 h-4" />
                  )}
                </motion.label>
              ))}
            </div>
          </div>

          {/* 团队人数 */}
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="最小团队人数"
              type="number"
              min="1"
              value={data.participantScope.minTeamSize}
              onChange={(e) => handleNestedChange('participantScope', 'minTeamSize', parseInt(e.target.value))}
              icon={Users}
            />
            <Input
              label="最大团队人数"
              type="number"
              min="1"
              value={data.participantScope.maxTeamSize}
              onChange={(e) => handleNestedChange('participantScope', 'maxTeamSize', parseInt(e.target.value))}
              icon={Users}
            />
          </div>
        </div>
      </SectionPanel>

      {/* 6. 报名条件 */}
      <SectionPanel
        title="配置报名条件与限制"
        icon={ClipboardList}
        sectionKey="registration"
      >
        <div className="space-y-5">
          <div className="flex gap-4">
            <motion.label
              whileHover={{ x: 2 }}
              className="flex items-center gap-3 p-4 bg-white rounded-xl border-2 border-gray-200 hover:border-primary-300 transition-all cursor-pointer flex-1"
            >
              <input
                type="checkbox"
                checked={data.registrationRules.requireResume}
                onChange={(e) => onChange({
                  ...data,
                  registrationRules: {
                    ...data.registrationRules,
                    requireResume: e.target.checked
                  }
                })}
                className="w-5 h-5 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
              />
              <span className="font-medium text-gray-700">要求上传简历</span>
              {data.registrationRules.requireResume && (
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                  <Check className="w-5 h-5 text-green-500" />
                </motion.div>
              )}
            </motion.label>

            <motion.label
              whileHover={{ x: 2 }}
              className="flex items-center gap-3 p-4 bg-white rounded-xl border-2 border-gray-200 hover:border-primary-300 transition-all cursor-pointer flex-1"
            >
              <input
                type="checkbox"
                checked={data.registrationRules.requirePortfolio}
                onChange={(e) => onChange({
                  ...data,
                  registrationRules: {
                    ...data.registrationRules,
                    requirePortfolio: e.target.checked
                  }
                })}
                className="w-5 h-5 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
              />
              <span className="font-medium text-gray-700">要求作品集</span>
              {data.registrationRules.requirePortfolio && (
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                  <Check className="w-5 h-5 text-green-500" />
                </motion.div>
              )}
            </motion.label>
          </div>

          {/* 自定义字段 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              自定义报名字段
            </label>
            
            <div className="space-y-3">
              <AnimatePresence>
                {data.registrationRules.customFields.map((field, index) => (
                  <motion.div
                    key={field.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="p-4 bg-white rounded-xl border-2 border-gray-200"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <Badge variant="secondary" size="sm">字段 {index + 1}</Badge>
                      <motion.button
                        whileHover={{ scale: 1.1, rotate: 90 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => removeCustomField(field.id)}
                        className="text-red-500 hover:text-red-600 p-1 rounded-lg hover:bg-red-50"
                      >
                        <X className="w-4 h-4" />
                      </motion.button>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      <Input
                        value={field.label}
                        onChange={(e) => updateCustomField(field.id, 'label', e.target.value)}
                        placeholder="字段名称"
                      />
                      <select
                        value={field.type}
                        onChange={(e) => updateCustomField(field.id, 'type', e.target.value)}
                        className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none"
                      >
                        <option value="text">文本</option>
                        <option value="number">数字</option>
                        <option value="email">邮箱</option>
                        <option value="tel">电话</option>
                        <option value="date">日期</option>
                        <option value="file">文件</option>
                      </select>
                      <motion.label
                        whileHover={{ x: 2 }}
                        className="flex items-center gap-2 px-4 py-3 bg-gray-50 rounded-xl cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={field.required}
                          onChange={(e) => updateCustomField(field.id, 'required', e.target.checked)}
                          className="w-4 h-4 text-primary-600 border-gray-300 rounded"
                        />
                        <span className="text-sm font-medium text-gray-700">必填</span>
                      </motion.label>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={addCustomField}
                className="w-full py-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-600 hover:border-primary-500 hover:text-primary-600 hover:bg-primary-50 transition-all flex items-center justify-center gap-2 font-medium"
              >
                <Plus className="w-5 h-5" />
                添加自定义字段
              </motion.button>
            </div>
          </div>
        </div>
      </SectionPanel>

      {/* 7. 赛事规则 */}
      <SectionPanel
        title="自定义赛事规则说明"
        icon={FileText}
        sectionKey="rules"
      >
        <div className="space-y-3">
          <textarea
            value={data.rules}
            onChange={(e) => handleChange('rules', e.target.value)}
            rows="10"
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none resize-none"
            placeholder="请输入赛事的详细规则说明，包括评分标准、提交要求、注意事项等..."
          />
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Info className="w-4 h-4" />
            <span>支持Markdown格式，可以添加标题、列表、链接等</span>
          </div>
        </div>
      </SectionPanel>
    </div>
  );
};

export default BasicInfoForm;
