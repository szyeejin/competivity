import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { API_ENDPOINTS } from '../../../config/api';
import Button from '../../UI/Button';
import Badge from '../../UI/Badge';

/**
 * 专家库页面
 * 功能：查看专家、添加专家、专家信息管理
 */
const ExpertPool = () => {
  const [experts, setExperts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterField, setFilterField] = useState('all');
  const [selectedExpert, setSelectedExpert] = useState(null);
  const [showDetail, setShowDetail] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    fetchExperts();
  }, []);

  // 获取专家数据
  const fetchExperts = async () => {
    try {
      setLoading(true);
      const response = await fetch(API_ENDPOINTS.EXPERTS.LIST);
      const result = await response.json();
      
      if (result.success) {
        setExperts(result.data || []);
      } else {
        console.error('获取专家数据失败:', result.message);
      }
    } catch (err) {
      console.error('获取专家数据失败:', err);
    } finally {
      setLoading(false);
    }
  };

  // 筛选专家
  const filteredExperts = experts.filter(expert => {
    const matchSearch = 
      expert.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      expert.organization?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      expert.field?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchField = filterField === 'all' || expert.field === filterField;
    
    return matchSearch && matchField;
  });

  // 统计数据
  const stats = {
    total: experts.length,
    avgRating: experts.length > 0 ? (experts.reduce((sum, e) => sum + parseFloat(e.rating || 0), 0) / experts.length).toFixed(1) : 0,
    totalReviews: experts.reduce((sum, e) => sum + (e.review_count || 0), 0),
    avgExperience: experts.length > 0 ? Math.round(experts.reduce((sum, e) => sum + (e.experience || 0), 0) / experts.length) : 0
  };

  // 获取唯一领域列表
  const fields = [...new Set(experts.map(e => e.field).filter(Boolean))];

  return (
    <div className="space-y-6">
      {/* 页面头部 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 flex items-center gap-3">
            <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 text-white shadow-lg">
              👨‍🏫
            </span>
            专家库
          </h1>
          <p className="mt-1 text-sm text-neutral-500">
            管理评审专家信息
          </p>
        </div>

        <Button variant="primary" size="md" onClick={() => setShowAddModal(true)}>
          <span className="mr-2">➕</span>
          添加专家
        </Button>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard title="专家总数" value={stats.total} icon="👨‍🏫" color="purple" />
        <StatCard title="平均评分" value={stats.avgRating} icon="⭐" color="amber" />
        <StatCard title="评审总数" value={stats.totalReviews} icon="📝" color="blue" />
        <StatCard title="平均经验" value={`${stats.avgExperience}年`} icon="🎓" color="green" />
      </div>

      {/* 筛选栏 */}
      <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* 搜索框 */}
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="搜索专家姓名、单位或领域..."
            className="px-4 py-2 bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          />

          {/* 领域筛选 */}
          <select
            value={filterField}
            onChange={(e) => setFilterField(e.target.value)}
            className="px-4 py-2 bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="all">全部领域</option>
            {fields.map(field => (
              <option key={field} value={field}>{field}</option>
            ))}
          </select>
        </div>

        <div className="mt-4 text-sm text-neutral-600">
          共 {experts.length} 位专家，筛选结果: {filteredExperts.length} 位
        </div>
      </div>

      {/* 专家列表 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full text-center py-12">
            <div className="inline-block w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-neutral-600">加载中...</p>
          </div>
        ) : filteredExperts.length === 0 ? (
          <div className="col-span-full bg-white rounded-xl border border-neutral-200 p-12 text-center">
            <div className="text-6xl mb-4">👨‍🏫</div>
            <h3 className="text-lg font-semibold text-neutral-900 mb-2">暂无专家</h3>
            <p className="text-neutral-500">当前筛选条件下没有专家</p>
          </div>
        ) : (
          filteredExperts.map((expert, index) => (
            <ExpertCard
              key={expert.id}
              expert={expert}
              index={index}
              onViewDetail={() => {
                setSelectedExpert(expert);
                setShowDetail(true);
              }}
            />
          ))
        )}
      </div>

      {/* 详情弹窗 */}
      <AnimatePresence>
        {showDetail && selectedExpert && (
          <ExpertDetailModal
            expert={selectedExpert}
            onClose={() => {
              setShowDetail(false);
              setSelectedExpert(null);
            }}
          />
        )}
      </AnimatePresence>

      {/* 添加专家弹窗 */}
      <AnimatePresence>
        {showAddModal && (
          <AddExpertModal
            onClose={() => setShowAddModal(false)}
            onSuccess={() => {
              setShowAddModal(false);
              fetchExperts();
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

// 统计卡片
const StatCard = ({ title, value, icon, color }) => {
  const colorClasses = {
    purple: 'from-purple-400 to-purple-600',
    amber: 'from-amber-400 to-orange-500',
    blue: 'from-blue-400 to-blue-600',
    green: 'from-green-400 to-green-600',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl border border-neutral-200 p-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-neutral-600 mb-1">{title}</p>
          <p className="text-3xl font-bold text-neutral-900">{value}</p>
        </div>
        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${colorClasses[color]} flex items-center justify-center text-white text-2xl shadow-lg`}>
          {icon}
        </div>
      </div>
    </motion.div>
  );
};

// 专家卡片
const ExpertCard = ({ expert, index, onViewDetail }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.05 }}
      className="bg-white rounded-xl border border-neutral-200 p-6 hover:shadow-lg transition-all cursor-pointer"
      onClick={onViewDetail}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center text-white text-xl font-bold">
            {expert.name?.charAt(0)}
          </div>
          <div>
            <h3 className="text-lg font-bold text-neutral-900">{expert.name}</h3>
            <p className="text-sm text-neutral-600">{expert.title}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-1 text-amber-500">
          <span>⭐</span>
          <span className="font-semibold">{expert.rating}</span>
        </div>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2 text-sm text-neutral-600">
          <span>🏢</span>
          <span className="truncate">{expert.organization}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-neutral-600">
          <span>🎯</span>
          <span>{expert.field}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-neutral-600">
          <span>📧</span>
          <span className="truncate">{expert.email}</span>
        </div>
      </div>

      {/* 擅长领域 */}
      <div className="mb-4">
        <div className="flex flex-wrap gap-2">
          {(expert.expertise || []).slice(0, 3).map((skill, idx) => (
            <span key={idx} className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full">
              {skill}
            </span>
          ))}
          {(expert.expertise || []).length > 3 && (
            <span className="px-2 py-1 bg-neutral-100 text-neutral-600 text-xs rounded-full">
              +{(expert.expertise || []).length - 3}
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-neutral-200 text-sm text-neutral-600">
        <span>📝 {expert.review_count} 次评审</span>
        <span>🎓 {expert.experience} 年经验</span>
      </div>
    </motion.div>
  );
};

// 专家详情弹窗
const ExpertDetailModal = ({ expert, onClose }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white border-b border-neutral-200 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center text-white text-2xl font-bold">
                {expert.name?.charAt(0)}
              </div>
              <div>
                <h2 className="text-xl font-bold text-neutral-900">{expert.name}</h2>
                <p className="text-sm text-neutral-600 mt-1">{expert.title} · {expert.organization}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg hover:bg-neutral-100 flex items-center justify-center text-neutral-600"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* 评分统计 */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-amber-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-amber-600">{expert.rating}</div>
              <div className="text-sm text-amber-700">评分</div>
            </div>
            <div className="bg-blue-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">{expert.review_count}</div>
              <div className="text-sm text-blue-700">评审次数</div>
            </div>
            <div className="bg-green-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-green-600">{expert.experience}</div>
              <div className="text-sm text-green-700">年经验</div>
            </div>
          </div>

          {/* 基本信息 */}
          <div>
            <h3 className="font-semibold text-neutral-900 mb-3">📋 基本信息</h3>
            <div className="bg-neutral-50 rounded-lg p-4 grid grid-cols-2 gap-4">
              <div>
                <span className="text-sm text-neutral-600">专业领域</span>
                <p className="font-medium text-neutral-900">{expert.field}</p>
              </div>
              <div>
                <span className="text-sm text-neutral-600">邮箱</span>
                <p className="font-medium text-neutral-900">{expert.email}</p>
              </div>
              <div>
                <span className="text-sm text-neutral-600">手机</span>
                <p className="font-medium text-neutral-900">{expert.phone}</p>
              </div>
              <div>
                <span className="text-sm text-neutral-600">状态</span>
                <Badge variant={expert.status === 'active' ? 'success' : 'default'}>
                  {expert.status === 'active' ? '✅ 活跃' : '⏸️ 非活跃'}
                </Badge>
              </div>
            </div>
          </div>

          {/* 擅长领域 */}
          <div>
            <h3 className="font-semibold text-neutral-900 mb-3">💪 擅长领域</h3>
            <div className="flex flex-wrap gap-2">
              {(expert.expertise || []).map((skill, idx) => (
                <span key={idx} className="px-3 py-2 bg-purple-100 text-purple-700 rounded-lg font-medium">
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {/* 个人简介 */}
          {expert.bio && (
            <div>
              <h3 className="font-semibold text-neutral-900 mb-3">📝 个人简介</h3>
              <div className="bg-neutral-50 rounded-lg p-4 text-neutral-700">
                {expert.bio}
              </div>
            </div>
          )}
        </div>

        <div className="sticky bottom-0 bg-white border-t border-neutral-200 p-6 flex justify-end">
          <Button variant="primary" onClick={onClose}>
            关闭
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
};

// 添加专家弹窗
const AddExpertModal = ({ onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    title: '',
    organization: '',
    field: '',
    email: '',
    phone: '',
    expertise: '',
    experience: 0,
    bio: ''
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.organization || !formData.field) {
      alert('请填写必填字段！');
      return;
    }

    try {
      setSubmitting(true);
      
      const response = await fetch(API_ENDPOINTS.EXPERTS.ADD, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          expertise: formData.expertise.split(',').map(s => s.trim()).filter(Boolean)
        })
      });
      
      const result = await response.json();
      
      if (result.success) {
        alert('专家添加成功！');
        onSuccess();
      } else {
        alert('添加失败：' + result.message);
      }
    } catch (err) {
      console.error('添加专家失败:', err);
      alert('添加失败：' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white border-b border-neutral-200 p-6">
          <h2 className="text-xl font-bold text-neutral-900">添加专家</h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                姓名 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full px-4 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">职称</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                className="w-full px-4 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              所属单位 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.organization}
              onChange={(e) => setFormData({...formData, organization: e.target.value})}
              className="w-full px-4 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                专业领域 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.field}
                onChange={(e) => setFormData({...formData, field: e.target.value})}
                className="w-full px-4 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">工作年限</label>
              <input
                type="number"
                value={formData.experience}
                onChange={(e) => setFormData({...formData, experience: parseInt(e.target.value) || 0})}
                className="w-full px-4 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">邮箱</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="w-full px-4 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">手机号</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                className="w-full px-4 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              擅长领域（用逗号分隔）
            </label>
            <input
              type="text"
              value={formData.expertise}
              onChange={(e) => setFormData({...formData, expertise: e.target.value})}
              placeholder="例如：机器学习,深度学习,计算机视觉"
              className="w-full px-4 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">个人简介</label>
            <textarea
              value={formData.bio}
              onChange={(e) => setFormData({...formData, bio: e.target.value})}
              rows={4}
              className="w-full px-4 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div className="flex items-center gap-3 pt-4">
            <Button type="submit" variant="primary" disabled={submitting}>
              {submitting ? '添加中...' : '确认添加'}
            </Button>
            <Button type="button" variant="outline" onClick={onClose}>
              取消
            </Button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default ExpertPool;
