import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { API_ENDPOINTS } from '../../../config/api';

/**
 * 运营管理 - 资源调配
 * 腾讯/字节风格：清晰的资源管理、直观的分配状态、高效的操作流程
 */
const ResourceAllocation = () => {
  const [activeTab, setActiveTab] = useState('venue'); // venue, equipment, personnel
  const [contests, setContests] = useState([]);
  const [selectedContest, setSelectedContest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [resourceData, setResourceData] = useState({
    venues: [],
    equipment: [],
    personnel: []
  });

  useEffect(() => {
    fetchContests();
  }, []);

  useEffect(() => {
    if (selectedContest) {
      fetchResourceData(selectedContest.id);
    }
  }, [selectedContest]);

  const fetchContests = async () => {
    try {
      setLoading(true);
      const response = await fetch(API_ENDPOINTS.CONTESTS.LIST);
      const result = await response.json();
      
      if (result.success && result.data.length > 0) {
        setContests(result.data);
        setSelectedContest(result.data[0]);
      }
    } catch (error) {
      console.error('获取赛事列表失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchResourceData = async (contestId) => {
    try {
      const response = await fetch(API_ENDPOINTS.CONTESTS.DETAIL(contestId));
      const result = await response.json();
      
      if (result.success) {
        const data = result.data;
        setResourceData({
          venues: data.venues || [],
          equipment: data.equipment || [],
          personnel: data.personnel || []
        });
      }
    } catch (error) {
      console.error('获取资源数据失败:', error);
    }
  };

  // Tab 配置
  const tabs = [
    { id: 'venue', name: '场地管理', icon: '🏢', count: resourceData.venues.length },
    { id: 'equipment', name: '设备管理', icon: '🖥️', count: resourceData.equipment.length },
    { id: 'personnel', name: '人员管理', icon: '👥', count: resourceData.personnel.length }
  ];

  // 设备状态颜色
  const equipmentStatusColors = {
    available: 'bg-green-100 text-green-700 border-green-200',
    reserved: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    maintenance: 'bg-red-100 text-red-700 border-red-200'
  };

  const equipmentStatusLabels = {
    available: '可用',
    reserved: '已预订',
    maintenance: '维护中'
  };

  // 人员角色颜色
  const personnelRoleColors = {
    organizer: 'bg-blue-100 text-blue-700 border-blue-200',
    judge: 'bg-purple-100 text-purple-700 border-purple-200',
    volunteer: 'bg-green-100 text-green-700 border-green-200'
  };

  const personnelRoleLabels = {
    organizer: '组织者',
    judge: '评委',
    volunteer: '志愿者'
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">资源调配</h1>
          <p className="text-sm text-gray-500 mt-1">统一管理场地、设备、人员等赛事资源</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={selectedContest?.id || ''}
            onChange={(e) => {
              const contest = contests.find(c => c.id === parseInt(e.target.value));
              setSelectedContest(contest);
            }}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            {contests.map(contest => (
              <option key={contest.id} value={contest.id}>{contest.name}</option>
            ))}
          </select>
          <button className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            添加资源
          </button>
        </div>
      </div>

      {/* 资源概览卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600">场地总数</p>
              <p className="text-3xl font-bold text-blue-900 mt-2">{resourceData.venues.length}</p>
              <p className="text-xs text-blue-600 mt-1">
                总容量: {resourceData.venues.reduce((sum, v) => sum + (v.capacity || 0), 0)} 人
              </p>
            </div>
            <div className="text-4xl">🏢</div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 border border-purple-200"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-600">设备总数</p>
              <p className="text-3xl font-bold text-purple-900 mt-2">{resourceData.equipment.length}</p>
              <p className="text-xs text-purple-600 mt-1">
                可用: {resourceData.equipment.filter(e => e.status === 'available').length}
              </p>
            </div>
            <div className="text-4xl">🖥️</div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border border-green-200"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600">人员总数</p>
              <p className="text-3xl font-bold text-green-900 mt-2">{resourceData.personnel.length}</p>
              <p className="text-xs text-green-600 mt-1">
                评委: {resourceData.personnel.filter(p => p.role === 'judge').length}
              </p>
            </div>
            <div className="text-4xl">👥</div>
          </div>
        </motion.div>
      </div>

      {/* Tab 导航 */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="border-b border-gray-200">
          <div className="flex">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 px-6 py-4 text-sm font-medium transition-colors relative ${
                  activeTab === tab.id
                    ? 'text-primary-600 bg-primary-50'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <span className="text-xl">{tab.icon}</span>
                  <span>{tab.name}</span>
                  {tab.count > 0 && (
                    <span className={`px-2 py-0.5 rounded-full text-xs ${
                      activeTab === tab.id ? 'bg-primary-100 text-primary-700' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {tab.count}
                    </span>
                  )}
                </div>
                {activeTab === tab.id && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-600"
                  />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Tab 内容 */}
        <div className="p-6">
          <AnimatePresence mode="wait">
            {/* 场地管理 */}
            {activeTab === 'venue' && (
              <motion.div
                key="venue"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-4"
              >
                {resourceData.venues.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">🏢</div>
                    <p className="text-gray-500">暂无场地数据</p>
                  </div>
                ) : (
                  resourceData.venues.map((venue, index) => (
                    <motion.div
                      key={venue.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="border border-gray-200 rounded-lg p-5 hover:shadow-md transition-all"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900">{venue.name}</h3>
                            <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full">
                              容量: {venue.capacity || 0} 人
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mb-3">
                            <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            {venue.address || '暂无地址'}
                          </p>
                          {venue.facilities && JSON.parse(venue.facilities).length > 0 && (
                            <div className="flex flex-wrap gap-2">
                              {JSON.parse(venue.facilities).map((facility, idx) => (
                                <span key={idx} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                                  {facility}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                        <div className="flex gap-2 ml-4">
                          <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </motion.div>
            )}

            {/* 设备管理 */}
            {activeTab === 'equipment' && (
              <motion.div
                key="equipment"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-4"
              >
                {resourceData.equipment.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">🖥️</div>
                    <p className="text-gray-500">暂无设备数据</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {resourceData.equipment.map((item, index) => (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.05 }}
                        className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <h3 className="font-semibold text-gray-900">{item.name}</h3>
                          <span className={`px-2 py-1 rounded-md text-xs font-medium border ${equipmentStatusColors[item.status]}`}>
                            {equipmentStatusLabels[item.status]}
                          </span>
                        </div>
                        <div className="space-y-2 text-sm text-gray-600">
                          <div className="flex items-center justify-between">
                            <span>数量:</span>
                            <span className="font-medium">{item.quantity || 0}</span>
                          </div>
                        </div>
                        <div className="mt-4 pt-4 border-t border-gray-200 flex gap-2">
                          <button className="flex-1 px-3 py-2 text-sm bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors">
                            编辑
                          </button>
                          <button className="px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                            删除
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {/* 人员管理 */}
            {activeTab === 'personnel' && (
              <motion.div
                key="personnel"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-4"
              >
                {resourceData.personnel.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">👥</div>
                    <p className="text-gray-500">暂无人员数据</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {resourceData.personnel.map((person, index) => (
                      <motion.div
                        key={person.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                            {person.name?.charAt(0) || '?'}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold text-gray-900">{person.name}</h3>
                              <span className={`px-2 py-0.5 rounded-md text-xs font-medium border ${personnelRoleColors[person.role]}`}>
                                {personnelRoleLabels[person.role]}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600">
                              <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                              </svg>
                              {person.contact || '暂无联系方式'}
                            </p>
                          </div>
                          <div className="flex flex-col gap-2">
                            <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            <button className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default ResourceAllocation;
