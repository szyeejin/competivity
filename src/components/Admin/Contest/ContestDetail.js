import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { API_ENDPOINTS } from '../../../config/api';
import Button from '../../UI/Button';
import Badge from '../../UI/Badge';

/**
 * 赛事详情页面
 * 展示赛事的完整信息
 */
const ContestDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [contest, setContest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchContestDetail();
  }, [id]);

  const fetchContestDetail = async () => {
    try {
      setLoading(true);
      const response = await fetch(API_ENDPOINTS.CONTESTS.DETAIL(id));
      const result = await response.json();
      
      if (result.success) {
        setContest(result.data);
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError('获取赛事详情失败：' + err.message);
      console.error('获取赛事详情错误:', err);
    } finally {
      setLoading(false);
    }
  };

  // 状态配置
  const statusConfig = {
    draft: { label: '草稿', color: 'default', icon: '📝' },
    pending: { label: '待审核', color: 'warning', icon: '⏳' },
    approved: { label: '已通过', color: 'success', icon: '✅' },
    published: { label: '已发布', color: 'info', icon: '📢' },
    ongoing: { label: '进行中', color: 'primary', icon: '🔥' },
    completed: { label: '已完成', color: 'default', icon: '🏆' },
    rejected: { label: '已驳回', color: 'danger', icon: '❌' },
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-neutral-600">加载中...</p>
        </div>
      </div>
    );
  }

  if (error || !contest) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-red-50 border border-red-200 rounded-xl p-12 text-center"
        >
          <div className="text-6xl mb-4">❌</div>
          <h3 className="text-xl font-semibold text-red-900 mb-2">加载失败</h3>
          <p className="text-red-700 mb-6">{error || '赛事不存在'}</p>
          <div className="flex items-center justify-center gap-3">
            <Button variant="outline" onClick={() => navigate(-1)}>
              返回
            </Button>
            <Button variant="primary" onClick={fetchContestDetail}>
              重试
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  const status = statusConfig[contest.status] || statusConfig.draft;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* 头部 */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-lg hover:bg-neutral-100 flex items-center justify-center text-neutral-600"
          >
            ←
          </button>
          <div>
            <h1 className="text-2xl font-bold text-neutral-900">赛事详情</h1>
            <p className="text-sm text-neutral-500 mt-1">查看完整的赛事信息</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <Badge variant={status.color} size="md">
            {status.icon} {status.label}
          </Badge>
        </div>
      </motion.div>

      {/* 基础信息 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-xl border border-neutral-200 p-8"
      >
        <h2 className="text-xl font-bold text-neutral-900 mb-6 flex items-center gap-2">
          <span>🏆</span>
          基础信息
        </h2>

        <div className="space-y-6">
          {/* 赛事名称 */}
          <div>
            <label className="text-sm font-medium text-neutral-600">赛事名称</label>
            <p className="text-lg font-semibold text-neutral-900 mt-1">{contest.name}</p>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="text-sm font-medium text-neutral-600">赛事类型</label>
              <p className="text-neutral-900 mt-1">{contest.type}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-neutral-600">比赛模式</label>
              <p className="text-neutral-900 mt-1">
                {contest.online_mode ? '🌐 线上' : '📍 线下'}
              </p>
            </div>
          </div>

          {/* 时间信息 */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="text-sm font-medium text-neutral-600">开始时间</label>
              <p className="text-neutral-900 mt-1">
                {contest.start_date ? new Date(contest.start_date).toLocaleString('zh-CN') : '未设置'}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-neutral-600">结束时间</label>
              <p className="text-neutral-900 mt-1">
                {contest.end_date ? new Date(contest.end_date).toLocaleString('zh-CN') : '未设置'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="text-sm font-medium text-neutral-600">报名开始</label>
              <p className="text-neutral-900 mt-1">
                {contest.registration_start ? new Date(contest.registration_start).toLocaleString('zh-CN') : '未设置'}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-neutral-600">报名截止</label>
              <p className="text-neutral-900 mt-1">
                {contest.registration_end ? new Date(contest.registration_end).toLocaleString('zh-CN') : '未设置'}
              </p>
            </div>
          </div>

          {/* 地点 */}
          {contest.location && (
            <div>
              <label className="text-sm font-medium text-neutral-600">比赛地点</label>
              <p className="text-neutral-900 mt-1">📍 {contest.location}</p>
            </div>
          )}

          {/* 规则 */}
          {contest.rules && (
            <div>
              <label className="text-sm font-medium text-neutral-600">赛事规则</label>
              <div className="mt-2 bg-neutral-50 rounded-lg p-4 text-neutral-700 whitespace-pre-wrap">
                {contest.rules}
              </div>
            </div>
          )}
        </div>
      </motion.div>

      {/* 奖励机制 */}
      {(contest.first_prize || contest.second_prize || contest.third_prize || contest.scholarship) && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl border border-amber-200 p-8"
        >
          <h2 className="text-xl font-bold text-neutral-900 mb-6 flex items-center gap-2">
            <span>🎁</span>
            奖励机制
          </h2>

          <div className="grid grid-cols-2 gap-6">
            {contest.first_prize && (
              <div className="bg-white rounded-lg p-4 border border-amber-300">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">🥇</span>
                  <span className="font-semibold text-neutral-900">一等奖</span>
                </div>
                <p className="text-neutral-700">{contest.first_prize}</p>
              </div>
            )}
            {contest.second_prize && (
              <div className="bg-white rounded-lg p-4 border border-neutral-300">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">🥈</span>
                  <span className="font-semibold text-neutral-900">二等奖</span>
                </div>
                <p className="text-neutral-700">{contest.second_prize}</p>
              </div>
            )}
            {contest.third_prize && (
              <div className="bg-white rounded-lg p-4 border border-neutral-300">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">🥉</span>
                  <span className="font-semibold text-neutral-900">三等奖</span>
                </div>
                <p className="text-neutral-700">{contest.third_prize}</p>
              </div>
            )}
            {contest.certificate && (
              <div className="bg-white rounded-lg p-4 border border-blue-300">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">📜</span>
                  <span className="font-semibold text-neutral-900">证书</span>
                </div>
                <p className="text-neutral-700">颁发参赛证书</p>
              </div>
            )}
            {contest.scholarship && (
              <div className="bg-white rounded-lg p-4 border border-green-300">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">💰</span>
                  <span className="font-semibold text-neutral-900">其他奖励</span>
                </div>
                <p className="text-neutral-700">{contest.scholarship}</p>
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* 资源配置 */}
      {(contest.venues?.length > 0 || contest.personnel?.length > 0 || contest.equipment?.length > 0 || contest.materials?.length > 0) && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl border border-neutral-200 p-8"
        >
          <h2 className="text-xl font-bold text-neutral-900 mb-6 flex items-center gap-2">
            <span>⚙️</span>
            资源配置
          </h2>

          <div className="space-y-6">
            {/* 场地 */}
            {contest.venues?.length > 0 && (
              <div>
                <h3 className="font-semibold text-neutral-900 mb-3">🏢 场地信息</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {contest.venues.map((venue, idx) => (
                    <div key={idx} className="bg-neutral-50 rounded-lg p-4 border border-neutral-200">
                      <p className="font-medium text-neutral-900">{venue.name}</p>
                      {venue.capacity && <p className="text-sm text-neutral-600 mt-1">容纳：{venue.capacity} 人</p>}
                      {venue.address && <p className="text-sm text-neutral-600">地址：{venue.address}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 人员 */}
            {contest.personnel?.length > 0 && (
              <div>
                <h3 className="font-semibold text-neutral-900 mb-3">👥 人员配置</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {contest.personnel.map((person, idx) => (
                    <div key={idx} className="bg-neutral-50 rounded-lg p-4 border border-neutral-200">
                      <div className="flex items-center gap-2 mb-2">
                        <span>{person.role === 'organizer' ? '👨‍💼' : person.role === 'judge' ? '👨‍⚖️' : '🙋'}</span>
                        <span className="text-xs text-neutral-600">
                          {person.role === 'organizer' ? '组织者' : person.role === 'judge' ? '评委' : '志愿者'}
                        </span>
                      </div>
                      <p className="font-medium text-neutral-900">{person.name}</p>
                      {person.contact && <p className="text-sm text-neutral-600 mt-1">{person.contact}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 设备 */}
            {contest.equipment?.length > 0 && (
              <div>
                <h3 className="font-semibold text-neutral-900 mb-3">💻 设备清单</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {contest.equipment.map((item, idx) => (
                    <div key={idx} className="bg-neutral-50 rounded-lg p-3 border border-neutral-200">
                      <p className="font-medium text-neutral-900 text-sm">{item.name}</p>
                      <p className="text-xs text-neutral-600 mt-1">数量：{item.quantity}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 物资 */}
            {contest.materials?.length > 0 && (
              <div>
                <h3 className="font-semibold text-neutral-900 mb-3">📦 物资清单</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {contest.materials.map((item, idx) => (
                    <div key={idx} className="bg-neutral-50 rounded-lg p-3 border border-neutral-200">
                      <p className="font-medium text-neutral-900 text-sm">{item.name}</p>
                      <p className="text-xs text-neutral-600 mt-1">
                        {item.quantity} {item.unit}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 预算 */}
            {contest.budget?.length > 0 && (
              <div>
                <h3 className="font-semibold text-neutral-900 mb-3">💰 预算信息</h3>
                <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                  {contest.budget.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center py-2">
                      <span className="text-neutral-700">{item.category_name || '总预算'}</span>
                      <span className="font-semibold text-green-700">
                        ¥{(item.total || item.category_amount)?.toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* 底部操作栏 */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="flex items-center justify-between bg-white rounded-xl border border-neutral-200 p-6"
      >
        <div className="text-sm text-neutral-500">
          创建时间：{new Date(contest.created_at).toLocaleString('zh-CN')}
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={() => navigate(-1)}>
            返回列表
          </Button>
          {contest.status === 'draft' && (
            <Button variant="primary">
              编辑赛事
            </Button>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default ContestDetail;
