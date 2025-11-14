# AIIMAGE 后端 API 完整规格说明

> **版本**: v1.0
> **更新时间**: 2025-11-14
> **用途**: 新前端接入参考文档

---

## 📋 目录

1. [认证系统 (Auth)](#1-认证系统-auth)
2. [用户管理 (Users)](#2-用户管理-users)
3. [图片生成 (Image)](#3-图片生成-image)
4. [通用说明](#4-通用说明)

---

## 1. 认证系统 (Auth)

### 1.1 用户登录

**接口**: `POST /auth/token`

**Content-Type**: `application/x-www-form-urlencoded`

**请求参数**:
```javascript
{
  username: string,  // 用户名
  password: string   // 密码
}
```

**请求示例**:
```javascript
const formData = new URLSearchParams();
formData.append('username', 'testuser');
formData.append('password', 'password123');

fetch('/auth/token', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded'
  },
  body: formData
});
```

**成功响应** (200):
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer"
}
```

**失败响应** (401):
```json
{
  "detail": "用户名或密码错误"
}
```

**前端处理**:
```javascript
// 保存token到localStorage
localStorage.setItem('auth_token', data.access_token);

// 后续请求携带token
headers: {
  'Authorization': `Bearer ${token}`
}
```

---

### 1.2 用户注册

**接口**: `POST /auth/register`

**Content-Type**: `application/json`

**请求参数**:
```json
{
  "username": "string",      // 必填，用户名
  "password": "string",      // 必填，密码
  "email": "string | null"   // 可选，邮箱
}
```

**请求示例**:
```javascript
fetch('/auth/register', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    username: 'newuser',
    password: 'password123',
    email: 'user@example.com'  // 可选
  })
});
```

**成功响应** (200):
```json
{
  "message": "注册成功",
  "user": {
    "id": 1,
    "username": "newuser",
    "email": "user@example.com",
    "particles": 15,        // 新用户赠送15粒子币
    "is_admin": false,
    "created_at": "2025-11-14 10:30:00"
  }
}
```

**失败响应** (400):
```json
{
  "detail": "用户名已存在"
}
```

---

## 2. 用户管理 (Users)

### 2.1 获取当前用户信息

**接口**: `GET /users/me`

**认证**: 必需 (Bearer Token)

**请求示例**:
```javascript
fetch('/users/me', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
```

**成功响应** (200):
```json
{
  "id": 1,
  "username": "testuser",
  "email": "user@example.com",
  "particles": 42,           // 当前粒子币余额
  "is_admin": false,
  "created_at": "2025-11-01 08:00:00",
  "last_login": "2025-11-14 10:30:00"
}
```

**失败响应** (401):
```json
{
  "detail": "无法验证凭据"
}
```

---

### 2.2 获取历史任务列表 (Lite模式)

**接口**: `GET /users/me/tasks?limit={limit}&lite=1`

**认证**: 必需

**查询参数**:
- `limit`: 数量限制，默认8
- `lite`: 是否只返回元数据（不含图片），默认false

**请求示例**:
```javascript
// Lite模式 - 快速加载，只包含元数据
fetch('/users/me/tasks?limit=8&lite=1', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
```

**成功响应** (200):
```json
{
  "tasks": [
    {
      "task_id": "temp_1731564123456",
      "mode": "text-to-image",        // 模式: text-to-image | image-to-image | conversation
      "prompt": "一只可爱的橙色猫咪",
      "aspect_ratio": "1:1",           // 画面比例: 1:1 | 16:9 | 9:16 | 4:3 | 3:4
      "image_count": 4,                 // 生成的图片数量
      "status": "completed",            // 状态: pending | processing | completed | partial | failed
      "created_at": "2025-11-14 10:30:00",
      "completed_at": "2025-11-14 10:31:00",
      "generated_images": null,         // lite模式下为null
      "reference_images": null          // lite模式下为null
    }
  ]
}
```

**字段说明**:

| 字段 | 类型 | 说明 |
|------|------|------|
| `task_id` | string | 任务唯一标识 |
| `mode` | string | 生成模式 |
| `prompt` | string | 用户提示词 |
| `aspect_ratio` | string | 画面比例 |
| `image_count` | number | 生成的图片总数 |
| `status` | string | 任务状态 |
| `created_at` | string | 创建时间 |
| `completed_at` | string \| null | 完成时间 |
| `generated_images` | array \| null | 生成的图片（lite模式为null） |
| `reference_images` | array \| null | 参考图片（lite模式为null） |

---

### 2.3 获取单个任务详情

**接口**: `GET /users/me/tasks/{task_id}?max_images={max_images}&full={full}`

**认证**: 必需

**路径参数**:
- `task_id`: 任务ID

**查询参数**:
- `max_images`: 限制返回的图片数量（可选）
- `full`: 是否返回原图，默认false（返回缩略图）

**请求示例**:
```javascript
// 加载1张预览图（缩略图）
fetch('/users/me/tasks/temp_1731564123456?max_images=1&full=0', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

// 加载所有图片（原图）
fetch('/users/me/tasks/temp_1731564123456?full=1', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
```

**成功响应** (200):
```json
{
  "task": {
    "task_id": "temp_1731564123456",
    "mode": "text-to-image",
    "prompt": "一只可爱的橙色猫咪",
    "aspect_ratio": "1:1",
    "image_count": 4,
    "status": "completed",
    "created_at": "2025-11-14 10:30:00",
    "completed_at": "2025-11-14 10:31:00",
    "generated_images": [
      {
        "url": "data:image/jpeg;base64,/9j/4AAQSkZJRg...",  // 图片base64或缩略图
        "thumbnail_url": "data:image/jpeg;base64,/9j/..."   // 缩略图（如果有）
      },
      {
        "url": "data:image/jpeg;base64,/9j/...",
        "thumbnail_url": "data:image/jpeg;base64,/9j/..."
      }
    ],
    "generated_images_total": 4,        // 总图片数
    "generated_images_partial": true,   // 是否是部分数据（max_images限制时）
    "reference_images": [               // 参考图片（仅图生图/系列图模式）
      "data:image/png;base64,iVBORw0KGgoAAAA..."
    ]
  }
}
```

**失败响应** (404):
```json
{
  "detail": "任务不存在"
}
```

**图片数据格式**:

| 字段 | 说明 |
|------|------|
| `url` | 图片数据（base64格式），full=0时是缩略图，full=1时是原图 |
| `thumbnail_url` | 缩略图（600x600，quality=95%） |

---

### 2.4 删除任务

**接口**: `DELETE /users/me/tasks/{task_id}`

**认证**: 必需

**请求示例**:
```javascript
fetch('/users/me/tasks/temp_1731564123456', {
  method: 'DELETE',
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
```

**成功响应** (200):
```json
{
  "success": true
}
```

**失败响应** (404):
```json
{
  "detail": "任务不存在或删除失败"
}
```

---

### 2.5 获取粒子币交易记录

**接口**: `GET /users/me/transactions`

**认证**: 必需

**请求示例**:
```javascript
fetch('/users/me/transactions', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
```

**成功响应** (200):
```json
{
  "transactions": [
    {
      "id": 1,
      "amount": -4,                      // 负数表示扣除，正数表示增加
      "transaction_type": "deduction",   // deduction | refund | reward
      "description": "生成图片(预扣) - text-to-image模式, 预计4币",
      "created_at": "2025-11-14 10:30:00"
    },
    {
      "id": 2,
      "amount": 1,
      "transaction_type": "refund",
      "description": "生成失败退款 - 预期4张，实际3张",
      "created_at": "2025-11-14 10:31:00"
    }
  ]
}
```

---

## 3. 图片生成 (Image)

### 3.1 文生图 (Text-to-Image)

**接口**: `POST /run/generate_image/{adapter_id}`

**认证**: 可选（未登录时不扣费，不保存历史）

**路径参数**:
- `adapter_id`: 固定为 `google_gemini_image_rest`

**Content-Type**: `application/json`

**请求参数**:
```json
{
  "prompt": "string",               // 必填，提示词
  "n": 1,                            // 可选，生成数量（1-4），默认1
  "size": "1:1",                     // 可选，画面比例
  "quality": "standard",             // 可选，质量配置，默认standard
  "style": null,                     // 可选，风格
  "model_params": {                  // 可选，额外参数
    "response_modalities": ["Image"],
    "aspect_ratio": "1:1",
    "mode": "text-to-image"          // 可选，模式标识
  },
  "client_task_id": "temp_1731564123456",  // 可选，前端任务ID
  "total_image_count": 4             // 可选，计划生成的总数
}
```

**请求示例**:
```javascript
fetch('/run/generate_image/google_gemini_image_rest', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`  // 可选
  },
  body: JSON.stringify({
    prompt: '一只可爱的橙色猫咪，坐在窗台上看着夕阳',
    n: 1,
    size: '1:1',
    model_params: {
      response_modalities: ['Image'],
      aspect_ratio: '1:1'
    },
    client_task_id: 'temp_1731564123456',
    total_image_count: 4
  })
});
```

**成功响应** (200):
```json
{
  "images": [
    {
      "url": "data:image/jpeg;base64,/9j/4AAQSkZJRg...",
      "thumbnail_url": "data:image/jpeg;base64,/9j/..."  // 缩略图（异步生成）
    }
  ],
  "prompt": "一只可爱的橙色猫咪，坐在窗台上看着夕阳"
}
```

**失败响应**:

| 状态码 | 说明 | 响应示例 |
|--------|------|----------|
| 402 | 粒子币余额不足 | `{"detail": "粒子币余额不足"}` |
| 404 | Adapter不存在 | `{"detail": "Adapter 'xxx' not found."}` |
| 500 | 生成失败 | `{"detail": "生成失败: ..."}` |

**粒子币扣费**:
- **计费规则**: 1币/张
- **扣费时机**: 请求发送时预扣
- **去重机制**: 同一 `client_task_id` 只扣一次
- **退款机制**: 生成失败时调用 `/api/refund-task` 退款

---

### 3.2 图生图 (Image-to-Image)

**接口**: `POST /run/edit_image/{adapter_id}`

**认证**: 可选

**路径参数**:
- `adapter_id`: 固定为 `google_gemini_image_rest`

**Content-Type**: `multipart/form-data`

**请求参数**:
```javascript
FormData {
  prompt: string,                    // 必填，提示词
  task_id: string,                   // 可选，任务ID
  image: File[],                     // 必填，参考图片文件（可多张）
  mask: File | null,                 // 可选，遮罩图片
  n: number,                         // 可选，生成数量，默认1
  size: string,                      // 可选，画面比例
  model_params: string,              // 可选，JSON字符串
  total_image_count: number          // 可选，计划生成总数
}
```

**请求示例**:
```javascript
const formData = new FormData();
formData.append('prompt', '将这只猫咪变成卡通风格');
formData.append('task_id', 'temp_1731564123456');
formData.append('image', imageFile);  // File对象
formData.append('total_image_count', '4');
formData.append('model_params', JSON.stringify({
  response_modalities: ['Image'],
  aspect_ratio: '1:1'
}));

fetch('/run/edit_image/google_gemini_image_rest', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`
  },
  body: formData
});
```

**成功响应** (200):
```json
{
  "images": [
    {
      "url": "data:image/jpeg;base64,/9j/4AAQSkZJRg...",
      "thumbnail_url": "data:image/jpeg;base64,/9j/..."
    }
  ],
  "prompt": "将这只猫咪变成卡通风格"
}
```

**失败响应**:

| 状态码 | 说明 | 响应示例 |
|--------|------|----------|
| 400 | 未提供图片 | `{"detail": "No images provided."}` |
| 402 | 粒子币余额不足 | `{"detail": "粒子币余额不足"}` |
| 500 | 生成失败 | `{"detail": "生成失败: ..."}` |

**粒子币扣费**:
- **计费规则**: 1币/张
- **扣费时机**: 请求发送时预扣
- **去重机制**: 同一 `task_id` 只扣一次

**参考图保存**:
- 后端会将上传的图片转换为base64保存到数据库
- 保存在 `task.reference_images` 字段
- 用于"再次生成"功能

---

### 3.3 系列图 (Conversation)

**接口**:
- 有参考图: `POST /run/edit_image/{adapter_id}`
- 无参考图: `POST /run/generate_image/{adapter_id}`

**认证**: 可选

**特点**:
- 固定消耗2个粒子币（无论生成多少张）
- 返回可变数量的图片（1-4张）
- 支持纯文字或图片+文字

#### 3.3.1 系列图 - 有参考图

**Content-Type**: `multipart/form-data`

**请求示例**:
```javascript
const formData = new FormData();
formData.append('prompt', '基于这张图片，生成一个系列的变体');
formData.append('task_id', 'temp_1731564123456');
formData.append('image', imageFile1);
formData.append('image', imageFile2);  // 可多张
formData.append('model_params', JSON.stringify({
  response_modalities: ['Text', 'Image'],
  mode: 'conversation'
}));

fetch('/run/edit_image/google_gemini_image_rest', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`
  },
  body: formData
});
```

#### 3.3.2 系列图 - 无参考图

**Content-Type**: `application/json`

**请求示例**:
```javascript
fetch('/run/generate_image/google_gemini_image_rest', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    prompt: '生成一组科幻主题的概念图',
    model_params: {
      response_modalities: ['Text', 'Image'],
      mode: 'conversation'
    },
    client_task_id: 'temp_1731564123456'
  })
});
```

**成功响应** (200):
```json
{
  "images": [
    {
      "url": "data:image/jpeg;base64,/9j/...",
      "description": "图片1的描述"  // 前端需要删除这个字段
    },
    {
      "url": "data:image/jpeg;base64,/9j/...",
      "description": "图片2的描述"
    },
    {
      "url": "data:image/jpeg;base64,/9j/...",
      "description": "图片3的描述"
    }
  ]
}
```

**前端处理**:
```javascript
// 删除description字段，只保留图片
data.images.forEach(img => {
  delete img.description;
});
```

**粒子币扣费**:
- **计费规则**: 固定2币
- **扣费时机**: 请求发送时预扣
- **无退款**: 系列图模式不退款

---

### 3.4 提示词优化

**接口**: `POST /api/optimize-prompt`

**认证**: 不需要

**Content-Type**: `multipart/form-data`

**请求参数**:
```javascript
FormData {
  prompt: string,           // 必填，原始提示词
  mode: string,             // 可选，模式，默认text-to-image
  aspect_ratio: string      // 可选，画面比例，默认1:1
}
```

**请求示例**:
```javascript
const formData = new FormData();
formData.append('prompt', '一只猫');
formData.append('mode', 'text-to-image');
formData.append('aspect_ratio', '1:1');

fetch('/api/optimize-prompt', {
  method: 'POST',
  body: formData
});
```

**成功响应** (200):
```json
{
  "original_prompt": "一只猫",
  "optimized_prompt": "一只优雅的橙色短毛猫，坐在阳光洒落的窗台上，柔和的光线，高清摄影，专业构图",
  "mode": "text-to-image",
  "aspect_ratio": "1:1"
}
```

**失败响应** (500):
```json
{
  "detail": "优化失败: 网络超时"
}
```

**使用场景**:
- 用户点击"强化关键词"按钮
- 后端使用Gemini优化提示词
- 前端替换原始提示词

---

### 3.5 粒子币退款

**接口**: `POST /api/refund-task`

**认证**: 必需

**Content-Type**: `multipart/form-data`

**请求参数**:
```javascript
FormData {
  task_id: string,          // 必填，任务ID
  expected_count: number,   // 必填，预期生成数量
  actual_count: number,     // 必填，实际成功数量
  mode: string              // 可选，模式，默认text-to-image
}
```

**请求示例**:
```javascript
const formData = new FormData();
formData.append('task_id', 'temp_1731564123456');
formData.append('expected_count', '4');
formData.append('actual_count', '3');  // 失败1张
formData.append('mode', 'text-to-image');

fetch('/api/refund-task', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`
  },
  body: formData
});
```

**成功响应** (200):
```json
{
  "refunded": 1,
  "message": "已退还 1 粒子币"
}
```

**系列图模式**:
```json
{
  "refunded": 0,
  "message": "系列图模式固定扣费，不退款"
}
```

**无需退款**:
```json
{
  "refunded": 0,
  "message": "无需退款"
}
```

**计算规则**:
```javascript
refund_amount = expected_count - actual_count
```

**注意事项**:
- 系列图模式固定扣2币，不退款
- 只退还失败图片的粒子币
- 退款后会更新用户余额

---

## 4. 通用说明

### 4.1 认证方式

所有需要认证的接口都使用 **Bearer Token** 方式：

```javascript
headers: {
  'Authorization': `Bearer ${token}`
}
```

Token获取方式：
1. 登录成功后从 `/auth/token` 响应中获取
2. 保存到 `localStorage`
3. 每次请求时从 `localStorage` 读取

### 4.2 错误处理

**标准错误响应格式**:
```json
{
  "detail": "错误描述信息"
}
```

**常见HTTP状态码**:

| 状态码 | 说明 | 示例 |
|--------|------|------|
| 200 | 成功 | 正常返回数据 |
| 400 | 请求参数错误 | 缺少必填字段、格式错误 |
| 401 | 未认证 | Token无效或过期 |
| 402 | 粒子币不足 | 余额不足以完成操作 |
| 404 | 资源不存在 | 任务不存在、Adapter不存在 |
| 500 | 服务器错误 | 生成失败、网络超时 |

**前端错误处理示例**:
```javascript
try {
  const response = await fetch('/api/endpoint', { ... });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.detail || '请求失败');
  }

  const data = await response.json();
  return data;

} catch (error) {
  console.error('API错误:', error.message);
  // 显示友好的错误提示
  showError(error.message);
}
```

### 4.3 图片数据格式

**Base64格式**:
```
data:image/jpeg;base64,/9j/4AAQSkZJRg...
```

**缩略图策略**:
- 尺寸: 600x600
- 质量: 95%
- 大小: ~80-120KB
- 压缩率: ~93%

**使用场景**:
- 首次生成: 返回原图
- 历史记录: 默认返回缩略图（`full=0`）
- 点击查看: 加载原图（`full=1`）

### 4.4 粒子币系统

**计费规则**:

| 模式 | 计费公式 | 说明 |
|------|----------|------|
| 文生图 | 1币/张 × 数量 | 按张计费 |
| 图生图 | 1币/张 × 数量 | 按张计费 |
| 系列图 | 固定2币 | 不论生成多少张 |

**扣费流程**:
```
1. 前端计算所需粒子币
2. 检查余额是否充足
3. 发送生成请求
4. 后端预扣粒子币（去重机制）
5. 生成图片
6. 失败时调用退款接口
7. 刷新用户余额显示
```

**去重机制**:
- 同一 `task_id` 或 `client_task_id` 只扣一次
- 避免重复请求导致重复扣费
- 代码位置: `backend/routers/image.py:48-76`

### 4.5 任务状态

| 状态 | 说明 | 显示文字 |
|------|------|----------|
| `pending` | 等待中 | "进行中" |
| `processing` | 生成中 | "进行中" |
| `completed` | 全部成功 | "成功: 4/4" |
| `partial` | 部分成功 | "部分成功: 3/4" |
| `failed` | 全部失败 | "失败" |

### 4.6 画面比例

| 值 | 说明 | 适用场景 |
|----|------|----------|
| `1:1` | 方形 | 社交媒体、头像 |
| `16:9` | 宽屏 | 桌面壁纸、横版海报 |
| `9:16` | 竖屏 | 手机壁纸、竖版海报 |
| `4:3` | 标准 | 传统照片 |
| `3:4` | 人像 | 肖像、竖版照片 |

### 4.7 生成模式

| 模式 | 值 | 说明 |
|------|---|------|
| 文生图 | `text-to-image` | 纯文本描述生成图片 |
| 图生图 | `image-to-image` | 参考图+描述生成图片 |
| 系列图 | `conversation` | 多图参考生成连贯系列 |

---

## 5. 前端接入检查清单

### 5.1 认证功能

- [ ] 登录表单 → `/auth/token`
- [ ] 注册表单 → `/auth/register`
- [ ] Token保存到 localStorage
- [ ] 登录状态检查 → `/users/me`
- [ ] 登出清理Token
- [ ] 所有请求携带Token

### 5.2 用户信息

- [ ] 获取用户信息 → `/users/me`
- [ ] 显示粒子币余额
- [ ] 刷新粒子币余额

### 5.3 历史记录

- [ ] 加载历史列表 (Lite) → `/users/me/tasks?lite=1`
- [ ] 加载任务详情 → `/users/me/tasks/{task_id}`
- [ ] 懒加载图片（Intersection Observer）
- [ ] 删除任务 → `DELETE /users/me/tasks/{task_id}`

### 5.4 图片生成

- [ ] 文生图 → `/run/generate_image/{adapter_id}`
  - [ ] 参数构建
  - [ ] 粒子币扣费检查
  - [ ] 实时流式显示
  - [ ] 失败重试
  - [ ] 退款处理

- [ ] 图生图 → `/run/edit_image/{adapter_id}`
  - [ ] FormData构建
  - [ ] 图片文件上传
  - [ ] File副本机制
  - [ ] 分批并发策略

- [ ] 系列图 → 两个接口
  - [ ] 有参考图: `/run/edit_image/{adapter_id}`
  - [ ] 无参考图: `/run/generate_image/{adapter_id}`
  - [ ] 删除description字段

### 5.5 辅助功能

- [ ] 提示词优化 → `/api/optimize-prompt`
- [ ] 粒子币退款 → `/api/refund-task`
- [ ] 再次生成（加载参考图）

### 5.6 错误处理

- [ ] 401 错误 → 跳转登录
- [ ] 402 错误 → 显示余额不足提示
- [ ] 404 错误 → 显示资源不存在
- [ ] 500 错误 → 显示友好错误信息

---

## 6. 示例代码

### 6.1 完整的文生图流程

```javascript
async function generateTextToImage(prompt, aspectRatio, count) {
  try {
    // 1. 检查登录状态
    const token = localStorage.getItem('auth_token');
    if (!token) {
      throw new Error('请先登录');
    }

    // 2. 获取用户信息，检查余额
    const userResponse = await fetch('/users/me', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const user = await userResponse.json();

    const requiredParticles = count; // 1币/张
    if (user.particles < requiredParticles) {
      throw new Error(`粒子币余额不足。当前余额：${user.particles} 币，本次生成需要：${requiredParticles} 币`);
    }

    // 3. 生成临时任务ID
    const taskId = `temp_${Date.now()}`;

    // 4. 创建pending状态的任务卡片
    createPendingTaskCard(taskId, prompt, aspectRatio, count);

    // 5. 并发生成多张图片
    const promises = [];
    for (let i = 0; i < count; i++) {
      promises.push(
        fetch('/run/generate_image/google_gemini_image_rest', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            prompt: prompt + '\u200B'.repeat(i), // 添加不可见空格避免缓存
            n: 1,
            size: aspectRatio,
            model_params: {
              response_modalities: ['Image'],
              aspect_ratio: aspectRatio
            },
            client_task_id: taskId,
            total_image_count: count
          })
        })
        .then(res => res.json())
        .then(data => {
          // 实时显示单张图片
          updateTaskCard(taskId, data.images[0]);
          return data.images[0];
        })
      );
    }

    // 6. 等待所有请求完成
    const results = await Promise.allSettled(promises);

    // 7. 统计成功和失败数量
    const successImages = results
      .filter(r => r.status === 'fulfilled')
      .map(r => r.value);
    const failedCount = results.filter(r => r.status === 'rejected').length;

    // 8. 退款处理（如果有失败）
    if (failedCount > 0) {
      const formData = new FormData();
      formData.append('task_id', taskId);
      formData.append('expected_count', count);
      formData.append('actual_count', successImages.length);
      formData.append('mode', 'text-to-image');

      await fetch('/api/refund-task', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });
    }

    // 9. 更新最终状态
    const status = failedCount > 0 ? 'partial' : 'completed';
    updateTaskStatus(taskId, status, successImages);

    // 10. 刷新粒子币余额
    refreshParticles();

  } catch (error) {
    console.error('生成失败:', error);
    showError(error.message);
  }
}
```

### 6.2 完整的图生图流程

```javascript
async function generateImageToImage(prompt, uploadedImages, aspectRatio, count) {
  try {
    const token = localStorage.getItem('auth_token');
    if (!token) throw new Error('请先登录');

    // 检查余额
    const userResponse = await fetch('/users/me', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const user = await userResponse.json();

    if (user.particles < count) {
      throw new Error(`粒子币余额不足`);
    }

    const taskId = `temp_${Date.now()}`;

    // 预创建File副本（避免并发冲突）
    const filesCopiesForRequests = [];
    for (let i = 0; i < count; i++) {
      const copies = uploadedImages.map(imgData => {
        const blobCopy = imgData.file.slice(0, imgData.file.size, imgData.file.type);
        return new File([blobCopy], imgData.file.name, { type: imgData.file.type });
      });
      filesCopiesForRequests.push(copies);
    }

    // 提取参考图base64（用于保存）
    const referenceImages = uploadedImages.map(img => img.dataUrl);

    createPendingTaskCard(taskId, prompt, aspectRatio, count, referenceImages);

    // 并发生成
    const promises = [];
    for (let i = 0; i < count; i++) {
      const formData = new FormData();
      formData.append('prompt', prompt);
      formData.append('task_id', taskId);
      formData.append('total_image_count', count);

      // 添加参考图片
      filesCopiesForRequests[i].forEach(fileCopy => {
        formData.append('image', fileCopy);
      });

      formData.append('model_params', JSON.stringify({
        response_modalities: ['Image'],
        aspect_ratio: aspectRatio
      }));

      promises.push(
        fetch('/run/edit_image/google_gemini_image_rest', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` },
          body: formData
        })
        .then(res => res.json())
        .then(data => {
          updateTaskCard(taskId, data.images[0]);
          return data.images[0];
        })
      );
    }

    const results = await Promise.allSettled(promises);

    // 统计和退款（同文生图）
    // ...

  } catch (error) {
    console.error('生成失败:', error);
    showError(error.message);
  }
}
```

---

## 附录：Adapter ID

当前系统使用的Adapter ID固定为：

```
google_gemini_image_rest
```

所有图片生成接口的路径参数 `{adapter_id}` 都应使用此值。

---

**文档维护者**: AI Assistant
**最后更新**: 2025-11-14
**用途**: 新前端接入参考

如有疑问，请参考实际代码：
- 后端: `/root/AIIMAGE/backend/routers/`
- 前端: `/root/AIIMAGE/frontend/static/js/`
