# AIIMAGE V2 - PC端新版

> 全新设计的AI图片生成平台前端

---

## 📁 项目结构

```
frontend/v2/
├── index.html              # 主页面（待用户提供）
├── css/
│   ├── main.css           # 主样式文件
│   └── components/        # 组件样式（按需创建）
├── js/
│   ├── app.js             # 主入口
│   ├── modules/           # 功能模块（按需创建）
│   │   ├── AuthManager.js
│   │   ├── ImageGenerator.js
│   │   └── HistoryManager.js
│   └── utils/             # 工具函数（按需创建）
│       ├── api.js
│       └── helpers.js
├── assets/                 # 静态资源
└── docs/                   # 项目文档
    ├── PROJECT_PLAN.md         # 项目规划
    ├── API_SPECIFICATION.md    # API规格说明
    ├── FEATURE_CHECKLIST.md    # 功能清单（162项）
    ├── FRONTEND_INTEGRATION_GUIDE.md
    └── DEVELOPMENT_LOG.md      # 开发日志
```

---

## 🎯 核心原则

### 1. 完全独立
- 新版与旧版代码完全隔离
- 使用独立的目录 (`v2/`)
- CSS使用 `.v2-` 前缀避免冲突

### 2. 数据共享
- 通过后端API共享数据
- 共享 localStorage Token（`auth_token`）
- 共享数据库（users, tasks, images）

### 3. 不影响旧版
- 不修改现有后端API
- 不修改数据库结构（只增不改）
- 旧版功能保持100%可用

---

## 🚀 快速开始

### 访问地址
- **开发环境**: `http://localhost:6001/v2/`
- **生产环境**: `https://img.jibenlizi.net/v2/`

### 本地预览
```bash
# 在项目根目录
cd /root/AIIMAGE

# 如果服务器在运行，直接访问
# http://localhost:6001/v2/
```

---

## 📚 开发指南

### 第一步：提供HTML
用户提供完整的HTML代码，替换 `index.html`

### 第二步：实现交互
1. 创建CSS样式（参考设计稿）
2. 实现JS交互效果
3. 确保基础功能可用（无后端）

### 第三步：接入API
参考文档：
- `docs/API_SPECIFICATION.md` - 10个核心API
- `docs/FEATURE_CHECKLIST.md` - 162项功能清单

### 第四步：优化细节
- 样式调整
- 性能优化
- 错误处理

---

## 🔗 后端API共享

### 认证系统
```javascript
// 登录（共享）
POST /auth/token

// 注册（共享）
POST /auth/register

// 获取用户信息（共享）
GET /users/me
```

### 图片生成
```javascript
// 文生图（共享）
POST /run/generate_image/google_gemini_image_rest

// 图生图（共享）
POST /run/edit_image/google_gemini_image_rest

// 提示词优化（共享）
POST /api/optimize-prompt
```

### 历史记录
```javascript
// 获取历史（共享）
GET /users/me/tasks?lite=1

// 任务详情（共享）
GET /users/me/tasks/{task_id}

// 删除任务（共享）
DELETE /users/me/tasks/{task_id}
```

---

## 💾 数据共享机制

### localStorage
```javascript
// Token（共享）
localStorage.getItem('auth_token')

// 其他数据使用独立key避免冲突
localStorage.setItem('v2_cache_xxx', data)  // 新版
localStorage.setItem('v1_cache_xxx', data)  // 旧版
```

### 数据库
- 共享 `users` 表（用户信息、粒子币）
- 共享 `tasks` 表（历史记录）
- 共享 `images` 表（图片数据）

---

## ⚠️ 重要规范

### CSS命名
```css
/* ✅ 正确 - 使用 v2- 前缀 */
.v2-header { }
.v2-button { }
.v2-card { }

/* ❌ 错误 - 可能与旧版冲突 */
.header { }
.button { }
.card { }
```

### JS模块
```javascript
// ✅ 正确 - ES6 Modules
import AuthManager from './modules/AuthManager.js';

// ✅ 正确 - 类名大写开头
class ImageGenerator { }

// ✅ 正确 - 函数驼峰命名
function fetchUserInfo() { }
```

### API调用
```javascript
// ✅ 正确 - 使用现有接口
fetch('/users/me', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

// ❌ 错误 - 不要自己创建新接口（除非必要）
fetch('/api/v2/users/me')  // 不推荐
```

---

## 📊 开发进度

### 当前状态
- [x] 项目结构创建
- [x] 文档准备完成
- [x] 备份完成
- [ ] 等待HTML代码
- [ ] 实现基础交互
- [ ] 接入后端API
- [ ] 样式优化

### 预计时间
- **总计**: 4.5-7.5天
- **当前阶段**: 阶段1（前端框架）
- **进度**: 10%

---

## 📝 相关文档

### 必读文档
1. **PROJECT_PLAN.md** - 完整的项目规划
2. **API_SPECIFICATION.md** - API接口详细说明
3. **FEATURE_CHECKLIST.md** - 功能对照清单

### 参考文档
4. **FRONTEND_INTEGRATION_GUIDE.md** - 前端接入指南
5. **DEVELOPMENT_LOG.md** - 开发日志

---

## 🔧 调试工具

### 检查文件结构
```bash
tree /root/AIIMAGE/frontend/v2 -L 3
```

### 查看文档
```bash
cd /root/AIIMAGE/frontend/v2/docs
ls -lh
```

### 备份位置
```bash
ls -lh /root/AIIMAGE/backups/
# backup_v2_init_20251114_051203.tar.gz
```

---

## ❓ 常见问题

### Q: 新旧版会冲突吗？
A: 不会。新版使用独立目录和CSS前缀，完全隔离。

### Q: 数据如何共享？
A: 通过后端API和localStorage的Token共享。

### Q: 能同时运行吗？
A: 可以。两个版本互不影响，可同时打开使用。

### Q: 如何回滚？
A: 删除 `v2/` 目录即可，或使用备份恢复。

---

## 🎯 下一步

**等待**: 用户提供完整的HTML代码

**准备好后**:
1. 替换 `index.html`
2. 创建对应的CSS文件
3. 实现交互效果
4. 接入后端API

---

**项目状态**: 🚀 已初始化，等待开发
**维护者**: AI Assistant
**创建时间**: 2025-11-14
