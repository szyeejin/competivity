import React, { useState } from 'react';

/**
 * 赛事资源预配置管理表单组件
 * 包含：预算分类、AI场地分配、参与人员与资源、物资导号与导出、配置所需设备、提供资源统计功能
 */
const ResourceConfigForm = ({ data, errors, onChange }) => {
  // 展开/收起各个卡片
  const [expandedSections, setExpandedSections] = useState({
    budget: true,
    venue: true,
    personnel: true,
    equipment: false,
    materials: false,
    statistics: false
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

  // 添加预算分类
  const addBudgetCategory = () => {
    const newCategory = {
      id: Date.now(),
      name: '',
      amount: '',
      description: ''
    };
    onChange({
      ...data,
      budget: {
        ...data.budget,
        categories: [...data.budget.categories, newCategory]
      }
    });
  };

  // 删除预算分类
  const removeBudgetCategory = (id) => {
    onChange({
      ...data,
      budget: {
        ...data.budget,
        categories: data.budget.categories.filter(c => c.id !== id)
      }
    });
  };

  // 更新预算分类
  const updateBudgetCategory = (id, field, value) => {
    onChange({
      ...data,
      budget: {
        ...data.budget,
        categories: data.budget.categories.map(c =>
          c.id === id ? { ...c, [field]: value } : c
        )
      }
    });
  };

  // 添加场地
  const addVenue = () => {
    const newVenue = {
      id: Date.now(),
      name: '',
      capacity: '',
      address: '',
      facilities: []
    };
    onChange({
      ...data,
      venue: {
        ...data.venue,
        venues: [...data.venue.venues, newVenue]
      }
    });
  };

  // 删除场地
  const removeVenue = (id) => {
    onChange({
      ...data,
      venue: {
        ...data.venue,
        venues: data.venue.venues.filter(v => v.id !== id)
      }
    });
  };

  // 更新场地
  const updateVenue = (id, field, value) => {
    onChange({
      ...data,
      venue: {
        ...data.venue,
        venues: data.venue.venues.map(v =>
          v.id === id ? { ...v, [field]: value } : v
        )
      }
    });
  };

  // 添加场地设施标签
  const addVenueFacility = (venueId, facility) => {
    if (!facility.trim()) return;
    onChange({
      ...data,
      venue: {
        ...data.venue,
        venues: data.venue.venues.map(v =>
          v.id === venueId ? { ...v, facilities: [...(v.facilities || []), facility] } : v
        )
      }
    });
  };

  // 删除场地设施标签
  const removeVenueFacility = (venueId, facilityIndex) => {
    onChange({
      ...data,
      venue: {
        ...data.venue,
        venues: data.venue.venues.map(v =>
          v.id === venueId ? {
            ...v,
            facilities: v.facilities.filter((_, idx) => idx !== facilityIndex)
          } : v
        )
      }
    });
  };

  // 添加人员（组织者/评委/志愿者）
  const addPerson = (role) => {
    const newPerson = {
      id: Date.now(),
      name: '',
      email: '',
      phone: '',
      organization: ''
    };
    onChange({
      ...data,
      personnel: {
        ...data.personnel,
        [role]: [...data.personnel[role], newPerson]
      }
    });
  };

  // 删除人员
  const removePerson = (role, id) => {
    onChange({
      ...data,
      personnel: {
        ...data.personnel,
        [role]: data.personnel[role].filter(p => p.id !== id)
      }
    });
  };

  // 更新人员
  const updatePerson = (role, id, field, value) => {
    onChange({
      ...data,
      personnel: {
        ...data.personnel,
        [role]: data.personnel[role].map(p =>
          p.id === id ? { ...p, [field]: value } : p
        )
      }
    });
  };

  // 添加设备
  const addEquipment = () => {
    const newEquipment = {
      id: Date.now(),
      name: '',
      quantity: 1,
      status: 'available'
    };
    onChange({
      ...data,
      equipment: [...data.equipment, newEquipment]
    });
  };

  // 删除设备
  const removeEquipment = (id) => {
    onChange({
      ...data,
      equipment: data.equipment.filter(e => e.id !== id)
    });
  };

  // 更新设备
  const updateEquipment = (id, field, value) => {
    onChange({
      ...data,
      equipment: data.equipment.map(e =>
        e.id === id ? { ...e, [field]: value } : e
      )
    });
  };

  // 添加物资
  const addMaterial = () => {
    const newMaterial = {
      id: Date.now(),
      name: '',
      quantity: '',
      unit: ''
    };
    onChange({
      ...data,
      materials: [...data.materials, newMaterial]
    });
  };

  // 删除物资
  const removeMaterial = (id) => {
    onChange({
      ...data,
      materials: data.materials.filter(m => m.id !== id)
    });
  };

  // 更新物资
  const updateMaterial = (id, field, value) => {
    onChange({
      ...data,
      materials: data.materials.map(m =>
        m.id === id ? { ...m, [field]: value } : m
      )
    });
  };

  // 导出物资清单为CSV
  const exportMaterialsToCSV = () => {
    if (data.materials.length === 0) {
      alert('没有物资数据可导出');
      return;
    }

    const headers = ['物资名称', '数量', '单位'];
    const csvContent = [
      headers.join(','),
      ...data.materials.map(m => `${m.name},${m.quantity},${m.unit}`)
    ].join('\n');

    const blob = new Blob([`\uFEFF${csvContent}`], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `物资清单_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // 从文件导入物资
  const importMaterialsFromFile = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target.result;
        const lines = text.split('\n').filter(line => line.trim());
        
        // 跳过表头
        const dataLines = lines.slice(1);
        const importedMaterials = dataLines.map(line => {
          const [name, quantity, unit] = line.split(',').map(s => s.trim());
          return {
            id: Date.now() + Math.random(),
            name: name || '',
            quantity: quantity || '',
            unit: unit || ''
          };
        }).filter(m => m.name); // 过滤空行

        onChange({
          ...data,
          materials: [...data.materials, ...importedMaterials]
        });
        alert(`成功导入 ${importedMaterials.length} 条物资数据`);
      } catch (error) {
        alert('导入失败，请检查文件格式');
        console.error(error);
      }
    };
    reader.readAsText(file);
    event.target.value = ''; // 重置输入
  };

  // 清空所有物资
  const clearAllMaterials = () => {
    if (data.materials.length === 0) return;
    if (window.confirm('确定要清空所有物资吗？')) {
      onChange({ ...data, materials: [] });
    }
  };

  // 计算总预算
  const calculateTotalBudget = () => {
    return data.budget.categories.reduce((sum, cat) => {
      return sum + (parseFloat(cat.amount) || 0);
    }, 0);
  };

  // 计算预算使用百分比
  const getBudgetPercentage = () => {
    const total = parseFloat(data.budget.total) || 0;
    if (total === 0) return 0;
    return (calculateTotalBudget() / total) * 100;
  };

  // 判断是否超支
  const isOverBudget = () => {
    return calculateTotalBudget() > (parseFloat(data.budget.total) || 0);
  };

  // 计算场地总容量
  const getTotalVenueCapacity = () => {
    return data.venue.venues.reduce((sum, venue) => {
      return sum + (parseInt(venue.capacity) || 0);
    }, 0);
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
          <span className="px-2 py-1 bg-green-100 text-green-600 text-xs font-medium rounded">
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
      {/* 1. 预算赛事预算与分类 */}
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <SectionHeader
          title="预设赛事预算与分类"
          icon="💰"
          sectionKey="budget"
        />
        {expandedSections.budget && (
          <div className="p-4 space-y-4 bg-gray-50">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                总预算金额（元）
              </label>
              <input
                type="number"
                value={data.budget.total}
                onChange={(e) => handleNestedChange('budget', 'total', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="请输入总预算"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-medium text-gray-700">
                  预算分类明细
                </label>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-600">
                    已分配：¥{calculateTotalBudget().toLocaleString()}
                  </span>
                  <span className={`text-sm font-semibold ${
                    isOverBudget() ? 'text-red-600' : 'text-green-600'
                  }`}>
                    {getBudgetPercentage().toFixed(1)}%
                  </span>
                </div>
              </div>

              {/* 预算进度条 */}
              <div className="mb-4">
                <div className="relative w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-500 ${
                      isOverBudget() 
                        ? 'bg-gradient-to-r from-red-500 to-red-600' 
                        : 'bg-gradient-to-r from-blue-500 to-blue-600'
                    }`}
                    style={{ width: `${Math.min(getBudgetPercentage(), 100)}%` }}
                  />
                </div>
                {isOverBudget() && (
                  <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                    <svg className="w-4 h-4 text-red-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <p className="text-xs text-red-700">
                      预算已超支 ¥{(calculateTotalBudget() - (parseFloat(data.budget.total) || 0)).toLocaleString()}
                    </p>
                  </div>
                )}
              </div>

              {data.budget.categories.map((category, index) => (
                <div key={category.id} className="p-4 bg-white rounded-lg border border-gray-200 mb-3">
                  <div className="flex items-start justify-between mb-3">
                    <span className="text-sm font-medium text-gray-700">分类 {index + 1}</span>
                    <button
                      onClick={() => removeBudgetCategory(category.id)}
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
                      value={category.name}
                      onChange={(e) => updateBudgetCategory(category.id, 'name', e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="分类名称（如：场地租赁）"
                    />
                    <input
                      type="number"
                      value={category.amount}
                      onChange={(e) => updateBudgetCategory(category.id, 'amount', e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="金额"
                    />
                  </div>
                  <input
                    type="text"
                    value={category.description}
                    onChange={(e) => updateBudgetCategory(category.id, 'description', e.target.value)}
                    className="mt-3 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="说明"
                  />
                </div>
              ))}

              <button
                onClick={addBudgetCategory}
                className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-500 hover:text-blue-600 transition-colors"
              >
                + 添加预算分类
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 2. AI智能场地分配管理 */}
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <SectionHeader
          title="AI智能场地分配管理"
          icon="🏢"
          sectionKey="venue"
        />
        {expandedSections.venue && (
          <div className="p-4 space-y-4 bg-gray-50">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={data.venue.autoAssign}
                onChange={(e) => handleNestedChange('venue', 'autoAssign', e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700">
                启用AI智能分配（根据容量和设施自动匹配）
              </span>
            </label>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                可用场地列表
              </label>

              {data.venue.venues.map((venue, index) => (
                <div key={venue.id} className="p-4 bg-white rounded-lg border border-gray-200 mb-3">
                  <div className="flex items-start justify-between mb-3">
                    <span className="text-sm font-medium text-gray-700">场地 {index + 1}</span>
                    <button
                      onClick={() => removeVenue(venue.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <input
                      type="text"
                      value={venue.name}
                      onChange={(e) => updateVenue(venue.id, 'name', e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="场地名称"
                    />
                    <input
                      type="number"
                      value={venue.capacity}
                      onChange={(e) => updateVenue(venue.id, 'capacity', e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="容纳人数"
                    />
                  </div>
                  <input
                    type="text"
                    value={venue.address}
                    onChange={(e) => updateVenue(venue.id, 'address', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="详细地址"
                  />
                  
                  {/* 场地设施标签 */}
                  <div className="mt-3">
                    <label className="block text-xs font-medium text-gray-600 mb-2">场地设施</label>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {(venue.facilities || []).map((facility, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 text-xs rounded-full"
                        >
                          {facility}
                          <button
                            onClick={() => removeVenueFacility(venue.id, idx)}
                            className="hover:text-blue-900"
                          >
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </span>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        id={`facility-input-${venue.id}`}
                        className="flex-1 px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="输入设施名称（如：投影仪、音响）"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            const input = e.target;
                            addVenueFacility(venue.id, input.value);
                            input.value = '';
                          }
                        }}
                      />
                      <button
                        onClick={() => {
                          const input = document.getElementById(`facility-input-${venue.id}`);
                          if (input && input.value) {
                            addVenueFacility(venue.id, input.value);
                            input.value = '';
                          }
                        }}
                        className="px-3 py-1.5 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600"
                      >
                        添加
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              <button
                onClick={addVenue}
                className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-500 hover:text-blue-600 transition-colors"
              >
                + 添加场地
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 3. 设定参与人员与资源 */}
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <SectionHeader
          title="设定参与人员与资源"
          icon="👨‍💼"
          sectionKey="personnel"
        />
        {expandedSections.personnel && (
          <div className="p-4 space-y-6 bg-gray-50">
            {/* 组织者 */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-medium text-gray-700">
                  组织者团队
                </label>
                <button
                  onClick={() => addPerson('organizers')}
                  className="px-3 py-1 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  + 添加组织者
                </button>
              </div>
              {data.personnel.organizers.map((person, index) => (
                <div key={person.id} className="p-3 bg-white rounded-lg border border-gray-200 mb-2">
                  <div className="flex items-start justify-between mb-2">
                    <span className="text-xs text-gray-500">组织者 {index + 1}</span>
                    <button
                      onClick={() => removePerson('organizers', person.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={person.name}
                      onChange={(e) => updatePerson('organizers', person.id, 'name', e.target.value)}
                      className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="姓名"
                    />
                    <input
                      type="text"
                      value={person.organization}
                      onChange={(e) => updatePerson('organizers', person.id, 'organization', e.target.value)}
                      className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="所属单位"
                    />
                    <input
                      type="email"
                      value={person.email}
                      onChange={(e) => updatePerson('organizers', person.id, 'email', e.target.value)}
                      className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="邮箱"
                    />
                    <input
                      type="tel"
                      value={person.phone}
                      onChange={(e) => updatePerson('organizers', person.id, 'phone', e.target.value)}
                      className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="电话"
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* 评审专家 */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-medium text-gray-700">
                  评审专家团队
                </label>
                <button
                  onClick={() => addPerson('judges')}
                  className="px-3 py-1 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                >
                  + 添加评审
                </button>
              </div>
              {data.personnel.judges.map((person, index) => (
                <div key={person.id} className="p-3 bg-white rounded-lg border border-gray-200 mb-2">
                  <div className="flex items-start justify-between mb-2">
                    <span className="text-xs text-gray-500">评审 {index + 1}</span>
                    <button
                      onClick={() => removePerson('judges', person.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={person.name}
                      onChange={(e) => updatePerson('judges', person.id, 'name', e.target.value)}
                      className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="姓名"
                    />
                    <input
                      type="text"
                      value={person.organization}
                      onChange={(e) => updatePerson('judges', person.id, 'organization', e.target.value)}
                      className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="所属单位"
                    />
                    <input
                      type="email"
                      value={person.email}
                      onChange={(e) => updatePerson('judges', person.id, 'email', e.target.value)}
                      className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="邮箱"
                    />
                    <input
                      type="tel"
                      value={person.phone}
                      onChange={(e) => updatePerson('judges', person.id, 'phone', e.target.value)}
                      className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="电话"
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* 志愿者 */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-medium text-gray-700">
                  志愿者团队
                </label>
                <button
                  onClick={() => addPerson('volunteers')}
                  className="px-3 py-1 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  + 添加志愿者
                </button>
              </div>
              {data.personnel.volunteers.map((person, index) => (
                <div key={person.id} className="p-3 bg-white rounded-lg border border-gray-200 mb-2">
                  <div className="flex items-start justify-between mb-2">
                    <span className="text-xs text-gray-500">志愿者 {index + 1}</span>
                    <button
                      onClick={() => removePerson('volunteers', person.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={person.name}
                      onChange={(e) => updatePerson('volunteers', person.id, 'name', e.target.value)}
                      className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="姓名"
                    />
                    <input
                      type="text"
                      value={person.organization}
                      onChange={(e) => updatePerson('volunteers', person.id, 'organization', e.target.value)}
                      className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="所属单位"
                    />
                    <input
                      type="email"
                      value={person.email}
                      onChange={(e) => updatePerson('volunteers', person.id, 'email', e.target.value)}
                      className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="邮箱"
                    />
                    <input
                      type="tel"
                      value={person.phone}
                      onChange={(e) => updatePerson('volunteers', person.id, 'phone', e.target.value)}
                      className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="电话"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 4. 配置赛事所需设备 */}
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <SectionHeader
          title="配置赛事所需设备"
          icon="💻"
          sectionKey="equipment"
          badge={data.equipment.length > 0 ? `${data.equipment.length} 项` : null}
        />
        {expandedSections.equipment && (
          <div className="p-4 space-y-4 bg-gray-50">
            {/* 设备统计 */}
            {data.equipment.length > 0 && (
              <div className="grid grid-cols-3 gap-3 mb-4">
                <div className="p-3 bg-white rounded-lg border border-gray-200">
                  <p className="text-xs text-gray-600 mb-1">可用设备</p>
                  <p className="text-xl font-bold text-green-600">
                    {data.equipment.filter(e => e.status === 'available').length}
                  </p>
                </div>
                <div className="p-3 bg-white rounded-lg border border-gray-200">
                  <p className="text-xs text-gray-600 mb-1">已预定</p>
                  <p className="text-xl font-bold text-orange-600">
                    {data.equipment.filter(e => e.status === 'reserved').length}
                  </p>
                </div>
                <div className="p-3 bg-white rounded-lg border border-gray-200">
                  <p className="text-xs text-gray-600 mb-1">维护中</p>
                  <p className="text-xl font-bold text-red-600">
                    {data.equipment.filter(e => e.status === 'maintenance').length}
                  </p>
                </div>
              </div>
            )}
            {data.equipment.map((item, index) => (
              <div key={item.id} className="p-4 bg-white rounded-lg border border-gray-200">
                <div className="flex items-start justify-between mb-3">
                  <span className="text-sm font-medium text-gray-700">设备 {index + 1}</span>
                  <button
                    onClick={() => removeEquipment(item.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <input
                    type="text"
                    value={item.name}
                    onChange={(e) => updateEquipment(item.id, 'name', e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="设备名称"
                  />
                  <input
                    type="number"
                    value={item.quantity}
                    onChange={(e) => updateEquipment(item.id, 'quantity', parseInt(e.target.value))}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="数量"
                  />
                  <select
                    value={item.status}
                    onChange={(e) => updateEquipment(item.id, 'status', e.target.value)}
                    className={`px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      item.status === 'available' ? 'text-green-600' : 
                      item.status === 'reserved' ? 'text-orange-600' : 'text-red-600'
                    }`}
                  >
                    <option value="available">✅ 可用</option>
                    <option value="reserved">🔶 已预定</option>
                    <option value="maintenance">🔧 维护中</option>
                  </select>
                </div>
              </div>
            ))}

            <button
              onClick={addEquipment}
              className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-500 hover:text-blue-600 transition-colors"
            >
              + 添加设备
            </button>
          </div>
        )}
      </div>

      {/* 5. 支持物资导号与导出 */}
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <SectionHeader
          title="支持物资导号与导出"
          icon="📦"
          sectionKey="materials"
        />
        {expandedSections.materials && (
          <div className="p-4 space-y-4 bg-gray-50">
            <div className="flex flex-wrap gap-3 mb-4">
              <input
                type="file"
                id="material-import-input"
                accept=".csv"
                onChange={importMaterialsFromFile}
                className="hidden"
              />
              <button
                onClick={() => document.getElementById('material-import-input').click()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm flex items-center gap-2 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                批量导入 CSV
              </button>
              <button
                onClick={exportMaterialsToCSV}
                disabled={data.materials.length === 0}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm flex items-center gap-2 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                导出物资清单
              </button>
              {data.materials.length > 0 && (
                <button
                  onClick={clearAllMaterials}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm flex items-center gap-2 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  清空所有
                </button>
              )}
            </div>

            {data.materials.length > 0 && (
              <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center gap-2 text-sm text-blue-700">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>共 {data.materials.length} 项物资，可导出为 CSV 文件进行备份</span>
                </div>
              </div>
            )}

            {data.materials.map((item, index) => (
              <div key={item.id} className="p-4 bg-white rounded-lg border border-gray-200">
                <div className="flex items-start justify-between mb-3">
                  <span className="text-sm font-medium text-gray-700">物资 {index + 1}</span>
                  <button
                    onClick={() => removeMaterial(item.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <input
                    type="text"
                    value={item.name}
                    onChange={(e) => updateMaterial(item.id, 'name', e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="物资名称"
                  />
                  <input
                    type="text"
                    value={item.quantity}
                    onChange={(e) => updateMaterial(item.id, 'quantity', e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="数量"
                  />
                  <input
                    type="text"
                    value={item.unit}
                    onChange={(e) => updateMaterial(item.id, 'unit', e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="单位"
                  />
                </div>
              </div>
            ))}

            <button
              onClick={addMaterial}
              className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-500 hover:text-blue-600 transition-colors"
            >
              + 添加物资
            </button>
          </div>
        )}
      </div>

      {/* 6. 提供资源使用统计功能 */}
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <SectionHeader
          title="资源使用统计概览"
          icon="📊"
          sectionKey="statistics"
        />
        {expandedSections.statistics && (
          <div className="p-4 bg-gray-50">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-gray-600">预算总额</p>
                  <span className="text-2xl">💰</span>
                </div>
                <p className="text-2xl font-bold text-blue-600">
                  ¥{(parseFloat(data.budget.total) || 0).toLocaleString()}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {data.budget.categories.length} 个分类
                </p>
              </div>
              <div className="p-4 bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-gray-600">已分配预算</p>
                  <span className="text-2xl">📊</span>
                </div>
                <p className={`text-2xl font-bold ${
                  isOverBudget() ? 'text-red-600' : 'text-green-600'
                }`}>
                  ¥{calculateTotalBudget().toLocaleString()}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {getBudgetPercentage().toFixed(1)}% 使用率
                </p>
              </div>
              <div className="p-4 bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-gray-600">场地数量</p>
                  <span className="text-2xl">🏢</span>
                </div>
                <p className="text-2xl font-bold text-purple-600">
                  {data.venue.venues.length}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  总容量 {getTotalVenueCapacity()} 人
                </p>
              </div>
              <div className="p-4 bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-gray-600">总人员数</p>
                  <span className="text-2xl">👥</span>
                </div>
                <p className="text-2xl font-bold text-orange-600">
                  {data.personnel.organizers.length + 
                   data.personnel.judges.length + 
                   data.personnel.volunteers.length}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  设备 {data.equipment.length} / 物资 {data.materials.length}
                </p>
              </div>
            </div>

            <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-start space-x-3">
                <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <p className="text-sm font-medium text-blue-900">资源配置建议</p>
                  <p className="text-sm text-blue-700 mt-1">
                    • 组织者：{data.personnel.organizers.length}人 
                    • 评审：{data.personnel.judges.length}人 
                    • 志愿者：{data.personnel.volunteers.length}人<br/>
                    • 设备：{data.equipment.length}项 
                    • 物资：{data.materials.length}项
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResourceConfigForm;
