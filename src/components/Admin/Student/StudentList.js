import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { API_ENDPOINTS } from '../../../config/api';
import Button from '../../UI/Button';
import Badge from '../../UI/Badge';

/**
 * 学生列表页面
 * 功能：查看所有学生、筛选搜索、详情查看、数据导出
 */
const StudentList = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterGrade, setFilterGrade] = useState('all');
  const [filterMajor, setFilterMajor] = useState('all');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showDetail, setShowDetail] = useState(false);
  const [sortBy, setSortBy] = useState('name'); // name, studentId, grade

  useEffect(() => {
    fetchStudents();
  }, []);

  // 获取学生数据
  const fetchStudents = async () => {
    try {
      setLoading(true);
      
      // 构建查询参数
      let url = API_ENDPOINTS.STUDENTS.LIST;
      const params = new URLSearchParams();
      if (filterGrade !== 'all') params.append('grade', filterGrade);
      if (filterMajor !== 'all') params.append('major', filterMajor);
      if (params.toString()) url += '?' + params.toString();
      
      const response = await fetch(url);
      const result = await response.json();
      
      if (result.success) {
        // 处理数据，确保 gpa 是数字类型
        const processedData = (result.data || []).map(student => ({
          ...student,
          gpa: parseFloat(student.gpa) || 0,
          registeredContests: student.registeredContests || [],
          teams: student.teams || [],
          skills: student.skills || [],
          achievements: student.achievements || []
        }));
        setStudents(processedData);
      } else {
        console.error('获取学生数据失败:', result.message);
      }
    } catch (err) {
      console.error('获取学生数据失败:', err);
    } finally {
      setLoading(false);
    }
  };

  // 导出数据
  const handleExport = () => {
    const csv = convertToCSV(filteredStudents);
    downloadFile(csv, 'students.csv', 'text/csv');
  };

  // 转换为 CSV
  const convertToCSV = (data) => {
    if (data.length === 0) return '';
    
    const headers = ['姓名', '学号', '专业', '年级', '班级', '邮箱', '手机', 'GPA', '参赛数量', '团队数量'];
    const rows = data.map(student => [
      student.name,
      student.studentId,
      student.major,
      student.grade,
      student.class,
      student.email,
      student.phone,
      student.gpa,
      student.registeredContests.length,
      student.teams.length
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

  // 筛选和排序
  const filteredStudents = students
    .filter(student => {
      const matchSearch = 
        student.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.studentId?.includes(searchQuery) ||
        student.major?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchGrade = filterGrade === 'all' || student.grade === filterGrade;
      const matchMajor = filterMajor === 'all' || student.major === filterMajor;
      
      return matchSearch && matchGrade && matchMajor;
    })
    .sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name, 'zh-CN');
      if (sortBy === 'studentId') return a.studentId.localeCompare(b.studentId);
      if (sortBy === 'grade') return a.grade.localeCompare(b.grade);
      return 0;
    });

  // 统计数据
  const stats = {
    total: students.length,
    active: students.filter(s => s.registeredContests.length > 0).length,
    inTeam: students.filter(s => s.teams.length > 0).length,
    avgGPA: students.length > 0 ? (students.reduce((sum, s) => sum + s.gpa, 0) / students.length).toFixed(2) : 0
  };

  // 获取唯一专业列表
  const majors = [...new Set(students.map(s => s.major))];

  return (
    <div className="space-y-6">
      {/* 页面头部 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 flex items-center gap-3">
            <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 text-white shadow-lg">
              👨‍🎓
            </span>
            学生列表
          </h1>
          <p className="mt-1 text-sm text-neutral-500">
            查看和管理所有学生信息
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          onClick={handleExport}
        >
          <span className="mr-2">📥</span>
          导出数据
        </Button>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard title="学生总数" value={stats.total} icon="👨‍🎓" color="blue" />
        <StatCard title="活跃学生" value={stats.active} icon="🔥" color="green" />
        <StatCard title="加入团队" value={stats.inTeam} icon="👥" color="purple" />
        <StatCard title="平均GPA" value={stats.avgGPA} icon="📊" color="amber" />
      </div>

      {/* 筛选栏 */}
      <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* 搜索框 */}
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="搜索姓名、学号或专业..."
            className="px-4 py-2 bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          />

          {/* 年级筛选 */}
          <select
            value={filterGrade}
            onChange={(e) => setFilterGrade(e.target.value)}
            className="px-4 py-2 bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="all">全部年级</option>
            <option value="大一">大一</option>
            <option value="大二">大二</option>
            <option value="大三">大三</option>
            <option value="大四">大四</option>
            <option value="研一">研一</option>
            <option value="研二">研二</option>
            <option value="研三">研三</option>
          </select>

          {/* 专业筛选 */}
          <select
            value={filterMajor}
            onChange={(e) => setFilterMajor(e.target.value)}
            className="px-4 py-2 bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="all">全部专业</option>
            {majors.map(major => (
              <option key={major} value={major}>{major}</option>
            ))}
          </select>

          {/* 排序 */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-2 bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="name">按姓名排序</option>
            <option value="studentId">按学号排序</option>
            <option value="grade">按年级排序</option>
          </select>
        </div>

        <div className="mt-4 text-sm text-neutral-600">
          共 {students.length} 名学生，筛选结果: {filteredStudents.length} 名
        </div>
      </div>

      {/* 学生列表 */}
      <div className="bg-white rounded-xl shadow-sm border border-neutral-200 overflow-hidden">
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-neutral-600">加载中...</p>
          </div>
        ) : filteredStudents.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">👨‍🎓</div>
            <h3 className="text-lg font-semibold text-neutral-900 mb-2">暂无学生</h3>
            <p className="text-neutral-500">当前筛选条件下没有学生</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-neutral-50 border-b border-neutral-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-600 uppercase tracking-wider">学生</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-600 uppercase tracking-wider">学号</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-600 uppercase tracking-wider">专业班级</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-600 uppercase tracking-wider">联系方式</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-600 uppercase tracking-wider">参赛情况</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-600 uppercase tracking-wider">GPA</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-neutral-600 uppercase tracking-wider">操作</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-neutral-200">
                {filteredStudents.map((student, index) => (
                  <StudentRow
                    key={student.id}
                    student={student}
                    index={index}
                    onViewDetail={() => {
                      setSelectedStudent(student);
                      setShowDetail(true);
                    }}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 详情弹窗 */}
      <AnimatePresence>
        {showDetail && selectedStudent && (
          <StudentDetailModal
            student={selectedStudent}
            onClose={() => {
              setShowDetail(false);
              setSelectedStudent(null);
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
    blue: 'from-blue-400 to-blue-600',
    green: 'from-green-400 to-green-600',
    purple: 'from-purple-400 to-purple-600',
    amber: 'from-amber-400 to-orange-500',
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

// 学生行
const StudentRow = ({ student, index, onViewDetail }) => {
  return (
    <motion.tr
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.03 }}
      className="hover:bg-neutral-50 transition-colors"
    >
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center gap-3">
          <span className="text-3xl">{student.avatar}</span>
          <div>
            <div className="font-medium text-neutral-900">{student.name}</div>
            <div className="text-sm text-neutral-500">{student.grade}</div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-neutral-900">{student.studentId}</div>
      </td>
      <td className="px-6 py-4">
        <div className="text-sm text-neutral-900">{student.major}</div>
        <div className="text-xs text-neutral-500">{student.class}</div>
      </td>
      <td className="px-6 py-4">
        <div className="text-sm text-neutral-900">{student.email}</div>
        <div className="text-xs text-neutral-500">{student.phone}</div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center gap-2">
          <Badge variant="info" size="sm">
            {student.registeredContests.length} 个赛事
          </Badge>
          <Badge variant="success" size="sm">
            {student.teams.length} 个团队
          </Badge>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className={`text-sm font-semibold ${
          student.gpa >= 3.7 ? 'text-green-600' :
          student.gpa >= 3.0 ? 'text-blue-600' :
          'text-neutral-600'
        }`}>
          {(parseFloat(student.gpa) || 0).toFixed(1)}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right">
        <Button variant="outline" size="sm" onClick={onViewDetail}>
          查看详情
        </Button>
      </td>
    </motion.tr>
  );
};

// 学生详情弹窗
const StudentDetailModal = ({ student, onClose }) => {
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
          <div className="flex items-center gap-4">
            <span className="text-5xl">{student.avatar}</span>
            <div>
              <h2 className="text-xl font-bold text-neutral-900">{student.name}</h2>
              <p className="text-sm text-neutral-600 mt-1">{student.studentId} · {student.grade}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-neutral-100 flex items-center justify-center text-neutral-600"
          >
            ✕
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* 基本信息 */}
          <div>
            <h3 className="font-semibold text-neutral-900 mb-3">📋 基本信息</h3>
            <div className="bg-neutral-50 rounded-lg p-4 grid grid-cols-2 gap-4">
              <div>
                <span className="text-sm text-neutral-600">专业</span>
                <p className="font-medium text-neutral-900">{student.major}</p>
              </div>
              <div>
                <span className="text-sm text-neutral-600">班级</span>
                <p className="font-medium text-neutral-900">{student.class}</p>
              </div>
              <div>
                <span className="text-sm text-neutral-600">邮箱</span>
                <p className="font-medium text-neutral-900">{student.email}</p>
              </div>
              <div>
                <span className="text-sm text-neutral-600">手机</span>
                <p className="font-medium text-neutral-900">{student.phone}</p>
              </div>
              <div>
                <span className="text-sm text-neutral-600">GPA</span>
                <p className="font-medium text-neutral-900">{(parseFloat(student.gpa) || 0).toFixed(2)}</p>
              </div>
              <div>
                <span className="text-sm text-neutral-600">注册时间</span>
                <p className="font-medium text-neutral-900">
                  {new Date(student.createdAt).toLocaleDateString('zh-CN')}
                </p>
              </div>
            </div>
          </div>

          {/* 参赛记录 */}
          <div>
            <h3 className="font-semibold text-neutral-900 mb-3">🏆 参赛记录</h3>
            {student.registeredContests.length === 0 ? (
              <div className="bg-neutral-50 rounded-lg p-4 text-center text-neutral-500">
                暂无参赛记录
              </div>
            ) : (
              <div className="space-y-2">
                {student.registeredContests.map(contest => (
                  <div key={contest.id} className="bg-neutral-50 rounded-lg p-4 flex items-center justify-between">
                    <span className="font-medium text-neutral-900">{contest.name}</span>
                    <Badge 
                      variant={contest.status === 'approved' ? 'success' : 'warning'} 
                      size="sm"
                    >
                      {contest.status === 'approved' ? '✅ 已通过' : '⏳ 待审核'}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 团队信息 */}
          <div>
            <h3 className="font-semibold text-neutral-900 mb-3">👥 团队信息</h3>
            {student.teams.length === 0 ? (
              <div className="bg-neutral-50 rounded-lg p-4 text-center text-neutral-500">
                暂未加入团队
              </div>
            ) : (
              <div className="space-y-2">
                {student.teams.map(team => (
                  <div key={team.id} className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 flex items-center justify-between">
                    <span className="font-medium text-neutral-900">{team.name}</span>
                    <Badge variant="primary" size="sm">
                      {team.role}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 技能特长 */}
          <div>
            <h3 className="font-semibold text-neutral-900 mb-3">💪 技能特长</h3>
            <div className="flex flex-wrap gap-2">
              {student.skills.map((skill, idx) => (
                <span key={idx} className="px-3 py-2 bg-green-100 text-green-700 rounded-lg font-medium">
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {/* 获奖成就 */}
          {student.achievements.length > 0 && (
            <div>
              <h3 className="font-semibold text-neutral-900 mb-3">🏅 获奖成就</h3>
              <div className="space-y-2">
                {student.achievements.map((achievement, idx) => (
                  <div key={idx} className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-center gap-2">
                    <span className="text-xl">🏆</span>
                    <span className="text-amber-800 font-medium">{achievement}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="sticky bottom-0 bg-white border-t border-neutral-200 p-6 flex items-center justify-end">
          <Button variant="primary" onClick={onClose}>
            关闭
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default StudentList;
