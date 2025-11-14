# V2 架构重构方案

## 📊 现状分析

### index.html 内联代码结构 (~1800行)

当前所有应用逻辑都在 `index.html` 的 `<script>` 标签中（第371-2170行），包括：

#### 1. 历史记录 & 懒加载系统 (~150行)
**全局函数：**
- `window.showSkeletonCards(count)` - 显示骨架屏
- `window.clearSkeletonCards()` - 清除骨架屏
- `window.renderHistoryTasksLite(tasks)` - 渲染任务卡片（lite模式）
- `window.initHistoryLazyLoad()` - 初始化Intersection Observer

**状态：**
```javascript
window.historyLoadingState = {
    loadedTaskIds: new Set(),
    loadingTaskIds: new Set(),
    observer: null,
    maxConcurrent: 2,
    activeLoads: 0
};
```

#### 2. 图片查看器系统 (~100行)
**全局函数：**
- `window.openImageViewer(imageSrc, options)` - 打开查看器
- `window.updateImageViewer(newImageSrc)` - 更新图片（加载原图）
- `window.closeImageViewer()` - 关闭查看器
- `window.openImageWithOriginal(taskId, imageIndex, thumbnailUrl)` - 懒加载原图
- `window.downloadViewerImage()` - 下载当前图片

#### 3. 图片上传管理 (~200行)
**功能：**
- 主图上传（文本生图 / 系列图模式）
- 图标上传（图生图模式）
- 动态添加/删除上传行（最多3行 x 2张 = 6张附加图）
- 文件验证（格式、大小）

**状态问题（需优化）：**
```javascript
const uploadedImages = new Map();    // 存储所有上传的图片
const slotImageMap = new Map();      // 冗余！记录slot -> imageId映射
```

#### 4. 图片生成系统 (~300行)
**功能：**
- 生成按钮处理（3种模式：text-to-image / image-to-image / series）
- 提示词优化按钮
- 实时进度回调（onProgress）
- 结果渲染（流式显示 / 一次性返回）

#### 5. UI交互管理 (~200行)
**功能：**
- 暗黑模式切换
- 系列图模式切换（禁用尺寸/数量选择）
- 尺寸比例选择（1:1 / 9:16 / 16:9 / 3:4 / 4:3）
- 图片数量选择（1-4张）
- 侧边栏交互（展开/收起）
- 任务卡片操作（复制、删除、重新生成）

#### 6. 认证UI管理 (~150行)
**功能：**
- 登录/注册弹窗开关
- 表单切换（登录 ↔ 注册）
- 表单提交处理
- 用户头像点击（登出确认）

#### 7. 工具函数 & 其他 (~700行)
- Toast辅助函数（`showSuccess`, `showError`, `showWarning`, `showInfo`）
- 图片URL解析（`parseImageUrl`）
- 暗黑模式初始化
- 大量事件监听器绑定
- DOMContentLoaded初始化逻辑

---

## 🎯 重构目标

### 1. 关注点分离
- **API逻辑** → 已在 `/v2/js/api/` 中（✅ 完成）
- **DOM操作** → 拆分到独立模块
- **状态管理** → 单一数据源
- **事件处理** → 集中管理

### 2. 模块化设计
```
/v2/js/
├── api/                    # ✅ 已完成
│   ├── client.js
│   ├── auth.js
│   ├── image.js
│   └── history.js
├── modules/                # 🚧 待创建
│   ├── HistoryRenderer.js  # 历史记录渲染
│   ├── ImageViewer.js      # 图片查看器
│   ├── UploadManager.js    # 上传管理
│   ├── GeneratorUI.js      # 生成界面
│   └── AuthUI.js           # 认证界面
├── utils/                  # ✅ 部分完成
│   ├── toast.js            # ✅ 已有
│   ├── confirm.js          # ✅ 已有
│   ├── dom.js              # 🆕 DOM辅助函数
│   └── helpers.js          # 🆕 通用工具
└── app.js                  # ✅ 主入口（需扩展）
```

### 3. 状态管理优化
**问题：** `uploadedImages` 和 `slotImageMap` 数据重复

**方案：** 
```javascript
// 单一数据源
const uploadState = {
    files: new Map(),           // fileId -> File对象
    slots: {                     // slot分配
        main: null,              // 主图fileId
        icon: null,              // 图标fileId
        additional: []           // 附加图fileId数组
    }
};
```

