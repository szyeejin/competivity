import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { API_ENDPOINTS } from '../../../config/api';
import Button from '../../UI/Button';
import Badge from '../../UI/Badge';

/**
 * 结果公示页面
 * 功能：查看竞赛结果、发布结果、管理获奖信息
 */
const ResultsAnnouncement = () => {
  const [results, setResults] = useState([]);
  const [contests, setContests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterContest, setFilterContest] = useState('all');
  const [filterAward, setFilterAward] = useState('all');
  const [filterPublished, setFilterPublished] = useState('all');
  const [selectedResult, setSelectedResult] = useState(null);
  const [showDetail, setShowDetail] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  // 获取数据
  const fetchData = async () => {
    try {
      setLoading(true);
      
      const [resultsRes, contestsRes] = await Promise.all([
        fetch(API_ENDPOINTS.CONTEST_RESULTS.LIST),
        fetch(API_ENDPOINTS.CONTESTS.LIST)
      ]);

      const [resultsData, contestsData] = await Promise.all([
        resultsRes.json(),
        contestsRes.json()
      ]);

      if (resultsData.success) setResults(resultsData.data || []);
      if (contestsData.success) setContests(contestsData.data || []);
    } catch (err) {
      console.error('获取数据失败:', err);
    } finally {
      setLoading(false);
    }
  };

  // 发布单个结果
  const handlePublish = async (id) => {
    if (!confirm('确定要发布这个结果吗？')) return;

    try {
      const response = await fetch(API_ENDPOINTS.CONTEST_RESULTS.PUBLISH(id), {
        method: 'POST'
      });
      
      const result = await response.json();
      
      if (result.success) {
        alert('结果已发布！');
        fetchData();
      } else {
        alert('发布失败：' + result.message);
      }
    } catch (err) {
      console.error('发布失败:', err);
      alert('发布失败：' + err.message);
    }
  };

  // 批量发布
  const handleBatchPublish = async () => {
    if (filterContest === 'all') {
      alert('请先选择要批量发布的赛事！');
      return;
    }

    if (!confirm('确定要批量发布该赛事的所有未发布结果吗？')) return;

    try {
      const response = await fetch(API_ENDPOINTS.CONTEST_RESULTS.BATCH_PUBLISH, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contest_id: filterContest })
      });
      
      const result = await response.json();
      
      if (result.success) {
        alert(result.message || '批量发布成功！');
        fetchData();
      } else {
        alert('批量发布失败：' + result.message);
      }
    } catch (err) {
      console.error('批量发布失败:', err);
      alert('批量发布失败：' + err.message);
    }
  };

  // 筛选结果
  const filteredResults = results.filter(result => {
    const matchContest = filterContest === 'all' || result.contest_id === parseInt(filterContest);
    const matchAward = filterAward === 'all' || result.award_level === filterAward;
    const matchPublished = 
      filterPublished === 'all' || 
      (filterPublished === 'published' && result.is_published) ||
      (filterPublished === 'unpublished' && !result.is_published);
    
    return matchContest && matchAward && matchPublished;
  });

  // 统计数据
  const stats = {
    total: results.length,
    published: results.filter(r => r.is_published).length,
    unpublished: results.filter(r => !r.is_published).length,
    first: results.filter(r => r.award_level === 'first').length
  };

  return (
    <div className="space-y-6">
      {/* 页面头部 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 flex items-center gap-3">
            <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 text-white shadow-lg">
              🏆
            </span>
            结果公示
          </h1>
          <p className="mt-1 text-sm text-neutral-500">
            查看和发布竞赛结果
          </p>
        </div>

        <Button 
          variant="primary" 
          size="md" 
          onClick={handleBatchPublish}
          disabled={filterContest === 'all'}
        >
          <span className="mr-2">📢</span>
          批量发布
        </Button>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard title="结果总数" value={stats.total} icon="🏆" color="amber" />
        <StatCard title="已发布" value={stats.published} icon="✅" color="green" />
        <StatCard title="未发布" value={stats.unpublished} icon="⏳" color="blue" />
        <StatCard title="一等奖" value={stats.first} icon="🥇" color="purple" />
      </div>

      {/* 筛选栏 */}
      <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* 赛事筛选 */}
          <select
            value={filterContest}
            onChange={(e) => setFilterContest(e.target.value)}
            className="px-4 py-2 bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="all">全部赛事</option>
            {contests.map(contest => (
              <option key={contest.id} value={contest.id}>{contest.name}</option>
            ))}
          </select>

          {/* 奖项筛选 */}
          <select
            value={filterAward}
            onChange={(e) => setFilterAward(e.target.value)}
            className="px-4 py-2 bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="all">全部奖项</option>
            <option value="first">🥇 一等奖</option>
            <option value="second">🥈 二等奖</option>
            <option value="third">🥉 三等奖</option>
            <option value="excellence">🎖️ 优秀奖</option>
            <option value="participation">🎗️ 参与奖</option>
          </select>

          {/* 发布状态筛选 */}
          <select
            value={filterPublished}
            onChange={(e) => setFilterPublished(e.target.value)}
            className="px-4 py-2 bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="all">全部状态</option>
            <option value="published">✅ 已发布</option>
            <option value="unpublished">⏳ 未发布</option>
          </select>
        </div>

        <div className="mt-4 text-sm text-neutral-600">
          共 {results.length} 个结果，筛选结果: {filteredResults.length} 个
        </div>
      </div>

      {/* 结果列表 */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-neutral-600">加载中...</p>
          </div>
        ) : filteredResults.length === 0 ? (
          <div className="bg-white rounded-xl border border-neutral-200 p-12 text-center">
            <div className="text-6xl mb-4">🏆</div>
            <h3 className="text-lg font-semibold text-neutral-900 mb-2">暂无结果</h3>
            <p className="text-neutral-500">当前筛选条件下没有竞赛结果</p>
          </div>
        ) : (
          filteredResults.map((result, index) => (
            <ResultCard
              key={result.id}
              result={result}
              index={index}
              onPublish={handlePublish}
              onViewDetail={() => {
                setSelectedResult(result);
                setShowDetail(true);
              }}
            />
          ))
        )}
      </div>

      {/* 详情弹窗 */}
      <AnimatePresence>
        {showDetail && selectedResult && (
          <ResultDetailModal
            result={selectedResult}
            onClose={() => {
              setShowDetail(false);
              setSelectedResult(null);
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
    amber: 'from-amber-400 to-orange-500',
    green: 'from-green-400 to-green-600',
    blue: 'from-blue-400 to-blue-600',
    purple: 'from-purple-400 to-purple-600',
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

// 结果卡片
const ResultCard = ({ result, index, onPublish, onViewDetail }) => {
  const awardConfig = {
    first: { label: '🥇 一等奖', color: 'bg-gradient-to-r from-amber-400 to-yellow-500' },
    second: { label: '🥈 二等奖', color: 'bg-gradient-to-r from-gray-300 to-gray-400' },
    third: { label: '🥉 三等奖', color: 'bg-gradient-to-r from-orange-400 to-orange-500' },
    excellence: { label: '🎖️ 优秀奖', color: 'bg-gradient-to-r from-green-400 to-green-500' },
    participation: { label: '🎗️ 参与奖', color: 'bg-gradient-to-r from-blue-400 to-blue-500' }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="bg-white rounded-xl border border-neutral-200 overflow-hidden hover:shadow-lg transition-all"
    >
      {/* 奖项横幅 */}
      <div className={`${awardConfig[result.award_level]?.color} text-white px-6 py-3`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-xl font-bold">#{result.ranking}</span>
            <span className="text-lg font-semibold">{awardConfig[result.award_level]?.label}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold">{result.final_score}</span>
            <span className="text-sm">分</span>
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-2 gap-6">
          {/* 左侧：获奖信息 */}
          <div className="space-y-4">
            <div>
              <h3 className="text-xl font-bold text-neutral-900 mb-2">{result.contest_name}</h3>
              {result.team_name && (
                <div className="flex items-center gap-2 text-neutral-600 mb-2">
                  <span className="font-semibold">团队：</span>
                  <span>{result.team_name}</span>
                </div>
              )}
            </div>

            <div className="bg-blue-50 rounded-lg p-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">👨‍🎓</span>
                  <div>
                    <div className="font-semibold text-neutral-900">{result.student_name}</div>
                    <div className="text-sm text-neutral-600">{result.student_id}</div>
                  </div>
                </div>
              </div>
            </div>

            {result.certificate_number && (
              <div className="bg-neutral-50 rounded-lg p-4">
                <div className="text-sm text-neutral-600 mb-1">证书编号</div>
                <div className="font-mono font-semibold text-neutral-900">{result.certificate_number}</div>
              </div>
            )}
          </div>

          {/* 右侧：发布状态和备注 */}
          <div className="space-y-4">
            <div className="flex flex-col items-center justify-center bg-neutral-50 rounded-lg p-6">
              {result.is_published ? (
                <>
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white text-3xl mb-3">
                    ✅
                  </div>
                  <div className="text-green-600 font-semibold mb-1">已发布</div>
                  {result.published_at && (
                    <div className="text-xs text-neutral-500">
                      {new Date(result.published_at).toLocaleString('zh-CN')}
                    </div>
                  )}
                </>
              ) : (
                <>
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-3xl mb-3">
                    ⏳
                  </div>
                  <div className="text-blue-600 font-semibold mb-3">待发布</div>
                  <Button 
                    variant="primary" 
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onPublish(result.id);
                    }}
                  >
                    立即发布
                  </Button>
                </>
              )}
            </div>

            {result.remarks && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <div className="text-sm font-semibold text-amber-800 mb-2">📝 备注</div>
                <div className="text-sm text-amber-700">{result.remarks}</div>
              </div>
            )}
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-neutral-200 flex justify-between items-center">
          <div className="text-xs text-neutral-500">
            创建时间：{new Date(result.created_at).toLocaleString('zh-CN')}
          </div>
          <Button variant="outline" size="sm" onClick={onViewDetail}>
            查看详情
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

// 结果详情弹窗
const ResultDetailModal = ({ result, onClose }) => {
  const awardConfig = {
    first: { label: '🥇 一等奖', gradient: 'from-amber-400 to-yellow-500' },
    second: { label: '🥈 二等奖', gradient: 'from-gray-300 to-gray-400' },
    third: { label: '🥉 三等奖', gradient: 'from-orange-400 to-orange-500' },
    excellence: { label: '🎖️ 优秀奖', gradient: 'from-green-400 to-green-500' },
    participation: { label: '🎗️ 参与奖', gradient: 'from-blue-400 to-blue-500' }
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
        className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 顶部奖项横幅 */}
        <div className={`bg-gradient-to-r ${awardConfig[result.award_level]?.gradient} text-white p-8`}>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-4xl font-bold mb-2">#{result.ranking}</div>
              <div className="text-2xl font-semibold">{awardConfig[result.award_level]?.label}</div>
            </div>
            <div className="text-right">
              <div className="text-sm opacity-90 mb-1">最终得分</div>
              <div className="text-5xl font-bold">{result.final_score}</div>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* 赛事信息 */}
          <div>
            <h3 className="text-2xl font-bold text-neutral-900 mb-4">{result.contest_name}</h3>
            {result.team_name && (
              <div className="bg-blue-50 rounded-lg p-4 mb-4">
                <div className="flex items-center gap-2 text-blue-900">
                  <span className="text-2xl">👥</span>
                  <div>
                    <div className="text-sm text-blue-700">团队名称</div>
                    <div className="text-lg font-semibold">{result.team_name}</div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 获奖者信息 */}
          <div>
            <h4 className="font-semibold text-neutral-900 mb-3">🎓 获奖者信息</h4>
            <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg p-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center text-white text-2xl font-bold">
                  {result.student_name?.charAt(0)}
                </div>
                <div>
                  <div className="text-xl font-bold text-neutral-900">{result.student_name}</div>
                  <div className="text-neutral-600 mt-1">学号：{result.student_id}</div>
                </div>
              </div>
            </div>
          </div>

          {/* 证书信息 */}
          {result.certificate_number && (
            <div>
              <h4 className="font-semibold text-neutral-900 mb-3">🏅 证书信息</h4>
              <div className="bg-amber-50 border-2 border-amber-200 rounded-lg p-6 text-center">
                <div className="text-sm text-amber-700 mb-2">证书编号</div>
                <div className="text-2xl font-mono font-bold text-amber-900">{result.certificate_number}</div>
              </div>
            </div>
          )}

          {/* 发布状态 */}
          <div>
            <h4 className="font-semibold text-neutral-900 mb-3">📢 发布状态</h4>
            <div className={`rounded-lg p-6 ${result.is_published ? 'bg-green-50' : 'bg-blue-50'}`}>
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-full ${result.is_published ? 'bg-green-500' : 'bg-blue-500'} flex items-center justify-center text-white text-2xl`}>
                  {result.is_published ? '✅' : '⏳'}
                </div>
                <div>
                  <div className={`font-semibold ${result.is_published ? 'text-green-700' : 'text-blue-700'}`}>
                    {result.is_published ? '已发布' : '待发布'}
                  </div>
                  {result.published_at && (
                    <div className="text-sm text-neutral-600 mt-1">
                      发布时间：{new Date(result.published_at).toLocaleString('zh-CN')}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* 备注信息 */}
          {result.remarks && (
            <div>
              <h4 className="font-semibold text-neutral-900 mb-3">📝 备注</h4>
              <div className="bg-neutral-50 rounded-lg p-4 text-neutral-700">
                {result.remarks}
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

export default ResultsAnnouncement;
