import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { API_ENDPOINTS } from '../../../config/api';
import Button from '../../UI/Button';
import Badge from '../../UI/Badge';

/**
 * 赛事归档页面
 * 功能：归档管理、总结报告、数据导出
 */
const ContestArchive = () => {
  const [contests, setContests] = useState([]);
  const [archivedContests, setArchivedContests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('archived'); // archived, report, export
  const [selectedContests, setSelectedContests] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchArchivedContests();
    fetchCompletedContests();
  }, []);

  // 获取已归档赛事
  const fetchArchivedContests = async () => {
    try {
      const response = await fetch(`${API_ENDPOINTS.CONTESTS.LIST}?status=archived`);
      const result = await response.json();
      if (result.success) {
        setArchivedContests(result.data || []);
      }
    } catch (err) {
      console.error('获取归档赛事失败:', err);
    }
  };

  // 获取已完成赛事（可归档）
  const fetchCompletedContests = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_ENDPOINTS.CONTESTS.LIST}?status=completed`);
      const result = await response.json();
      if (result.success) {
        setContests(result.data || []);
      }
    } catch (err) {
      console.error('获取已完成赛事失败:', err);
    } finally {
      setLoading(false);
    }
  };

  // 归档赛事
  const handleArchiveContest = async (contestId) => {
    try {
      const response = await fetch(`${API_ENDPOINTS.CONTESTS.DETAIL(contestId)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'archived' })
      });

      if (response.ok) {
        alert('归档成功！');
        fetchArchivedContests();
        fetchCompletedContests();
      }
    } catch (err) {
      console.error('归档失败:', err);
      alert('归档失败：' + err.message);
    }
  };

  // 批量归档
  const handleBatchArchive = async () => {
    if (selectedContests.length === 0) {
      alert('请选择要归档的赛事');
      return;
    }

    if (!confirm(`确定要归档 ${selectedContests.length} 个赛事吗？`)) {
      return;
    }

    for (const id of selectedContests) {
      await handleArchiveContest(id);
    }
    setSelectedContests([]);
  };

  // 自动归档（6个月前的已完成赛事）
  const handleAutoArchive = async () => {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const toArchive = contests.filter(contest => 
      new Date(contest.end_date) < sixMonthsAgo
    );

    if (toArchive.length === 0) {
      alert('没有符合自动归档条件的赛事（6个月前完成）');
      return;
    }

    if (!confirm(`发现 ${toArchive.length} 个赛事符合自动归档条件，是否归档？`)) {
      return;
    }

    for (const contest of toArchive) {
      await handleArchiveContest(contest.id);
    }
  };

  // 导出归档数据
  const handleExportData = (format = 'json') => {
    const data = archivedContests;
    
    if (format === 'json') {
      const json = JSON.stringify(data, null, 2);
      downloadFile(json, 'archived_contests.json', 'application/json');
    } else if (format === 'csv') {
      const csv = convertToCSV(data);
      downloadFile(csv, 'archived_contests.csv', 'text/csv');
    }
  };

  // 转换为 CSV
  const convertToCSV = (data) => {
    if (data.length === 0) return '';
    
    const headers = ['ID', '赛事名称', '类型', '开始时间', '结束时间', '参与人数', '归档时间'];
    const rows = data.map(contest => [
      contest.id,
      contest.name,
      contest.type,
      contest.start_date,
      contest.end_date,
      contest.participants || 0,
      contest.updated_at
    ]);

    return [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');
  };

  // 下载文件
  const downloadFile = (content, filename, type) => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  };

  // 生成总结报告
  const generateSummaryReport = (contest) => {
    const report = {
      基本信息: {
        赛事名称: contest.name,
        赛事类型: contest.type,
        举办时间: `${contest.start_date} 至 ${contest.end_date}`,
        举办地点: contest.location,
      },
      参与数据: {
        参与人数: contest.participants || 0,
        报名人数: contest.registrations || 0,
        完成率: contest.completion_rate || '未统计',
      },
      资源使用: {
        预算总额: contest.budget_total || 0,
        场地数量: contest.venue_count || 0,
        工作人员: contest.staff_count || 0,
      },
      成果总结: {
        获奖人数: contest.award_count || 0,
        满意度: contest.satisfaction || '未调查',
        影响力: contest.impact || '中等',
      }
    };

    return report;
  };

  const tabs = [
    { id: 'archived', label: '已归档赛事', icon: '📦' },
    { id: 'pending', label: '待归档赛事', icon: '⏳' },
    { id: 'report', label: '总结报告', icon: '📊' },
    { id: 'export', label: '数据导出', icon: '💾' },
  ];

  const filteredArchived = archivedContests.filter(contest =>
    contest.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredPending = contests.filter(contest =>
    contest.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* 页面头部 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 flex items-center gap-3">
            <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 text-white shadow-lg">
              📦
            </span>
            赛事归档
          </h1>
          <p className="mt-1 text-sm text-neutral-500">
            归档管理、数据导出、总结报告
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="md"
            onClick={handleAutoArchive}
          >
            <span className="mr-2">🤖</span>
            自动归档
          </Button>
          {selectedContests.length > 0 && (
            <Button
              variant="primary"
              size="md"
              onClick={handleBatchArchive}
            >
              <span className="mr-2">📦</span>
              批量归档 ({selectedContests.length})
            </Button>
          )}
        </div>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          title="已归档"
          value={archivedContests.length}
          icon="📦"
          color="purple"
        />
        <StatCard
          title="待归档"
          value={contests.length}
          icon="⏳"
          color="amber"
        />
        <StatCard
          title="总容量"
          value={`${((archivedContests.length * 2.5).toFixed(1))} MB`}
          icon="💾"
          color="blue"
        />
        <StatCard
          title="保留期限"
          value="永久"
          icon="⏰"
          color="green"
        />
      </div>

      {/* 标签页 */}
      <div className="bg-white rounded-xl shadow-sm border border-neutral-200 overflow-hidden">
        <div className="flex items-center gap-2 p-4 border-b border-neutral-200">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                px-4 py-2 rounded-lg font-medium transition-all
                ${activeTab === tab.id
                  ? 'bg-primary-500 text-white shadow-md'
                  : 'text-neutral-600 hover:bg-neutral-100'
                }
              `}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* 搜索栏 */}
        {(activeTab === 'archived' || activeTab === 'pending') && (
          <div className="p-4 border-b border-neutral-200">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="搜索赛事名称..."
              className="w-full px-4 py-2 bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        )}

        <div className="p-6">
          <AnimatePresence mode="wait">
            {/* 已归档赛事 */}
            {activeTab === 'archived' && (
              <ArchivedContestsList
                contests={filteredArchived}
                onExport={handleExportData}
              />
            )}

            {/* 待归档赛事 */}
            {activeTab === 'pending' && (
              <PendingContestsList
                contests={filteredPending}
                selectedContests={selectedContests}
                onSelectContest={setSelectedContests}
                onArchive={handleArchiveContest}
              />
            )}

            {/* 总结报告 */}
            {activeTab === 'report' && (
              <SummaryReports
                contests={archivedContests}
                onGenerate={generateSummaryReport}
              />
            )}

            {/* 数据导出 */}
            {activeTab === 'export' && (
              <DataExport
                contests={archivedContests}
                onExport={handleExportData}
              />
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

// 统计卡片组件
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
          <p className="text-2xl font-bold text-neutral-900">{value}</p>
        </div>
        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${colorClasses[color]} flex items-center justify-center text-white text-2xl shadow-lg`}>
          {icon}
        </div>
      </div>
    </motion.div>
  );
};

