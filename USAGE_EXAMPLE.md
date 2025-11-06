# 赛事审核系统使用示例

## 快速开始

### 1. 在 App.js 中引入审核页面

```javascript
import React from 'react';
import { ContestReview } from './components/Admin/Review';

function App() {
  return (
    <div className="App">
      <ContestReview />
    </div>
  );
}

export default App;
```

### 2. 在路由系统中集成

如果使用 React Router：

```javascript
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ContestReview } from './components/Admin/Review';
import Login from './components/Login';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/admin/review" element={<ContestReview />} />
        {/* 其他路由 */}
      </Routes>
    </Router>
  );
}
```

### 3. 页面展示效果

访问 `/admin/review` 路径，你将看到：

1. **顶部导航栏**
   - 页面标题和说明
   - 刷新按钮和导出报表按钮

2. **统计卡片区域（6个卡片）**
   - 待审核：显示待处理数量，橙色渐变
   - 审核中：显示处理中数量，蓝色渐变
   - 已通过：显示通过数量，绿色渐变
   - 已驳回：显示驳回数量，红色渐变
   - 冲突检测：显示冲突数量，紫色渐变（高亮）
   - 总申请数：显示总数，靛蓝渐变

3. **筛选区域**
   - 5个标签页快速切换
   - 搜索框实时搜索
   - 等级筛选下拉框

4. **审核列表表格**
   - 赛事基本信息
   - 状态标签
   - 冲突警告
   - 操作按钮

## 功能演示

### 场景1：审核一个新的赛事申请

1. 在"待审核"标签页找到赛事
2. 点击"立即审核"按钮
3. 右侧滑出审核抽屉
4. 查看赛事详细信息
5. 逐项勾选审核检查清单
6. 如有冲突，查看冲突详情
7. 选择"通过"或"驳回"
8. 填写审核意见
9. 点击"提交审核"

### 场景2：查看冲突详情

1. 在列表中看到有冲突的赛事（显示⚠️图标）
2. 点击"查看详情"
3. 弹出冲突检测面板
4. 切换"概览"、"详细信息"、"解决建议"标签页
5. 查看具体冲突和解决方案
6. 可选择"通知申请人"

### 场景3：快速通过无冲突赛事

1. 点击"立即审核"打开抽屉
2. 确认无冲突（没有⚠️警告）
3. 点击"快速通过"按钮
4. 系统自动填写通过意见并提交

### 场景4：搜索和筛选

1. 在搜索框输入赛事名称或主办方
2. 实时过滤显示结果
3. 使用等级下拉框进一步筛选
4. 点击标签页切换不同状态

## 自定义配置

### 修改统计卡片数据

```javascript
const stats = {
  pending: 10,      // 待审核数量
  reviewing: 5,     // 审核中数量
  approved: 20,     // 已通过数量
  rejected: 3,      // 已驳回数量
  total: 38,        // 总数
  conflicts: 4,     // 冲突数量
};
```

### 添加赛事数据

```javascript
const newContest = {
  id: 6,
  name: '新赛事名称',
  organizer: '主办方',
  category: '赛事类别',
  level: '国家级',
  status: 'pending',
  priority: 'high',
  submitTime: '2024-11-05 10:00',
  applicant: '申请人',
  conflicts: ['时间冲突'],
  participants: 100,
  budget: 20000,
};

setContests(prev => [...prev, newContest]);
```

## 集成后端API示例

```javascript
// 在 ContestReview.js 中

// 获取赛事列表
useEffect(() => {
  const fetchData = async () => {
    try {
      const response = await fetch('/api/contests/review');
      const data = await response.json();
      setContests(data);
    } catch (error) {
      console.error('获取数据失败:', error);
    }
  };
  
  fetchData();
}, []);

// 提交审核结果
const handleSubmitReview = async (contestId, result, comment) => {
  try {
    await fetch(`/api/contests/${contestId}/review`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ result, comment }),
    });
    
    // 更新本地状态
    setContests(prev => prev.map(c => 
      c.id === contestId 
        ? { ...c, status: result, reviewer: '当前用户', reviewTime: new Date() }
        : c
    ));
    
    setDrawerOpen(false);
  } catch (error) {
    console.error('提交审核失败:', error);
    alert('提交失败，请重试');
  }
};
```

## 常用操作技巧

1. **批量审核**：可以扩展代码添加多选功能
2. **导出报表**：连接后端API导出Excel或PDF
3. **实时通知**：集成WebSocket实现实时更新
4. **权限控制**：根据用户角色显示不同操作按钮

## 性能优化建议

1. 数据量大时使用分页或虚拟滚动
2. 使用 React Query 或 SWR 管理服务端状态
3. 添加骨架屏提升加载体验
4. 使用防抖处理搜索输入

## 注意事项

- 确保已安装 `framer-motion` 依赖
- 确保 Tailwind CSS 已正确配置
- 审核操作建议添加二次确认
- 重要操作记录审计日志

## 技术支持

如有问题，请查看：
- README.md - 完整文档
- 组件源码注释
- 设计系统配置文件
