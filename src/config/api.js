/**
 * API 配置文件
 * 统一管理所有后端 API 端点
 */

// 后端服务器地址
const API_BASE_URL = 'http://localhost:5000';

// API 端点配置
export const API_ENDPOINTS = {
  // 用户相关
  AUTH: {
    REGISTER: `${API_BASE_URL}/api/register`,
    LOGIN: `${API_BASE_URL}/api/login`,
  },
  
  // 赛事相关
  CONTESTS: {
    CREATE: `${API_BASE_URL}/api/contests`,
    LIST: `${API_BASE_URL}/api/contests`,
    DETAIL: (id) => `${API_BASE_URL}/api/contests/${id}`,
    REVIEW: (id) => `${API_BASE_URL}/api/contests/${id}/review`,
    CONFLICTS: (id) => `${API_BASE_URL}/api/contests/${id}/conflicts`,
    DETECT_CONFLICTS: (id) => `${API_BASE_URL}/api/contests/${id}/detect-conflicts`,
  },
  
  // 审核相关
  REVIEWS: {
    LIST: `${API_BASE_URL}/api/reviews`,
    STATS: `${API_BASE_URL}/api/reviews/stats`,
  },
  
  // 冲突相关
  CONFLICTS: {
    RESOLVE: (id) => `${API_BASE_URL}/api/conflicts/${id}/resolve`,
  },
  
  // 通知相关
  NOTIFICATIONS: {
    LIST: `${API_BASE_URL}/api/notifications`,
  },
  
  // 学生管理相关
  REGISTRATIONS: {
    LIST: `${API_BASE_URL}/api/registrations`,
    APPROVE: (id) => `${API_BASE_URL}/api/registrations/${id}/approve`,
    REJECT: (id) => `${API_BASE_URL}/api/registrations/${id}/reject`,
    BATCH_APPROVE: `${API_BASE_URL}/api/registrations/batch-approve`,
  },
  
  // 团队管理相关
  TEAMS: {
    LIST: `${API_BASE_URL}/api/teams`,
    DETAIL: (id) => `${API_BASE_URL}/api/teams/${id}`,
    DELETE: (id) => `${API_BASE_URL}/api/teams/${id}`,
    REMOVE_MEMBER: (teamId, memberId) => `${API_BASE_URL}/api/teams/${teamId}/members/${memberId}`,
  },
  
  // 学生列表相关
  STUDENTS: {
    LIST: `${API_BASE_URL}/api/students`,
    DETAIL: (id) => `${API_BASE_URL}/api/students/${id}`,
  },
  
  // 评审管理相关
  EXPERTS: {
    LIST: `${API_BASE_URL}/api/experts`,
    ADD: `${API_BASE_URL}/api/experts`,
  },
  
  JUDGE_ASSIGNMENTS: {
    LIST: `${API_BASE_URL}/api/judge-assignments`,
    ASSIGN: `${API_BASE_URL}/api/judge-assignments`,
  },
  
  CONTEST_RESULTS: {
    LIST: `${API_BASE_URL}/api/contest-results`,
    PUBLISH: (id) => `${API_BASE_URL}/api/contest-results/${id}/publish`,
    BATCH_PUBLISH: `${API_BASE_URL}/api/contest-results/batch-publish`,
  },
  
  // 系统相关
  SYSTEM: {
    HEALTH: `${API_BASE_URL}/api/health`,
    TEST: `${API_BASE_URL}/api/test`,
  },
};

// 导出基础 URL（如果需要）
export const BASE_URL = API_BASE_URL;

// API 请求工具函数
export const apiRequest = async (url, options = {}) => {
  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || '请求失败');
    }
    
    return data;
  } catch (error) {
    console.error('API 请求错误:', error);
    throw error;
  }
};

export default API_ENDPOINTS;
