# API 测试指南 🧪

本文档提供所有 API 接口的测试方法和示例。

## 📡 测试工具推荐

1. **Postman** - 图形化 API 测试工具
2. **curl** - 命令行工具
3. **浏览器开发者工具** - F12 Console

## 🔐 用户管理 API

### 1. 用户注册
```bash
# URL
POST http://localhost:5000/api/register

# 请求体
{
  "username": "张三",
  "email": "zhangsan@example.com",
  "password": "password123",
  "school": "某某大学",
  "studentId": "2024001",
  "phone": "13800138000"
}

# curl 命令
curl -X POST http://localhost:5000/api/register \
  -H "Content-Type: application/json" \
  -d '{"username":"张三","email":"zhangsan@example.com","password":"password123","school":"某某大学","studentId":"2024001","phone":"13800138000"}'
```

**预期响应**:
```json
{
  "success": true,
  "message": "注册成功",
  "data": {
    "userId": 1,
    "username": "张三",
    "email": "zhangsan@example.com"
  }
}
```

### 2. 用户登录
```bash
# URL
POST http://localhost:5000/api/login

# 请求体
{
  "email": "zhangsan@example.com",
  "password": "password123"
}

# curl 命令
curl -X POST http://localhost:5000/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"zhangsan@example.com","password":"password123"}'
```

## 🏆 赛事管理 API

### 3. 创建赛事
```bash
# URL
POST http://localhost:5000/api/contests

# 请求体（完整示例）
{
  "basicInfo": {
    "name": "编程竞赛2024",
    "type": "学科竞赛",
    "timeAndPlace": {
      "startDate": "2024-12-01T09:00:00",
      "endDate": "2024-12-01T18:00:00",
      "registrationStart": "2024-11-01T00:00:00",
      "registrationEnd": "2024-11-30T23:59:59",
      "location": "计算机楼A101",
      "onlineMode": false
    },
    "incentives": {
      "firstPrize": "5000元",
      "secondPrize": "3000元",
      "thirdPrize": "1000元",
      "certificate": true,
      "scholarship": "加综测分"
    },
    "rules": "比赛规则说明..."
  },
  "resourceConfig": {
    "budget": {
      "total": 10000,
      "categories": [
        {"name": "场地费", "amount": 2000},
        {"name": "奖品费", "amount": 5000}
      ]
    },
    "venue": [
      {
        "name": "A101教室",
        "capacity": 100,
        "address": "计算机楼1层",
        "facilities": ["投影仪", "空调"]
      }
    ],
    "personnel": {
      "organizers": [{"name": "张老师", "contact": "13800138001"}],
      "judges": [{"name": "李老师", "contact": "13800138002"}],
      "volunteers": [{"name": "小王", "contact": "13800138003"}]
    },
    "equipment": [
      {"name": "笔记本电脑", "quantity": 10, "status": "available"}
    ],
    "materials": [
      {"name": "参赛证", "quantity": "100", "unit": "张"}
    ]
  }
}
```

### 4. 获取赛事列表
```bash
# URL
GET http://localhost:5000/api/contests

# curl 命令
curl http://localhost:5000/api/contests
```

### 5. 获取赛事详情
```bash
# URL
GET http://localhost:5000/api/contests/1

# curl 命令
curl http://localhost:5000/api/contests/1
```

## ✅ 审核管理 API

### 6. 审核赛事（通过）
```bash
# URL
POST http://localhost:5000/api/contests/1/review

# 请求体
{
  "reviewerName": "审核员A",
  "result": "approved",
  "comment": "赛事计划完善，批准举办",
  "complianceCheck": true,
  "budgetCheck": true,
  "resourceCheck": true
}

# curl 命令
curl -X POST http://localhost:5000/api/contests/1/review \
  -H "Content-Type: application/json" \
  -d '{"reviewerName":"审核员A","result":"approved","comment":"赛事计划完善，批准举办"}'
```

### 7. 审核赛事（驳回）
```bash
# URL
POST http://localhost:5000/api/contests/1/review

# 请求体
{
  "reviewerName": "审核员B",
  "result": "rejected",
  "comment": "预算不合理，请重新规划",
  "complianceCheck": true,
  "budgetCheck": false,
  "resourceCheck": true
}
```

### 8. 获取审核记录
```bash
# URL
GET http://localhost:5000/api/reviews

# 带参数（按状态筛选）
GET http://localhost:5000/api/reviews?status=approved

# curl 命令
curl http://localhost:5000/api/reviews
curl http://localhost:5000/api/reviews?status=approved
```

### 9. 获取审核统计
```bash
# URL
GET http://localhost:5000/api/reviews/stats

# curl 命令
curl http://localhost:5000/api/reviews/stats
```

**预期响应**:
```json
{
  "success": true,
  "data": {
    "total": 10,
    "pending": 3,
    "approved": 5,
    "rejected": 2,
    "conflicts": 1
  }
}
```

## ⚠️ 冲突检测 API

### 10. 自动检测冲突
```bash
# URL
POST http://localhost:5000/api/contests/1/detect-conflicts

# 无需请求体
# curl 命令
curl -X POST http://localhost:5000/api/contests/1/detect-conflicts
```

**预期响应**:
```json
{
  "success": true,
  "message": "冲突检测完成，发现 2 个冲突",
  "data": {
    "total_conflicts": 2,
    "conflicts": [
      {
        "type": "time",
        "with_id": 2,
        "with_name": "ACM竞赛",
        "description": "与赛事《ACM竞赛》时间冲突",
        "severity": "high"
      },
      {
        "type": "venue",
        "with_id": 3,
        "with_name": "数学建模",
        "description": "场地《A101教室》与赛事《数学建模》冲突",
        "severity": "high"
      }
    ]
  }
}
```

