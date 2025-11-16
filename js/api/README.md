# V2 API 模块说明

## 📁 文件结构

```
frontend/v2/js/api/
├── index.js      # 统一导出
├── config.js     # API配置
├── client.js     # HTTP客户端基类
├── auth.js       # 认证服务
├── image.js      # 图片生成服务
└── history.js    # 历史记录服务
```

## 🚀 使用方法

### 1. 认证服务

```javascript
import { authService } from './api/index.js';

// 登录
const result = await authService.login('username', 'password');
// Token自动保存到localStorage

// 注册
await authService.register('username', 'password', 'email@example.com');

// 获取当前用户
const user = await authService.getCurrentUser();
console.log(user.particles); // 粒子币余额

// 检查是否登录
if (authService.isLoggedIn()) {
    // 已登录
}

// 登出
authService.logout();
```

### 2. 图片生成服务

```javascript
import { imageService } from './api/index.js';

// V2智能模式生成（推荐）
const result = await imageService.generate({
    prompt: '一只可爱的猫咪',
    uploadedImages: uploadedImagesMap, // Map对象
    count: 4,
    aspectRatio: '1:1',
    seriesMode: false
});
// 自动检测模式：无图=文生图，单图=图生图，多图/系列=系列图

// 纯文生图
const result = await imageService.textToImage({
    prompt: '一只可爱的猫咪',
    count: 4,
    aspectRatio: '1:1'
});

// 图生图
const result = await imageService.imageToImage({
    prompt: '将这只猫变成卡通风格',
    images: [file1, file2], // File对象数组
    count: 2,
    aspectRatio: '16:9'
});
```

### 3. 历史记录服务

```javascript
import { historyService } from './api/index.js';

// 获取任务列表（Lite模式，只有元数据）
const { tasks } = await historyService.getTasks(8);

// 获取任务详情（带1张缩略图）
const detail = await historyService.getTaskDetail(taskId, 1, false);

// 加载任务的全部原图
const fullDetail = await historyService.loadFullImages(taskId);

// 删除任务
await historyService.deleteTask(taskId);
```

## ⚙️ 配置

所有配置在 `config.js` 中：

```javascript
export const API_CONFIG = {
    BASE_URL: '',                        // 同域相对路径
    ADAPTER_ID: 'google_gemini_image_rest',
    TOKEN_KEY: 'auth_token',             // 与旧版共享token

    ENDPOINTS: {
        LOGIN: '/auth/token',
        REGISTER: '/auth/register',
        // ...
    },

    DEFAULTS: {
        IMAGE_COUNT: 1,
        ASPECT_RATIO: '1:1',
        TASK_LIMIT: 8
    }
};
```

## 🔒 Token管理

- Token存储在 `localStorage` 的 `auth_token` key中
- **与旧版共享同一个token**，实现无缝切换
- 401错误时自动清除token
- 所有需要认证的请求自动携带token

## 🎯 V2智能模式

```javascript
// 智能模式会根据上传的图片数量自动选择：
// - 0张图 → 文生图 (text-to-image)
// - 1张图 → 图生图 (image-to-image)
// - 多张图 或 开启系列图 → 系列图 (series)

const mode = imageService.detectMode(uploadedImages, seriesMode);
```

## 💰 粒子币处理

- 未登录：可以生成但不扣费、不保存历史
- 已登录：自动扣费（1币/张）
- 余额不足：抛出402错误
- 生成失败：后端自动退款

## 🚨 错误处理

所有API调用都应该使用try-catch：

```javascript
try {
    const result = await imageService.generate(params);
    // 处理成功
} catch (error) {
    // error.message 包含友好的错误消息
    if (error.message.includes('余额不足')) {
        // 提示用户充值
    } else if (error.message.includes('登录已过期')) {
        // 跳转登录
    }
}
```

## 📌 注意事项

1. **不修改旧版后端**：所有API都是复用现有接口
2. **Token共享**：新旧版本共享同一个token，用户体验一致
3. **渐进式加载**：历史记录先加载元数据，点击时再加载图片
4. **系列图模式**：串行调用，每次用上一次的结果作为输入
5. **错误边界**：所有API调用都要有错误处理
