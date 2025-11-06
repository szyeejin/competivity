import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { API_ENDPOINTS } from '../../../config/api';
import Button from '../../UI/Button';
import Badge from '../../UI/Badge';

/**
 * 组队管理页面
 * 功能：查看团队、管理成员、解散团队、团队统计
 */
const TeamManagement = () => {
  const [teams, setTeams] = useState([]);
  const [contests, setContests] = useState([]); // 动态赛事列表
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterContest, setFilterContest] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all'); // 新增状态筛选
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [showDetail, setShowDetail] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);

  useEffect(() => {
    fetchTeams();
    fetchContests();
  }, []);

  // 获取赛事列表
  const fetchContests = async () => {
    try {
      const response = await fetch(API_ENDPOINTS.CONTESTS.LIST);
      const result = await response.json();
      if (result.success) {
        setContests(result.data || []);
      }
    } catch (err) {
      console.error('获取赛事列表失败:', err);
    }
  };

  // 获取团队数据
  const fetchTeams = async () => {
    try {
      setLoading(true);
      const startTime = performance.now(); // 性能监控
      const response = await fetch(API_ENDPOINTS.TEAMS.LIST);
      const result = await response.json();
      
      if (result.success) {
        // 转换数据格式以匹配组件期望的结构
        const formattedTeams = (result.data || []).map(team => ({
          id: team.id,
          name: team.name,
          contestName: team.contest_name,
          contestId: team.contest_id,
          captain: {
            id: team.id,
            name: team.captain_name,
            studentId: team.captain_student_id,
            major: team.captain_major,
            avatar: '👨‍💻'
          },
          members: (team.members || []).map(m => ({
            id: m.id,
            name: m.student_name,
            studentId: m.student_id,
            major: m.major,
            role: m.role,
            avatar: '👨‍💼'
          })),
          memberCount: team.member_count,
          maxMembers: team.max_members,
          status: team.status,
          createdAt: team.created_at,
          skills: team.skills || [],
          achievements: team.achievements || []
        }));
        
        setTeams(formattedTeams);
        
        // 性能监控日志
        const loadTime = performance.now() - startTime;
        console.log(`✅ 团队列表加载完成，耗时: ${loadTime.toFixed(2)}ms`);
      } else {
        console.error('获取团队数据失败:', result.message);
      }
    } catch (err) {
      console.error('获取团队数据失败:', err);
    } finally {
      setLoading(false);
    }
  };

  // 显示确认弹窗
  const showConfirm = (action) => {
    setConfirmAction(action);
    setShowConfirmModal(true);
  };

  // 解散团队
  const handleDisbandTeam = async (teamId) => {
    const team = teams.find(t => t.id === teamId);
    showConfirm({
      type: 'disband',
      title: '解散团队',
      message: `确定要解散 "${team?.name}" 团队吗？`,
      description: '此操作将永久删除团队及所有成员信息，且无法恢复！',
      danger: true,
      onConfirm: async () => {
        try {
          const response = await fetch(API_ENDPOINTS.TEAMS.DELETE(teamId), {
            method: 'DELETE'
          });
          
          const result = await response.json();
          
          if (result.success) {
            setTeams(teams.filter(t => t.id !== teamId));
            setShowDetail(false);
            // 使用更优雅的通知方式
            showNotification('success', '团队已成功解散');
          } else {
            showNotification('error', '解散失败：' + result.message);
          }
        } catch (err) {
          console.error('解散团队失败:', err);
          showNotification('error', '解散失败：' + err.message);
        }
      }
    });
    return;

  };

  // 移除成员
  const handleRemoveMember = async (teamId, memberId, memberName) => {
    showConfirm({
      type: 'removeMember',
      title: '移除成员',
      message: `确定要将 "${memberName}" 移出团队吗？`,
      description: '移除后该成员将失去团队访问权限',
      danger: true,
      onConfirm: async () => {
        try {
          const response = await fetch(API_ENDPOINTS.TEAMS.REMOVE_MEMBER(teamId, memberId), {
            method: 'DELETE'
          });
          
          const result = await response.json();
          
          if (result.success) {
            fetchTeams(); // 刷新列表
            showNotification('success', '成员已移除');
          } else {
            showNotification('error', '移除失败：' + result.message);
          }
        } catch (err) {
          console.error('移除成员失败:', err);
          showNotification('error', '移除失败：' + err.message);
        }
      }
    });
    return;

  };

  // 通知系统（临时实现，后续可替换为Toast组件）
  const showNotification = (type, message) => {
    // 简单的alert实现，可以后续替换为更优雅的Toast组件
    alert(message);
  };

  // 筛选数据（使用useMemo优化性能）
  const filteredTeams = useMemo(() => {
    const startTime = performance.now();
    
    const result = teams.filter(team => {
      const matchSearch = 
        team.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        team.captain.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        team.contestName?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchContest = filterContest === 'all' || team.contestId === parseInt(filterContest);
      const matchStatus = filterStatus === 'all' || team.status === filterStatus;
      
      return matchSearch && matchContest && matchStatus;
    });
    
    const filterTime = performance.now() - startTime;
    console.log(`🔍 筛选操作完成，耗时: ${filterTime.toFixed(2)}ms`);
    
    return result;
  }, [teams, searchQuery, filterContest, filterStatus]);

  // 统计数据（使用useMemo优化）
  const stats = useMemo(() => ({
    total: teams.length,
    active: teams.filter(t => t.status === 'active').length,
    recruiting: teams.filter(t => t.status === 'recruiting').length,
    avgMembers: teams.length > 0 ? (teams.reduce((sum, t) => sum + t.memberCount, 0) / teams.length).toFixed(1) : 0
  }), [teams]);

  // 处理统计卡片点击
  const handleStatCardClick = (type) => {
    switch (type) {
      case 'total':
        setFilterStatus('all');
        setFilterContest('all');
        setSearchQuery('');
        break;
      case 'active':
        setFilterStatus('active');
        break;
      case 'recruiting':
        setFilterStatus('recruiting');
        break;
      default:
        break;
    }
  };

  return (
    <div className="space-y-6">
      {/* 页面头部 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 flex items-center gap-3">
            <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-green-600 text-white shadow-lg">
              👥
            </span>
            组队管理
          </h1>
          <p className="mt-1 text-sm text-neutral-500">
            管理竞赛团队和成员
          </p>
        </div>
      </div>

      {/* 统计卡片 - 可点击筛选 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard 
          title="团队总数" 
          value={stats.total} 
          icon="👥" 
          color="blue" 
          onClick={() => handleStatCardClick('total')}
          subtitle="点击查看全部团队"
          clickable
        />
        <StatCard 
          title="活跃中" 
          value={stats.active} 
          icon="✅" 
          color="green" 
          onClick={() => handleStatCardClick('active')}
          subtitle="点击筛选活跃团队"
          clickable
        />
        <StatCard 
          title="招募中" 
          value={stats.recruiting} 
          icon="📢" 
          color="amber" 
          onClick={() => handleStatCardClick('recruiting')}
          subtitle="点击筛选招募团队"
          clickable
        />
        <StatCard 
          title="平均人数" 
          value={stats.avgMembers} 
          icon="👨‍👩‍👧" 
          color="purple" 
          subtitle="近30天有效团队均值"
        />
      </div>

      {/* 筛选栏 */}
      <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* 搜索框 */}
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="搜索团队名称、队长或赛事..."
            className="px-4 py-2 bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          />

          {/* 赛事筛选 - 动态加载 */}
          <select
            value={filterContest}
            onChange={(e) => setFilterContest(e.target.value)}
            className="px-4 py-2 bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all hover:border-primary-300"
          >
            <option value="all">全部赛事</option>
            {contests.map(contest => (
              <option key={contest.id} value={contest.id}>{contest.name}</option>
            ))}
          </select>

          {/* 状态筛选 */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all hover:border-primary-300"
          >
            <option value="all">全部状态</option>
            <option value="active">✅ 活跃中</option>
            <option value="recruiting">📢 招募中</option>
          </select>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <div className="text-sm text-neutral-600">
            共 <span className="font-semibold text-neutral-900">{teams.length}</span> 个团队，筛选结果: <span className="font-semibold text-primary-600">{filteredTeams.length}</span> 个
          </div>
          {(searchQuery || filterContest !== 'all' || filterStatus !== 'all') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setFilterContest('all');
                setFilterStatus('all');
              }}
              className="text-sm text-primary-600 hover:text-primary-700 font-medium transition-colors"
            >
              ✕ 清除筛选
            </button>
          )}
        </div>
      </div>

      {/* 团队列表 */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-neutral-600">加载中...</p>
          </div>
        ) : filteredTeams.length === 0 ? (
          <div className="bg-white rounded-xl border border-neutral-200 p-12 text-center">
            <div className="text-6xl mb-4">👥</div>
            <h3 className="text-lg font-semibold text-neutral-900 mb-2">暂无团队</h3>
            <p className="text-neutral-500">当前筛选条件下没有团队</p>
          </div>
        ) : (
          filteredTeams.map((team, index) => (
            <TeamCard
              key={team.id}
              team={team}
              index={index}
              onViewDetail={() => {
                setSelectedTeam(team);
                setShowDetail(true);
              }}
              onDisband={handleDisbandTeam}
            />
          ))
        )}
      </div>

      {/* 详情弹窗 */}
      <AnimatePresence>
        {showDetail && selectedTeam && (
          <TeamDetailModal
            team={selectedTeam}
            onClose={() => {
              setShowDetail(false);
              setSelectedTeam(null);
            }}
            onRemoveMember={handleRemoveMember}
            onRefresh={fetchTeams}
            onDisband={handleDisbandTeam}
          />
        )}
      </AnimatePresence>

      {/* 二次确认弹窗 */}
      <AnimatePresence>
        {showConfirmModal && confirmAction && (
          <ConfirmModal
            title={confirmAction.title}
            message={confirmAction.message}
            description={confirmAction.description}
            danger={confirmAction.danger}
            onConfirm={() => {
              confirmAction.onConfirm();
              setShowConfirmModal(false);
              setConfirmAction(null);
            }}
            onCancel={() => {
              setShowConfirmModal(false);
              setConfirmAction(null);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

// 统计卡片 - 支持点击交互
const StatCard = ({ title, value, icon, color, onClick, subtitle, clickable = false }) => {
  const colorClasses = {
    blue: 'from-blue-400 to-blue-600',
    green: 'from-green-400 to-green-600',
    amber: 'from-amber-400 to-orange-500',
    purple: 'from-purple-400 to-purple-600',
  };

  const Component = clickable ? motion.button : motion.div;

  return (
    <Component
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={clickable ? { scale: 1.02, y: -2 } : {}}
      whileTap={clickable ? { scale: 0.98 } : {}}
      onClick={onClick}
      className={`bg-white rounded-xl border border-neutral-200 p-6 transition-all ${
        clickable 
          ? 'cursor-pointer hover:shadow-lg hover:border-primary-300 active:shadow-md' 
          : ''
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="text-left">
          <p className="text-sm text-neutral-600 mb-1">{title}</p>
          <p className="text-3xl font-bold text-neutral-900 mb-1">{value}</p>
          {subtitle && (
            <p className="text-xs text-neutral-500">{subtitle}</p>
          )}
        </div>
        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${colorClasses[color]} flex items-center justify-center text-white text-2xl shadow-lg shrink-0`}>
          {icon}
        </div>
      </div>
    </Component>
  );
};

// 团队卡片
const TeamCard = ({ team, index, onViewDetail, onDisband }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="bg-white rounded-xl border border-neutral-200 p-6 hover:shadow-lg transition-all"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-xl font-bold text-neutral-900">{team.name}</h3>
            <Badge 
              variant={team.status === 'active' ? 'success' : 'warning'} 
              size="sm"
            >
              {team.status === 'active' ? '✅ 活跃' : '📢 招募中'}
            </Badge>
          </div>
          <p className="text-sm text-neutral-600">🏆 {team.contestName}</p>
        </div>

        <div className="text-right">
          <div className="text-2xl font-bold text-primary-600">{team.memberCount}/{team.maxMembers}</div>
          <div className="text-xs text-neutral-500">成员</div>
        </div>
      </div>

      {/* 队长信息 */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 mb-4">
        <div className="flex items-center gap-3">
          <span className="text-3xl">{team.captain.avatar}</span>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-semibold text-neutral-900">{team.captain.name}</span>
              <Badge variant="primary" size="sm">队长</Badge>
            </div>
            <div className="text-sm text-neutral-600">
              {team.captain.studentId} · {team.captain.major}
            </div>
          </div>
        </div>
      </div>

      {/* 成员列表 - 支持hover显示详情 */}
      <div className="mb-4">
        <h4 className="text-sm font-semibold text-neutral-700 mb-2">
          团队成员 ({team.members.length}人)
        </h4>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {team.members.map(member => (
            <motion.div
              key={member.id}
              className="group relative flex items-center gap-2 bg-neutral-100 rounded-lg px-3 py-2 hover:bg-neutral-200 hover:shadow-md transition-all cursor-pointer"
              whileHover={{ scale: 1.02 }}
              title={`${member.name} - ${member.role}`}
            >
              <span className="text-xl">{member.avatar}</span>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-neutral-900 truncate">{member.name}</div>
                <div className="text-xs text-neutral-600 truncate">{member.role}</div>
              </div>
              {/* Hover时显示更多信息 */}
              <div className="absolute left-0 right-0 top-full mt-1 p-2 bg-neutral-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-10 shadow-xl">
                <div className="font-semibold mb-1">{member.name}</div>
                <div className="text-neutral-300">{member.studentId}</div>
                <div className="text-neutral-300">{member.major}</div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* 团队技能 */}
      <div className="mb-4">
        <h4 className="text-sm font-semibold text-neutral-700 mb-2">团队技能</h4>
        <div className="flex flex-wrap gap-2">
          {team.skills.map((skill, idx) => (
            <span key={idx} className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
              {skill}
            </span>
          ))}
        </div>
      </div>

      {/* 团队成就 */}
      {team.achievements.length > 0 && (
        <div className="mb-4">
          <h4 className="text-sm font-semibold text-neutral-700 mb-2">🏆 团队成就</h4>
          <div className="flex flex-wrap gap-2">
            {team.achievements.map((achievement, idx) => (
              <span key={idx} className="px-2 py-1 bg-amber-100 text-amber-700 text-xs rounded-full">
                {achievement}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* 操作按钮 */}
      <div className="flex items-center justify-between pt-4 border-t border-neutral-200">
        <span className="text-xs text-neutral-500">
          创建时间：{new Date(team.createdAt).toLocaleDateString('zh-CN')}
        </span>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={onViewDetail}>
            查看详情
          </Button>
          <Button variant="danger" size="sm" onClick={() => onDisband(team.id)}>
            解散团队
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

// 团队详情弹窗
const TeamDetailModal = ({ team, onClose, onRemoveMember, onDisband }) => {
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
        <div className="sticky top-0 bg-white border-b border-neutral-200 p-6 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-neutral-900">{team.name}</h2>
            <p className="text-sm text-neutral-600 mt-1">{team.contestName}</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-neutral-100 flex items-center justify-center text-neutral-600"
          >
            ✕
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* 团队统计 */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-blue-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">{team.memberCount}</div>
              <div className="text-sm text-blue-700">当前成员</div>
            </div>
            <div className="bg-green-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-green-600">{team.maxMembers - team.memberCount}</div>
              <div className="text-sm text-green-700">剩余名额</div>
            </div>
            <div className="bg-purple-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-purple-600">{team.achievements.length}</div>
              <div className="text-sm text-purple-700">团队成就</div>
            </div>
          </div>

          {/* 队长信息 */}
          <div>
            <h3 className="font-semibold text-neutral-900 mb-3">👑 队长信息</h3>
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4">
              <div className="flex items-center gap-4">
                <span className="text-5xl">{team.captain.avatar}</span>
                <div className="flex-1">
                  <h4 className="text-lg font-semibold text-neutral-900 mb-1">{team.captain.name}</h4>
                  <div className="text-sm text-neutral-600 space-y-1">
                    <div>学号：{team.captain.studentId}</div>
                    <div>专业：{team.captain.major}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 团队成员 */}
          <div>
            <h3 className="font-semibold text-neutral-900 mb-3">👥 团队成员</h3>
            <div className="space-y-3">
              {team.members.map(member => (
                <div
                  key={member.id}
                  className="bg-neutral-50 rounded-lg p-4 flex items-center justify-between"
                >
                  <div className="flex items-center gap-4">
                    <span className="text-4xl">{member.avatar}</span>
                    <div>
                      <h4 className="font-semibold text-neutral-900">{member.name}</h4>
                      <div className="text-sm text-neutral-600 mt-1">
                        {member.studentId} · {member.major}
                      </div>
                      <Badge variant="info" size="sm" className="mt-1">
                        {member.role}
                      </Badge>
                    </div>
                  </div>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => {
                      onRemoveMember(team.id, member.id, member.name);
                      onClose();
                    }}
                  >
                    移除
                  </Button>
                </div>
              ))}
            </div>
          </div>

          {/* 团队技能 */}
          <div>
            <h3 className="font-semibold text-neutral-900 mb-3">💪 团队技能</h3>
            <div className="flex flex-wrap gap-2">
              {team.skills.map((skill, idx) => (
                <span key={idx} className="px-3 py-2 bg-green-100 text-green-700 rounded-lg font-medium">
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {/* 团队成就 */}
          {team.achievements.length > 0 && (
            <div>
              <h3 className="font-semibold text-neutral-900 mb-3">🏆 团队成就</h3>
              <div className="space-y-2">
                {team.achievements.map((achievement, idx) => (
                  <div key={idx} className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-center gap-2">
                    <span className="text-xl">🏆</span>
                    <span className="text-amber-800 font-medium">{achievement}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 底部操作 */}
        <div className="sticky bottom-0 bg-white border-t border-neutral-200 p-6 flex items-center justify-between">
          <span className="text-sm text-neutral-500">
            创建于 {new Date(team.createdAt).toLocaleString('zh-CN')}
          </span>
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={onClose}>
              关闭
            </Button>
            <Button variant="danger" onClick={() => {
              onDisband(team.id);
              onClose();
            }}>
              解散团队
            </Button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

// 二次确认弹窗组件
const ConfirmModal = ({ title, message, description, danger = false, onConfirm, onCancel }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={onCancel}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-xl shadow-2xl max-w-md w-full"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 头部 */}
        <div className={`p-6 border-b ${danger ? 'border-red-100 bg-red-50' : 'border-neutral-200'}`}>
          <div className="flex items-center gap-3">
            {danger ? (
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                <span className="text-2xl">⚠️</span>
              </div>
            ) : (
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                <span className="text-2xl">ℹ️</span>
              </div>
            )}
            <div>
              <h3 className={`text-lg font-bold ${danger ? 'text-red-900' : 'text-neutral-900'}`}>
                {title}
              </h3>
            </div>
          </div>
        </div>

        {/* 内容 */}
        <div className="p-6">
          <p className="text-neutral-900 font-medium mb-2">{message}</p>
          {description && (
            <p className="text-sm text-neutral-600">{description}</p>
          )}
        </div>

        {/* 操作按钮 */}
        <div className="p-6 border-t border-neutral-200 flex items-center justify-end gap-3">
          <Button
            variant="outline"
            onClick={onCancel}
          >
            取消
          </Button>
          <Button
            variant={danger ? 'danger' : 'primary'}
            onClick={onConfirm}
          >
            确认
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default TeamManagement;
