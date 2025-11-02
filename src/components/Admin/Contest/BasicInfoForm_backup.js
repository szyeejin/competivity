import React, { useState } from 'react';

/**
 * 赛事基础信息表单组件
 * 包含：赛事名称、类型、时间地点、激励设置、关键节点、参与范围、报名规则、赛事说明
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

  // 卡片标题组件
  const SectionHeader = ({ title, icon, sectionKey, badge }) => (
    <button
      onClick={() => toggleSection(sectionKey)}
      className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
    >
      <div className="flex items-center space-x-3">
        <span className="text-2xl">{icon}</span>
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        {badge && (
          <span className="px-2 py-1 bg-blue-100 text-blue-600 text-xs font-medium rounded">
            {badge}
          </span>
        )}
      </div>
      <svg
        className={`w-5 h-5 text-gray-500 transition-transform ${
          expandedSections[sectionKey] ? 'rotate-180' : ''
        }`}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    </button>
  );

  return (
    <div className="p-6 space-y-4">
      {/* 1. 基础信息：赛事名称与类型 */}
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <SectionHeader
          title="赛事名称与类型"
          icon="📝"
          sectionKey="basic"
          badge="必填"
        />
        {expandedSections.basic && (
          <div className="p-4 space-y-4 bg-gray-50">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                赛事名称 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={data.name}
                onChange={(e) => handleChange('name', e.target.value)}
                className={`w-full px-4 py-2 border ${
                  errors.name ? 'border-red-500' : 'border-gray-300'
                } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                placeholder="例如：2024年全国大学生AI创新大赛"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                赛事类型 <span className="text-red-500">*</span>
              </label>
              <select
                value={data.type}
                onChange={(e) => handleChange('type', e.target.value)}
                className={`w-full px-4 py-2 border ${
                  errors.type ? 'border-red-500' : 'border-gray-300'
                } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
              >
                <option value="">请选择赛事类型</option>
                <option value="algorithm">算法竞赛</option>
                <option value="application">应用开发</option>
                <option value="innovation">创新设计</option>
                <option value="research">科研论文</option>
                <option value="comprehensive">综合竞赛</option>
              </select>
              {errors.type && (
                <p className="mt-1 text-sm text-red-600">{errors.type}</p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* 2. 时间与地点 */}
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <SectionHeader
          title="赛事时间与地点"
          icon="📅"
          sectionKey="timePlace"
          badge="必填"
        />
        {expandedSections.timePlace && (
          <div className="p-4 space-y-4 bg-gray-50">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  报名开始时间 <span className="text-red-500">*</span>
                </label>
                <input
                  type="datetime-local"
                  value={data.timeAndPlace.registrationStart}
                  onChange={(e) => handleNestedChange('timeAndPlace', 'registrationStart', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  报名截止时间 <span className="text-red-500">*</span>
                </label>
                <input
                  type="datetime-local"
                  value={data.timeAndPlace.registrationEnd}
                  onChange={(e) => handleNestedChange('timeAndPlace', 'registrationEnd', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  赛事开始时间 <span className="text-red-500">*</span>
                </label>
                <input
                  type="datetime-local"
                  value={data.timeAndPlace.startDate}
                  onChange={(e) => handleNestedChange('timeAndPlace', 'startDate', e.target.value)}
                  className={`w-full px-4 py-2 border ${
                    errors.startDate ? 'border-red-500' : 'border-gray-300'
                  } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                />
                {errors.startDate && (
                  <p className="mt-1 text-sm text-red-600">{errors.startDate}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  赛事结束时间 <span className="text-red-500">*</span>
                </label>
                <input
                  type="datetime-local"
                  value={data.timeAndPlace.endDate}
                  onChange={(e) => handleNestedChange('timeAndPlace', 'endDate', e.target.value)}
                  className={`w-full px-4 py-2 border ${
                    errors.endDate ? 'border-red-500' : 'border-gray-300'
                  } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                />
                {errors.endDate && (
                  <p className="mt-1 text-sm text-red-600">{errors.endDate}</p>
                )}
              </div>
            </div>

            <div>
              <label className="flex items-center space-x-2 mb-3">
                <input
                  type="checkbox"
                  checked={data.timeAndPlace.onlineMode}
                  onChange={(e) => handleNestedChange('timeAndPlace', 'onlineMode', e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700">线上赛事</span>
              </label>

              {!data.timeAndPlace.onlineMode && (
                <>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    赛事地点 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={data.timeAndPlace.location}
                    onChange={(e) => handleNestedChange('timeAndPlace', 'location', e.target.value)}
                    className={`w-full px-4 py-2 border ${
                      errors.location ? 'border-red-500' : 'border-gray-300'
                    } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                    placeholder="例如：北京市海淀区清华大学"
                  />
                  {errors.location && (
                    <p className="mt-1 text-sm text-red-600">{errors.location}</p>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* 3. 激励设置 */}
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <SectionHeader
          title="赛事激励设置"
          icon="🏆"
          sectionKey="incentives"
        />
        {expandedSections.incentives && (
          <div className="p-4 space-y-4 bg-gray-50">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  一等奖奖励
                </label>
                <input
                  type="text"
                  value={data.incentives.firstPrize}
                  onChange={(e) => handleNestedChange('incentives', 'firstPrize', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="例如：10000元+证书"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  二等奖奖励
                </label>
                <input
                  type="text"
                  value={data.incentives.secondPrize}
                  onChange={(e) => handleNestedChange('incentives', 'secondPrize', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="例如：5000元+证书"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  三等奖奖励
                </label>
                <input
                  type="text"
                  value={data.incentives.thirdPrize}
                  onChange={(e) => handleNestedChange('incentives', 'thirdPrize', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="例如：2000元+证书"
                />
              </div>
            </div>

            <div className="flex items-center space-x-6">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={data.incentives.certificate}
                  onChange={(e) => handleNestedChange('incentives', 'certificate', e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">颁发参赛证书</span>
              </label>

              <div className="flex-1">
                <input
                  type="text"
                  value={data.incentives.scholarship}
                  onChange={(e) => handleNestedChange('incentives', 'scholarship', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="其他奖励（选填）"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 4. 关键节点 */}
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <SectionHeader
          title="关键赛程节点"
          icon="📍"
          sectionKey="milestones"
        />
        {expandedSections.milestones && (
          <div className="p-4 space-y-4 bg-gray-50">
            {data.milestones.map((milestone, index) => (
              <div key={milestone.id} className="p-4 bg-white rounded-lg border border-gray-200">
                <div className="flex items-start justify-between mb-3">
                  <span className="text-sm font-medium text-gray-700">节点 {index + 1}</span>
                  <button
                    onClick={() => removeMilestone(milestone.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    value={milestone.title}
                    onChange={(e) => updateMilestone(milestone.id, 'title', e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="节点名称"
                  />
                  <input
                    type="date"
                    value={milestone.date}
                    onChange={(e) => updateMilestone(milestone.id, 'date', e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <input
                  type="text"
                  value={milestone.description}
                  onChange={(e) => updateMilestone(milestone.id, 'description', e.target.value)}
                  className="mt-3 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="节点说明"
                />
              </div>
            ))}
            <button
              onClick={addMilestone}
              className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-500 hover:text-blue-600 transition-colors"
            >
              + 添加关键节点
            </button>
          </div>
        )}
      </div>

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