// 已归档赛事列表
const ArchivedContestsList = ({ contests, onExport }) => {
  if (contests.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">📦</div>
        <h3 className="text-lg font-semibold text-neutral-900 mb-2">暂无归档赛事</h3>
        <p className="text-neutral-500">已完成的赛事可以进行归档</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="space-y-3"
    >
      {contests.map((contest, index) => (
        <motion.div
          key={contest.id}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.05 }}
          className="bg-neutral-50 rounded-lg p-4 border border-neutral-200 hover:border-purple-300 hover:shadow-md transition-all"
        >
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h3 className="font-semibold text-neutral-900 mb-1">{contest.name}</h3>
              <div className="flex items-center gap-4 text-sm text-neutral-600">
                <span>🏷️ {contest.type}</span>
                <span>📅 {new Date(contest.end_date).toLocaleDateString('zh-CN')}</span>
                <span>👥 {contest.participants || 0} 人</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="default" size="sm">
                📦 已归档
              </Badge>
            </div>
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
};

// 待归档赛事列表
const PendingContestsList = ({ contests, selectedContests, onSelectContest, onArchive }) => {
  const toggleSelect = (id) => {
    if (selectedContests.includes(id)) {
      onSelectContest(selectedContests.filter(cid => cid !== id));
    } else {
      onSelectContest([...selectedContests, id]);
    }
  };

  if (contests.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">✅</div>
        <h3 className="text-lg font-semibold text-neutral-900 mb-2">暂无待归档赛事</h3>
        <p className="text-neutral-500">所有已完成的赛事都已归档</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="space-y-3"
    >
      {contests.map((contest, index) => (
        <motion.div
          key={contest.id}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.05 }}
          className="bg-neutral-50 rounded-lg p-4 border border-neutral-200 hover:border-amber-300 hover:shadow-md transition-all"
        >
          <div className="flex items-center gap-4">
            <input
              type="checkbox"
              checked={selectedContests.includes(contest.id)}
              onChange={() => toggleSelect(contest.id)}
              className="w-5 h-5 text-primary-600 rounded focus:ring-primary-500"
            />
            <div className="flex-1">
              <h3 className="font-semibold text-neutral-900 mb-1">{contest.name}</h3>
              <div className="flex items-center gap-4 text-sm text-neutral-600">
                <span>🏷️ {contest.type}</span>
                <span>📅 {new Date(contest.end_date).toLocaleDateString('zh-CN')}</span>
                <span>👥 {contest.participants || 0} 人</span>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onArchive(contest.id)}
            >
              <span className="mr-1">📦</span>
              归档
            </Button>
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
};

// 总结报告
const SummaryReports = ({ contests, onGenerate }) => {
  const [selectedContest, setSelectedContest] = useState(null);
  const [report, setReport] = useState(null);

  const handleGenerate = (contest) => {
    setSelectedContest(contest);
    setReport(onGenerate(contest));
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* 赛事列表 */}
      <div className="space-y-3">
        <h3 className="font-semibold text-neutral-900 mb-4">选择赛事</h3>
        {contests.length === 0 ? (
          <div className="text-center py-8 text-neutral-500">
            暂无归档赛事
          </div>
        ) : (
          contests.map(contest => (
            <button
              key={contest.id}
              onClick={() => handleGenerate(contest)}
              className={`
                w-full text-left p-4 rounded-lg border-2 transition-all
                ${selectedContest?.id === contest.id
                  ? 'border-primary-500 bg-primary-50'
                  : 'border-neutral-200 hover:border-primary-300'
                }
              `}
            >
              <h4 className="font-medium text-neutral-900">{contest.name}</h4>
              <p className="text-sm text-neutral-600 mt-1">
                {new Date(contest.end_date).toLocaleDateString('zh-CN')}
              </p>
            </button>
          ))
        )}
      </div>

      {/* 报告内容 */}
      <div>
        {report ? (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200"
          >
            <h3 className="text-xl font-bold text-neutral-900 mb-6 flex items-center gap-2">
              <span>📊</span>
              赛事总结报告
            </h3>

            {Object.entries(report).map(([section, data]) => (
              <div key={section} className="mb-6 last:mb-0">
                <h4 className="font-semibold text-neutral-800 mb-3">{section}</h4>
                <div className="space-y-2">
                  {Object.entries(data).map(([key, value]) => (
                    <div key={key} className="flex justify-between items-center bg-white rounded-lg p-3">
                      <span className="text-sm text-neutral-600">{key}</span>
                      <span className="text-sm font-medium text-neutral-900">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            <div className="mt-6 flex gap-3">
              <Button variant="primary" size="md" className="flex-1">
                <span className="mr-2">📥</span>
                下载报告
              </Button>
              <Button variant="outline" size="md" className="flex-1">
                <span className="mr-2">📧</span>
                发送邮件
              </Button>
            </div>
          </motion.div>
        ) : (
          <div className="h-full flex items-center justify-center text-neutral-400">
            <div className="text-center">
              <div className="text-6xl mb-4">📊</div>
              <p>选择赛事查看总结报告</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// 数据导出
const DataExport = ({ contests, onExport }) => {
  const exportOptions = [
    { id: 'json', label: 'JSON 格式', icon: '📄', description: '适合程序处理和数据分析' },
    { id: 'csv', label: 'CSV 表格', icon: '📊', description: '适合 Excel 打开和统计' },
    { id: 'pdf', label: 'PDF 报告', icon: '📕', description: '适合打印和归档保存' },
    { id: 'excel', label: 'Excel 文件', icon: '📗', description: '完整格式，包含图表' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="space-y-6"
    >
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <span className="text-2xl">💡</span>
          <div>
            <h4 className="font-semibold text-blue-900">数据导出说明</h4>
            <p className="text-sm text-blue-700 mt-1">
              当前可导出 {contests.length} 个归档赛事的数据，包括基础信息、参与数据、资源使用等。
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {exportOptions.map(option => (
          <motion.button
            key={option.id}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onExport(option.id)}
            className="bg-white border-2 border-neutral-200 rounded-xl p-6 hover:border-primary-400 hover:shadow-lg transition-all text-left"
          >
            <div className="text-4xl mb-3">{option.icon}</div>
            <h3 className="font-semibold text-neutral-900 mb-1">{option.label}</h3>
            <p className="text-sm text-neutral-600">{option.description}</p>
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
};

export default ContestArchive;
