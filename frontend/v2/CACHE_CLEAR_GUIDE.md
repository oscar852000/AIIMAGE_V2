# V2版本缓存清理指南

## 问题现象
修改了代码后，浏览器仍然执行旧代码（如退款还是调用post而不是postFormData）

## 解决方案

### 方案1：强制刷新（推荐）
1. 打开 https://img.jibenlizi.net/v2/
2. 按 `Ctrl + Shift + R` (Windows/Linux) 或 `Cmd + Shift + R` (Mac)
3. 这会清除缓存并重新加载

### 方案2：清除浏览器缓存
1. Chrome: F12 → Network标签 → 勾选"Disable cache"
2. 然后刷新页面

### 方案3：添加版本号（开发环境推荐）
在 `v2/index.html` 的脚本引用中添加时间戳：

```html
<script type="module" src="/v2/js/app.js?v=20250114"></script>
```

每次更新代码后修改版本号即可强制刷新。

## 验证方法
1. 打开控制台（F12）
2. 生成图片并让部分失败
3. 查看Network标签中的 `/api/refund-task` 请求
4. 检查 `Request Payload` 应该是 `FormData` 格式，不是JSON

## 当前代码状态
✅ 退款逻辑已修复（使用FormData）
✅ 与旧版完全一致
⚠️ 需要清除浏览器缓存才能生效
