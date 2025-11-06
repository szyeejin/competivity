# Flask 后端启动指南

## 📋 项目说明

这是一个使用 Flask 框架开发的竞赛报名辅助系统后端 API，提供完整的用户管理和赛事管理功能。

## 🛠️ 技术栈

- **后端框架**: Flask 2.3.3
- **数据库**: MySQL
- **跨域支持**: Flask-CORS
- **密码加密**: bcrypt
- **数据库驱动**: PyMySQL

## 📦 环境准备

### 1. Python 环境
确保已安装 Python 3.7 或更高版本：
```bash
python --version
```

### 2. 安装依赖
在 `backend` 目录下执行：
```bash
pip install -r requirements.txt
```

### 3. MySQL 数据库
确保 MySQL 服务正在运行，配置信息在 `database.py` 中：
```python
DB_CONFIG = {
    'host': 'localhost',
    'user': 'root',
    'password': 'syj17771493975',  # 请修改为您的密码
    'port': 3305,                   # 请修改为您的端口
    'charset': 'utf8mb4',
}
```

## 🚀 启动服务器

### 方式一：直接运行
在 `backend` 目录下执行：
```bash
python app.py
```

### 方式二：使用 Flask CLI
```bash
flask run --host=0.0.0.0 --port=5000
```

启动成功后，服务器将在 `http://localhost:5000` 运行。

## 📡 API 接口文档

### 用户管理

#### 1. 用户注册
- **接口**: `POST /api/register`
- **说明**: 注册新用户
- **请求体**:
```json
{
  "username": "张三",
  "email": "zhangsan@example.com",
  "password": "password123",
  "school": "某某大学",
  "studentId": "2021001",
  "phone": "13800138000"
}
```
- **响应**:
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

#### 2. 用户登录
- **接口**: `POST /api/login`
- **说明**: 用户登录验证
- **请求体**:
```json
{
  "email": "zhangsan@example.com",
  "password": "password123"
}
```
- **响应**:
```json
{
  "success": true,
  "message": "登录成功",
  "data": {
    "userId": 1,
    "username": "张三",
    "email": "zhangsan@example.com",
    "school": "某某大学",
    "studentId": "2021001",
    "phone": "13800138000"
  }
}
```

### 赛事管理

#### 3. 创建赛事
- **接口**: `POST /api/contests`
- **说明**: 创建新的赛事
- **请求体**:
```json
{
  "basicInfo": {
    "name": "编程竞赛",
    "type": "学科竞赛",
    "timeAndPlace": {
      "startDate": "2024-01-01T09:00:00",
      "endDate": "2024-01-01T18:00:00",
      "registrationStart": "2023-12-01T00:00:00",
      "registrationEnd": "2023-12-31T23:59:59",
      "location": "计算机楼A101",
      "onlineMode": false
    },
    "incentives": {
      "firstPrize": "5000元",
      "secondPrize": "3000元",
      "thirdPrize": "1000元",
      "certificate": true,
      "scholarship": "获奖者加综测分"
    },
    "rules": "比赛规则详细说明..."
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
        "facilities": ["投影仪", "空调", "音响"]
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
- **响应**:
```json
{
  "success": true,
  "message": "赛事创建成功",
  "contestId": 1
}
```

#### 4. 获取赛事列表
- **接口**: `GET /api/contests`
- **说明**: 获取所有赛事列表
- **响应**:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "编程竞赛",
      "type": "学科竞赛",
      "status": "draft",
      "created_at": "2024-01-01T00:00:00"
      // ... 其他字段
    }
  ]
}
```

#### 5. 获取赛事详情
- **接口**: `GET /api/contests/<id>`
- **说明**: 获取指定赛事的详细信息
- **响应**:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "编程竞赛",
    "budget": [...],
    "venues": [...],
    "personnel": [...],
    "equipment": [...],
    "materials": [...]
  }
}
```

### 系统测试

#### 6. 健康检查
- **接口**: `GET /api/health`
- **说明**: 检查服务是否正常运行

#### 7. 测试接口
- **接口**: `GET /api/test`
- **说明**: 测试 API 连接

## 📊 数据库表结构

系统会自动创建以下表：

1. **users** - 用户表
2. **contests** - 赛事基础信息表
3. **contest_budget** - 赛事预算表
4. **contest_venues** - 赛事场地表
5. **contest_personnel** - 赛事人员表
6. **contest_equipment** - 赛事设备表
7. **contest_materials** - 赛事物资表

## 🔧 配置说明

### 修改数据库配置
编辑 `database.py` 文件中的 `DB_CONFIG`：
```python
DB_CONFIG = {
    'host': 'localhost',      # 数据库主机
    'user': 'root',           # 数据库用户名
    'password': 'your_password',  # 数据库密码
    'port': 3306,             # 数据库端口
    'charset': 'utf8mb4',
}
```

### 修改服务器端口
编辑 `app.py` 最后一行：
```python
app.run(host='0.0.0.0', port=5000, debug=True)  # 修改 port 参数
```

## 🐛 常见问题

### 1. 数据库连接失败
- 检查 MySQL 服务是否启动
- 确认数据库配置信息是否正确
- 检查防火墙设置

### 2. 端口被占用
```bash
# Windows 查看占用端口的进程
netstat -ano | findstr :5000
# 杀掉进程
taskkill /PID <进程ID> /F
```

### 3. 依赖安装失败
尝试使用国内镜像源：
```bash
pip install -r requirements.txt -i https://pypi.tuna.tsinghua.edu.cn/simple
```

## 📝 开发说明

### 添加新的 API 接口
在 `app.py` 中添加新的路由：
```python
@app.route('/api/your-endpoint', methods=['GET', 'POST'])
def your_function():
    # 处理逻辑
    return jsonify({'success': True, 'data': ...})
```

### 数据库操作示例
```python
connection = get_connection()
cursor = connection.cursor()
cursor.execute("SELECT * FROM users")
result = cursor.fetchall()
cursor.close()
connection.close()
```

## 📞 技术支持

如有问题，请检查：
1. 后端日志输出
2. 数据库连接状态
3. 网络防火墙设置

## 📄 许可证

本项目仅供学习使用。
