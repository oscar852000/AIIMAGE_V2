/**
 * AIIMAGE V2 - 主应用文件
 * 将API模块和UI模块集成到页面
 * @version 20251114021
 */

import { authService, imageService, historyService } from './api/index.js?v=20251115006';
import toast from './utils/toast.js?v=20251115006';
import confirmDialog from './utils/confirm.js?v=20251115006';
import HistoryRenderer from './modules/HistoryRenderer.js?v=20251115006';
import ImageViewer from './modules/ImageViewer.js?v=20251115006';
import AuthUI from './modules/AuthUI.js?v=20251115006';
import UploadManager from './modules/UploadManager.js?v=20251115006';
import GeneratorUI from './modules/GeneratorUI.js?v=20251115006';
import { initLegacyFeatures } from './legacy.js?v=20251115004';

// 全局状态管理
window.V2App = {
    // 服务实例
    auth: authService,
    image: imageService,
    history: historyService,

    // UI模块实例（延迟初始化）
    historyRenderer: null,
    imageViewer: null,
    authUI: null,
    uploadManager: null,
    generatorUI: null,

    // 应用状态
    currentUser: null,
    isLoggedIn: false,

    /**
     * 初始化应用
     */
    async init() {
        console.log('🚀 AIIMAGE V2 应用初始化...');

        // 🔑 加载Legacy功能模块（包含上传、生成、侧边栏等功能）
        initLegacyFeatures();

        // 初始化UI模块（只初始化无冲突的模块）
        this.historyRenderer = new HistoryRenderer(historyService);
        this.imageViewer = new ImageViewer(historyService);
        this.authUI = new AuthUI(this);

        // ⚠️ 暂时禁用这两个模块，避免与内联代码冲突
        // this.uploadManager = new UploadManager();
        // this.generatorUI = new GeneratorUI(this, this.uploadManager);

        // 暴露到全局以便旧版代码调用（兼容过渡）
        // 历史记录相关
        window.showSkeletonCards = (count) => this.historyRenderer.showSkeletons(count);
        window.clearSkeletonCards = () => this.historyRenderer.clearSkeletons();
        window.renderHistoryTasksLite = (tasks) => this.historyRenderer.renderTasks(tasks);
        window.initHistoryLazyLoad = () => this.historyRenderer.initLazyLoad();

        // 图片查看器相关
        window.openImageViewer = (src, opts) => this.imageViewer.open(src, opts);
        window.updateImageViewer = (src) => this.imageViewer.updateImage(src);
        window.closeImageViewer = () => this.imageViewer.close();
        window.openImageWithOriginal = (taskId, idx, url) => this.imageViewer.openWithOriginal(taskId, idx, url);
        window.downloadViewerImage = () => this.imageViewer.download();

        // Toast辅助函数（便于内联代码调用）
        window.showSuccess = (msg, duration) => toast.success(msg, duration);
        window.showError = (msg, duration) => toast.error(msg, duration);
        window.showWarning = (msg, duration) => toast.warning(msg, duration);
        window.showInfo = (msg, duration) => toast.info(msg, duration);

        // 🔑 修复：历史记录图片下载函数（解决data URL导航问题）
        window.downloadHistoryImage = (imageUrl, filename) => {
            try {
                const link = document.createElement('a');
                link.href = imageUrl;
                link.download = `${filename || 'image'}.jpg`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                console.log('✅ 开始下载:', filename);
            } catch (error) {
                console.error('❌ 下载失败:', error);
                toast.error('下载失败，请重试');
            }
        };

        // 检查登录状态
        this.isLoggedIn = this.auth.isLoggedIn();

        if (this.isLoggedIn) {
            try {
                this.currentUser = await this.auth.getCurrentUser();
                console.log('✅ 用户已登录:', this.currentUser.username);
                console.log('💰 粒子币余额:', this.currentUser.particles);

                // 更新UI显示用户信息
                this.updateUserUI();

                // 🔑 加载历史记录（复用旧版懒加载逻辑）
                console.log('🔍 准备加载历史记录...');

                // 1. 显示骨架屏
                if (typeof window.showSkeletonCards === 'function') {
                    window.showSkeletonCards(4);
                }

                // 2. 加载任务列表（lite模式，只有元数据）
                const historyResult = await this.loadHistory(8);
                console.log('🔍 历史记录API返回:', historyResult);

                if (historyResult.success && historyResult.data && historyResult.data.tasks) {
                    console.log('📜 历史记录元数据已加载:', historyResult.data.tasks.length, '条');

                    // 3. 创建任务卡片（只显示占位符，不加载图片）
                    if (typeof window.renderHistoryTasksLite === 'function') {
                        window.renderHistoryTasksLite(historyResult.data.tasks);
                    }

                    // 4. 初始化Intersection Observer懒加载（旧版逻辑）
                    if (typeof window.initHistoryLazyLoad === 'function') {
                        window.initHistoryLazyLoad();
                    }
                } else {
                    console.log('⚠️ 没有历史记录数据');
                    // 移除骨架屏
                    if (typeof window.clearSkeletonCards === 'function') {
                        window.clearSkeletonCards();
                    }
                }
            } catch (error) {
                console.error('获取用户信息失败:', error);
                // Token可能已过期
                this.auth.logout();
                this.isLoggedIn = false;
            }
        } else {
            console.log('⚠️  未登录状态');
        }

        this.updateUserUI();

        // 暴露到全局供调试
        window.authService = authService;
        window.imageService = imageService;
        window.historyService = historyService;
        window.v2Toast = toast;
        window.v2Confirm = confirmDialog;

        console.log('✅ V2应用初始化完成！');
        console.log('💡 调试提示: 可以在控制台使用 authService, imageService, historyService, v2Toast, v2Confirm');
    },

    /**
     * 更新用户UI
     */
    updateUserUI() {
        const creditsEl = document.querySelector('[data-role="credits-display"]');
        if (creditsEl) {
            creditsEl.textContent = this.currentUser
                ? `${this.currentUser.particles} Credits`
                : '-- Credits';
        }

        const avatarEl = document.querySelector('[data-role="user-avatar"]');
        if (avatarEl) {
            if (this.currentUser) {
                avatarEl.textContent = this.currentUser.username.charAt(0).toUpperCase();
                avatarEl.title = this.currentUser.username;
            } else {
                avatarEl.textContent = '?';
                avatarEl.title = '未登录';
            }
        }
    },

    /**
     * 登录处理
     */
    async handleLogin(username, password) {
        try {
            await this.auth.login(username, password);
            this.currentUser = await this.auth.getCurrentUser();
            this.isLoggedIn = true;

            this.updateUserUI();

            console.log('✅ 登录成功:', this.currentUser.username);
            return { success: true };
        } catch (error) {
            console.error('❌ 登录失败:', error);
            return { success: false, message: error.message };
        }
    },

    /**
     * 注册处理
     */
    async handleRegister(username, password, email) {
        try {
            const result = await this.auth.register(username, password, email);
            console.log('✅ 注册成功:', result);
            return { success: true, data: result };
        } catch (error) {
            console.error('❌ 注册失败:', error);
            return { success: false, message: error.message };
        }
    },

    /**
     * 登出处理
     */
    handleLogout(options = { reload: true }) {
        this.auth.logout();
        this.currentUser = null;
        this.isLoggedIn = false;
        this.updateUserUI();
        console.log('✅ 已登出');

        if (options.reload !== false) {
            window.location.reload();
        }
    },

    /**
     * 图片生成处理
     */
    async handleGenerate(params) {
        try {
            console.log('🎨 开始生成图片...', params);

            const result = await this.image.generate(params);

            console.log('✅ 生成成功:', result);

            // 如果已登录，刷新用户信息（余额可能变化）
            if (this.isLoggedIn) {
                this.currentUser = await this.auth.getCurrentUser();
                this.updateUserUI();
            }

            return { success: true, data: result };
        } catch (error) {
            console.error('❌ 生成失败:', error);

            // 🔑 特殊处理：504超时错误（系列图可能需要更长时间）
            if (error.message === 'TIMEOUT_504') {
                console.warn('⏱️  后端处理超时，但图片可能仍在生成中...');
                return {
                    success: false,
                    message: 'TIMEOUT_504',  // 特殊标记
                    userMessage: '图片生成时间较长，正在后台处理中。\n请稍后刷新页面查看历史记录。'
                };
            }

            if (error.message && error.message.includes('登录已过期')) {
                this.handleLogout({ reload: false });
            }

            return { success: false, message: error.message };
        }
    },

    /**
     * 加载历史记录
     */
    async loadHistory(limit = 8) {
        if (!this.isLoggedIn) {
            console.warn('⚠️  未登录，无法加载历史');
            return { success: false, message: '请先登录' };
        }

        try {
            console.log('📜 加载历史记录...');

            const result = await this.history.getTasks(limit);

            console.log('✅ 加载历史成功:', result.tasks.length, '条');

            return { success: true, data: result };
        } catch (error) {
            console.error('❌ 加载历史失败:', error);
            return { success: false, message: error.message };
        }
    },

    /**
     * 提示词优化处理
     */
    async handleOptimizePrompt(params) {
        try {
            console.log('✨ 开始优化提示词...', params);

            const result = await this.image.optimizePrompt(params);

            console.log('✅ 优化成功:', result);

            return { success: true, data: result };
        } catch (error) {
            console.error('❌ 优化失败:', error);
            return { success: false, message: error.message };
        }
    }
};

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
        window.V2App.updateUserUI();
        window.V2App.init();
});

// 导出供其他模块使用
export default window.V2App;
