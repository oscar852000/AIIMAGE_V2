# V2 版本快速测试指南

## ✅ 已完成集成

**版本**: 2.2.0 - 后端API已成功接入

已完成的工作：
1. ✅ 创建完整的API模块系统（auth, image, history）
2. ✅ 集成到 index.html（已引入 app.js 模块）
3. ✅ 修改生成按钮事件，调用真实API
4. ✅ Token与旧版共享（localStorage: `auth_token`）

---

## 🧪 测试步骤

### 1️⃣ 打开页面

访问: `https://img.jibenlizi.net/v2/`

打开浏览器控制台（F12），你应该看到：

```
🚀 AIIMAGE V2 应用初始化...
⚠️  未登录状态
✅ V2应用初始化完成！
💡 调试提示: 可以在控制台使用 authService, imageService, historyService
```

---

### 2️⃣ 测试登录功能（控制台）

在控制台执行以下命令测试API是否正常：

```javascript
// 测试登录
await V2App.handleLogin('你的用户名', '你的密码');

// 查看当前用户信息
console.log(V2App.currentUser);
console.log('粒子币余额:', V2App.currentUser?.particles);
```

**预期结果**：
- 控制台显示 "✅ 登录成功: xxx"
- 页面右上角显示正确的粒子币余额
- localStorage 中有 `auth_token`

---

### 3️⃣ 测试文生图功能（UI）

**前置条件**: 已登录

1. 在底部输入框输入提示词，例如："一只可爱的橙色猫咪"
2. 选择数量（默认1张）
3. 选择尺寸（默认1:1）
4. 点击发送按钮（↑）

**预期结果**：
- 显示加载中的占位符（脉动动画）
- 控制台显示：
  ```
  🎨 开始生成图片... {prompt: "一只可爱的橙色猫咪", count: 1, ...}
  ✅ 生成成功！显示了 1 张图片
  ```
- 占位符被替换为真实图片（Base64格式）
- 粒子币余额减少（1币/张）
- 输入框自动清空

**如果失败**：
- 显示红色错误提示
- 控制台显示详细错误信息

---

### 4️⃣ 测试图生图功能（UI）

**前置条件**: 已登录

1. 在左侧边栏上传一张图片
2. 在输入框输入提示词："将这只猫变成卡通风格"
3. 点击发送按钮

**预期结果**：
- 自动检测为图生图模式（因为有1张上传图）
- 控制台显示 `uploadedImagesCount: 1`
- 生成新图片

---

### 5️⃣ 测试系列图功能（UI）

**前置条件**: 已登录

1. 在侧边栏开启"系列图"开关
2. 输入提示词
3. 选择数量（建议2-4张）
4. 点击发送按钮

**预期结果**：
- 串行生成：第1张 → 用第1张作为输入生成第2张 → 用第2张生成第3张...
- 控制台显示多次API调用日志
- 最终显示所有生成的图片

---

### 6️⃣ 测试余额不足（可选）

如果粒子币余额 < 生成数量，应该：
- 返回 402 错误
- 显示 "粒子币余额不足" 提示

---

### 7️⃣ 测试Token共享（验证旧版兼容性）

1. 在旧版页面（`/gemini_image_modern.html`）登录
2. 刷新V2页面（`/v2/`）
3. 检查是否自动识别登录状态

**预期结果**：
- V2页面自动显示用户信息和粒子币余额
- 无需重新登录

---

## 🐛 常见问题排查

### 问题1: 控制台报错 "V2App is not defined"

**原因**: app.js 模块未加载

**检查**:
```html
<!-- index.html 中应该有这一行 -->
<script type="module" src="/v2/js/app.js"></script>
```

---

### 问题2: 点击生成按钮无反应

**检查**:
1. 打开控制台，查看是否有JavaScript错误
2. 检查是否输入了提示词
3. 检查网络请求（Network标签）

---

### 问题3: 生成失败，显示"登录已过期"

**原因**: Token过期或无效

**解决**:
```javascript
// 清除token重新登录
localStorage.removeItem('auth_token');
location.reload();
```

---

### 问题4: 图片不显示

**检查**:
1. 控制台查看 `result.data.images` 结构
2. 确认 `imageData.url` 是有效的Base64 data URL
3. 检查图片URL格式：`data:image/jpeg;base64,...`

---

## 📊 调试技巧

### 查看全局对象

```javascript
// 查看V2App
console.log(V2App);

// 查看当前用户
console.log(V2App.currentUser);

// 查看上传的图片
console.log(V2App.image); // ImageService实例

// 直接调用API测试
await authService.getCurrentUser();
await imageService.textToImage({
    prompt: '测试',
    count: 1,
    aspectRatio: '1:1'
});
```

### 查看API请求

1. 打开 Network 标签
2. 过滤：XHR/Fetch
3. 查看请求：
   - `/run/generate_image/...` - 文生图
   - `/run/edit_image/...` - 图生图
   - `/users/me` - 用户信息
   - `/users/me/tasks` - 历史记录

---

## 🎯 下一步功能（待开发）

- [ ] 添加登录/注册弹窗UI（目前只能控制台登录）
- [ ] 加载历史记录到页面
- [ ] 添加Toast提示替代alert
- [ ] 添加Loading遮罩层
- [ ] 实现"重新生成"功能
- [ ] 实现任务删除功能
- [ ] 实现图片下载功能

---

## 📝 测试反馈

测试完成后，请反馈：
1. 登录功能是否正常？
2. 文生图是否成功？
3. 图生图是否成功？
4. 系列图是否成功？
5. 粒子币扣费是否正确？
6. 有哪些bug或改进建议？

---

**准备好了吗？开始测试吧！** 🚀
