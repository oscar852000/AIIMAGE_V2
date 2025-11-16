/**
 * 认证UI模块
 * 负责登录/注册弹窗的显示、表单验证和提交
 */

import DOM from '../utils/dom.js';
import confirmDialog from '../utils/confirm.js';

export class AuthUI {
    constructor(app) {
        this.app = app;

        // DOM元素
        this.modal = DOM.qs('#v2AuthModal');
        this.closeBtn = DOM.qs('#v2AuthCloseBtn');
        this.errorMsg = DOM.qs('#v2AuthError');
        this.userAvatarBtn = DOM.qs('[data-role="user-avatar"]');

        this.tabs = DOM.qsa('.v2-auth-tab');
        this.loginForm = DOM.qs('#v2LoginForm');
        this.registerForm = DOM.qs('#v2RegisterForm');

        this.init();
    }

    /**
     * 初始化事件监听
     */
    init() {
        // 用户头像点击事件（登录/登出）
        if (this.userAvatarBtn) {
            this.userAvatarBtn.addEventListener('click', async () => {
                if (this.app.isLoggedIn) {
                    const confirmed = await confirmDialog.show('确定要退出登录吗？', {
                        type: 'warning',
                        okText: '退出',
                        cancelText: '取消'
                    });
                    if (confirmed) {
                        this.app.handleLogout();
                    }
                } else {
                    this.openModal();
                }
            });
        }

        // 关闭按钮
        if (this.closeBtn) {
            this.closeBtn.addEventListener('click', () => this.closeModal());
        }

        // 点击背景关闭
        if (this.modal) {
            this.modal.addEventListener('click', (e) => {
                if (e.target === this.modal) {
                    this.closeModal();
                }
            });
        }

        // Tab切换事件
        this.tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                this.switchTab(tab.dataset.tab);
            });
        });

        // 登录表单提交
        if (this.loginForm) {
            this.loginForm.addEventListener('submit', (e) => this.handleLoginSubmit(e));
        }

        // 注册表单提交
        if (this.registerForm) {
            this.registerForm.addEventListener('submit', (e) => this.handleRegisterSubmit(e));
        }
    }

    /**
     * 打开弹窗
     * @param {string} tab - 初始显示的标签页 ('login' | 'register')
     */
    openModal(tab = 'login') {
        if (!this.modal) return;

        this.modal.classList.add('active');
        this.switchTab(tab);
        this.hideMessage();
    }

    /**
     * 关闭弹窗
     */
    closeModal() {
        if (!this.modal) return;

        this.modal.classList.remove('active');
        if (this.loginForm) this.loginForm.reset();
        if (this.registerForm) this.registerForm.reset();
        this.hideMessage();
    }

    /**
     * 切换Tab
     */
    switchTab(tab) {
        // 更新Tab样式
        this.tabs.forEach(t => t.classList.remove('active'));
        const targetTab = DOM.qs(`.v2-auth-tab[data-tab="${tab}"]`);
        if (targetTab) targetTab.classList.add('active');

        // 切换表单显示
        if (this.loginForm && this.registerForm) {
            if (tab === 'login') {
                this.loginForm.style.display = 'block';
                this.registerForm.style.display = 'none';
            } else {
                this.loginForm.style.display = 'none';
                this.registerForm.style.display = 'block';
            }
        }

        this.hideMessage();
    }

    /**
     * 显示错误消息
     */
    showError(message) {
        if (!this.errorMsg) return;

        this.errorMsg.style.background = 'rgba(237, 66, 69, 0.1)';
        this.errorMsg.style.color = '#ef4444';
        this.errorMsg.textContent = message;
        this.errorMsg.classList.add('active');
    }

    /**
     * 显示成功消息
     */
    showSuccess(message) {
        if (!this.errorMsg) return;

        this.errorMsg.style.background = 'rgba(59, 165, 93, 0.1)';
        this.errorMsg.style.color = '#10b981';
        this.errorMsg.textContent = message;
        this.errorMsg.classList.add('active');
    }

    /**
     * 隐藏消息
     */
    hideMessage() {
        if (!this.errorMsg) return;

        this.errorMsg.style.background = '';
        this.errorMsg.style.color = '';
        this.errorMsg.classList.remove('active');
    }

    /**
     * 设置表单加载状态
     */
    setFormLoading(form, isLoading, text = '处理中…') {
        if (!form) return;

        const btn = form.querySelector('button[type="submit"]');
        if (!btn) return;

        if (isLoading) {
            btn.dataset.originalText = btn.textContent;
            btn.disabled = true;
            btn.classList.add('loading');
            btn.textContent = text;
        } else {
            btn.disabled = false;
            btn.classList.remove('loading');
            if (btn.dataset.originalText) {
                btn.textContent = btn.dataset.originalText;
                delete btn.dataset.originalText;
            }
        }
    }

    /**
     * 处理登录表单提交
     */
    async handleLoginSubmit(e) {
        e.preventDefault();

        const username = DOM.qs('#v2LoginUsername')?.value.trim();
        const password = DOM.qs('#v2LoginPassword')?.value.trim();

        if (!username || !password) {
            this.showError('请输入用户名和密码');
            return;
        }

        try {
            this.hideMessage();
            this.setFormLoading(this.loginForm, true, '登录中…');

            const result = await this.app.handleLogin(username, password);

            if (result.success) {
                this.showSuccess('登录成功！');
                setTimeout(() => {
                    this.closeModal();
                    window.location.reload();
                }, 500);
            } else {
                this.showError(result.message || '登录失败，请检查用户名和密码');
            }
        } catch (error) {
            console.error('登录错误:', error);
            this.showError('登录失败，网络可能不稳定，请稍后重试');
        } finally {
            this.setFormLoading(this.loginForm, false);
        }
    }

    /**
     * 处理注册表单提交
     */
    async handleRegisterSubmit(e) {
        e.preventDefault();

        const username = DOM.qs('#v2RegisterUsername')?.value.trim();
        const email = DOM.qs('#v2RegisterEmail')?.value.trim();
        const password = DOM.qs('#v2RegisterPassword')?.value.trim();
        const confirmPassword = DOM.qs('#v2RegisterConfirmPassword')?.value.trim();

        // 表单验证
        if (!username || !email || !password || !confirmPassword) {
            this.showError('请填写所有字段');
            return;
        }

        if (password !== confirmPassword) {
            this.showError('两次输入的密码不一致');
            return;
        }

        if (password.length < 6) {
            this.showError('密码长度至少6个字符');
            return;
        }

        try {
            this.hideMessage();
            this.setFormLoading(this.registerForm, true, '注册中…');

            const result = await this.app.handleRegister(username, password, email);

            if (result.success) {
                this.showSuccess('注册成功！请登录');
                setTimeout(() => {
                    this.registerForm.reset();
                    this.switchTab('login');
                }, 1000);
            } else {
                this.showError(result.message || '注册失败，请稍后重试');
            }
        } catch (error) {
            console.error('注册错误:', error);
            this.showError('注册失败，网络可能不稳定，请稍后重试');
        } finally {
            this.setFormLoading(this.registerForm, false);
        }
    }
}

export default AuthUI;