---

## 📋 实施计划

### Phase 2.1: 创建 HistoryRenderer.js
**职责：**
- 骨架屏管理
- 任务卡片渲染
- 懒加载逻辑
- Intersection Observer管理

**接口：**
```javascript
class HistoryRenderer {
    showSkeletons(count)
    clearSkeletons()
    renderTasks(tasks)
    initLazyLoad()
    loadTaskImages(taskId)
}
```

### Phase 2.2: 创建 ImageViewer.js
**职责：**
- 查看器UI控制
- 原图懒加载
- 键盘导航
- 下载功能

**接口：**
```javascript
class ImageViewer {
    open(imageSrc, options)
    close()
    updateImage(newSrc)
    download()
}
```

### Phase 2.3: 创建 UploadManager.js
**职责：**
- 文件上传处理
- 动态行管理
- 预览生成
- 状态管理（单一数据源）

**接口：**
```javascript
class UploadManager {
    uploadFile(file, slot)
    removeFile(fileId)
    getFiles()
    clear()
}
```

### Phase 2.4: 创建 GeneratorUI.js
**职责：**
- 生成按钮逻辑
- 参数收集
- 进度显示
- 结果渲染

**接口：**
```javascript
class GeneratorUI {
    handleGenerate()
    handleOptimize()
    onProgress(data)
    renderResults(images)
}
```

### Phase 2.5: 创建 AuthUI.js
**职责：**
- 认证弹窗控制
- 表单验证
- 登录/注册切换

**接口：**
```javascript
class AuthUI {
    openModal(tab)
    closeModal()
    switchTab(tab)
    handleLogin(username, password)
    handleRegister(username, password, email)
}
```

### Phase 2.6: 创建工具模块
**dom.js** - DOM操作辅助
```javascript
export const DOM = {
    qs: (selector) => document.querySelector(selector),
    qsa: (selector) => document.querySelectorAll(selector),
    create: (tag, className, innerHTML) => { ... },
    ...
};
```

**helpers.js** - 通用工具
```javascript
export function parseImageUrl(url) { ... }
export function formatDate(timestamp) { ... }
export function debounce(fn, delay) { ... }
```

### Phase 2.7: 整合到 app.js
```javascript
import HistoryRenderer from './modules/HistoryRenderer.js';
import ImageViewer from './modules/ImageViewer.js';
import UploadManager from './modules/UploadManager.js';
import GeneratorUI from './modules/GeneratorUI.js';
import AuthUI from './modules/AuthUI.js';

window.V2App = {
    // 模块实例
    history: new HistoryRenderer(),
    viewer: new ImageViewer(),
    uploader: new UploadManager(),
    generator: new GeneratorUI(),
    auth: new AuthUI(),
    
    // 初始化
    async init() { ... }
};
```

---

## ⚠️ 风险控制

1. **不影响旧版**
   - ✅ 所有改动仅限 `/frontend/v2/` 目录
   - ✅ 使用独立的CSS类名前缀 `.v2-`
   - ✅ 不修改后端API

2. **保持功能一致**
   - 重构过程中保持所有现有功能正常工作
   - 逐模块迁移，每个模块完成后测试

3. **向后兼容**
   - 全局函数（`window.xxx`）在过渡期保留
   - 等所有模块完成后再移除

---

## 📈 预期收益

1. **可维护性** ↑↑↑
   - 代码组织清晰
   - 单一职责原则
   - 易于测试

2. **性能** ↑
   - 按需加载模块
   - 减少全局污染
   - 更好的代码压缩

3. **扩展性** ↑↑
   - 新功能独立模块
   - 不影响现有代码
   - 易于团队协作

---

## ✅ 下一步

**用户确认后，开始执行：**
1. Phase 2.1: 创建 HistoryRenderer.js
2. Phase 2.2: 创建 ImageViewer.js  
3. Phase 2.3: 创建 UploadManager.js
4. Phase 2.4: 创建 GeneratorUI.js
5. Phase 2.5: 创建 AuthUI.js
6. Phase 2.6: 创建工具模块
7. Phase 2.7: 整合到 app.js
8. Phase 3: 状态管理优化
9. 全面测试

**预计工作量：** 每个模块 30-60分钟，总计 4-6小时