### 11. 获取冲突列表
```bash
# URL
GET http://localhost:5000/api/contests/1/conflicts

# curl 命令
curl http://localhost:5000/api/contests/1/conflicts
```

### 12. 解决冲突
```bash
# URL
POST http://localhost:5000/api/conflicts/1/resolve

# 请求体
{
  "resolution": "已协调更改赛事时间，冲突已解决"
}

# curl 命令
curl -X POST http://localhost:5000/api/conflicts/1/resolve \
  -H "Content-Type: application/json" \
  -d '{"resolution":"已协调更改赛事时间，冲突已解决"}'
```

## 📨 通知管理 API

### 13. 获取通知列表
```bash
# URL
GET http://localhost:5000/api/notifications

# 带参数
GET http://localhost:5000/api/notifications?recipient=张三&is_read=0

# curl 命令
curl http://localhost:5000/api/notifications
curl "http://localhost:5000/api/notifications?recipient=张三&is_read=0"
```

## 🔧 系统 API

### 14. 健康检查
```bash
# URL
GET http://localhost:5000/api/health

# curl 命令
curl http://localhost:5000/api/health
```

**预期响应**:
```json
{
  "status": "ok",
  "message": "服务运行正常"
}
```

### 15. 测试接口
```bash
# URL
GET http://localhost:5000/api/test

# curl 命令
curl http://localhost:5000/api/test
```

## 🎯 完整测试流程

### 场景1: 创建赛事并审核通过

```bash
# 1. 创建赛事
curl -X POST http://localhost:5000/api/contests \
  -H "Content-Type: application/json" \
  -d @contest_data.json

# 2. 检测冲突
curl -X POST http://localhost:5000/api/contests/1/detect-conflicts

# 3. 查看冲突
curl http://localhost:5000/api/contests/1/conflicts

# 4. 审核通过
curl -X POST http://localhost:5000/api/contests/1/review \
  -H "Content-Type: application/json" \
  -d '{"result":"approved","comment":"通过审核"}'

# 5. 查看审核记录
curl http://localhost:5000/api/reviews
```

### 场景2: 冲突检测和解决

```bash
# 1. 创建第一个赛事
curl -X POST http://localhost:5000/api/contests \
  -H "Content-Type: application/json" \
  -d '{"basicInfo":{"name":"赛事A","type":"学科竞赛","timeAndPlace":{"startDate":"2024-12-01T09:00:00","endDate":"2024-12-01T18:00:00"}},"resourceConfig":{"budget":{},"venue":[],"personnel":{"organizers":[],"judges":[],"volunteers":[]},"equipment":[],"materials":[]}}'

# 2. 创建第二个赛事（时间冲突）
curl -X POST http://localhost:5000/api/contests \
  -H "Content-Type: application/json" \
  -d '{"basicInfo":{"name":"赛事B","type":"学科竞赛","timeAndPlace":{"startDate":"2024-12-01T10:00:00","endDate":"2024-12-01T17:00:00"}},"resourceConfig":{"budget":{},"venue":[],"personnel":{"organizers":[],"judges":[],"volunteers":[]},"equipment":[],"materials":[]}}'

# 3. 检测第二个赛事的冲突
curl -X POST http://localhost:5000/api/contests/2/detect-conflicts

# 4. 查看冲突详情
curl http://localhost:5000/api/contests/2/conflicts

# 5. 解决冲突
curl -X POST http://localhost:5000/api/conflicts/1/resolve \
  -H "Content-Type: application/json" \
  -d '{"resolution":"已调整赛事B的时间"}'
```

## 🐛 错误处理

### 常见错误响应

#### 1. 数据库连接失败
```json
{
  "success": false,
  "message": "数据库连接失败"
}
```

#### 2. 参数错误
```json
{
  "success": false,
  "message": "所有字段都是必填的"
}
```

#### 3. 资源不存在
```json
{
  "success": false,
  "message": "赛事不存在"
}
```

#### 4. 审核结果错误
```json
{
  "success": false,
  "message": "审核结果必须是 approved 或 rejected"
}
```

## 📊 Postman 集合

如果使用 Postman，可以按以下步骤导入：

1. 打开 Postman
2. 点击 "Import"
3. 选择 "Raw Text"
4. 复制下面的 JSON（需要手动创建）
5. 导入后即可直接测试所有接口

## 💡 测试技巧

### 1. 使用环境变量
在 Postman 中设置环境变量：
- `base_url`: http://localhost:5000
- `contest_id`: 1
- `user_email`: test@example.com

### 2. 保存响应数据
```javascript
// Postman 测试脚本
pm.test("Status is 200", function () {
    pm.response.to.have.status(200);
});

// 保存 contest_id
var jsonData = pm.response.json();
pm.environment.set("contest_id", jsonData.contestId);
```

### 3. 批量测试
```bash
# 创建测试脚本 test_all.sh
#!/bin/bash

echo "1. 测试健康检查..."
curl http://localhost:5000/api/health

echo "\n2. 创建赛事..."
curl -X POST http://localhost:5000/api/contests \
  -H "Content-Type: application/json" \
  -d @contest_data.json

echo "\n3. 获取赛事列表..."
curl http://localhost:5000/api/contests

echo "\n测试完成！"
```

## 📝 测试清单

使用此清单确保所有功能正常：

- [ ] 用户注册
- [ ] 用户登录
- [ ] 创建赛事
- [ ] 获取赛事列表
- [ ] 获取赛事详情
- [ ] 审核通过赛事
- [ ] 审核驳回赛事
- [ ] 获取审核记录
- [ ] 获取审核统计
- [ ] 检测赛事冲突
- [ ] 获取冲突列表
- [ ] 解决冲突
- [ ] 获取通知列表
- [ ] 健康检查

---

**祝测试顺利！🎉**
