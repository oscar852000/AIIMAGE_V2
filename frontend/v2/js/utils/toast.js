/**
 * Toast 提示系统
 * 用于替代 alert/confirm，提供温和的用户提示
 */

class Toast {
    constructor() {
        this.container = null;
        this.toasts = new Map();
        this.init();
    }

    init() {
        // 创建Toast容器（如果不存在）
        if (!this.container) {
            this.container = document.createElement('div');
            this.container.id = 'v2-toast-container';
            this.container.className = 'v2-app'; // 🔑 添加v2-app类，应用样式作用域
            // 🔑 修复：增加top偏移，避免与用户信息区域重叠
            this.container.style.cssText = 'position: fixed; top: 80px; right: 20px; z-index: 9999;';
            document.body.appendChild(this.container);
        }
    }

    /**
     * 显示Toast提示
     * @param {string} message - 提示消息
     * @param {string} type - 类型: 'success' | 'warning' | 'error' | 'info'
     * @param {number} duration - 显示时长（毫秒），默认3000
     */
    show(message, type = 'info', duration = 3000) {
        const id = Date.now() + Math.random();
        const toast = this.createToast(message, type, id);

        this.container.appendChild(toast);
        this.toasts.set(id, toast);

        // 淡入动画
        setTimeout(() => {
            toast.style.opacity = '1';
            toast.style.transform = 'translateX(0)';
        }, 10);

        // 自动关闭
        setTimeout(() => {
            this.hide(id);
        }, duration);

        return id;
    }

    createToast(message, type, id) {
        const toast = document.createElement('div');
        toast.className = `v2-toast ${type}`;
        toast.style.cssText = `
            opacity: 0;
            transform: translateX(100%) translateY(-10px);
            transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
            margin-bottom: 12px;
        `;

        // 图标映射
        const icons = {
            success: 'check_circle',
            warning: 'warning',
            error: 'error',
            info: 'info'
        };

        toast.innerHTML = `
            <span class="material-symbols-outlined" style="font-size: 20px;">${icons[type]}</span>
            <span style="flex: 1;">${message}</span>
            <button class="v2-toast-close" style="background: none; border: none; cursor: pointer; padding: 0; color: inherit; opacity: 0.6; transition: opacity 0.2s ease;">
                <span class="material-symbols-outlined" style="font-size: 18px;">close</span>
            </button>
        `;

        // 点击关闭按钮
        toast.querySelector('.v2-toast-close').addEventListener('click', () => {
            this.hide(id);
        });

        // 悬停关闭按钮时加深不透明度
        const closeBtn = toast.querySelector('.v2-toast-close');
        closeBtn.addEventListener('mouseenter', () => {
            closeBtn.style.opacity = '1';
        });
        closeBtn.addEventListener('mouseleave', () => {
            closeBtn.style.opacity = '0.6';
        });

        return toast;
    }

    hide(id) {
        const toast = this.toasts.get(id);
        if (!toast) return;

        // 🎨 柔和的淡出动画
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(100%) translateY(-10px)';

        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
            this.toasts.delete(id);
        }, 400); // 🎨 匹配新的动画时长
    }

    // 便捷方法
    success(message, duration) {
        return this.show(message, 'success', duration);
    }

    warning(message, duration) {
        return this.show(message, 'warning', duration);
    }

    error(message, duration) {
        return this.show(message, 'error', duration);
    }

    info(message, duration) {
        return this.show(message, 'info', duration);
    }
}

// 创建全局实例
const toast = new Toast();

// 导出（如果使用ES6 Modules）
export default toast;

// 也挂载到window以便直接使用
if (typeof window !== 'undefined') {
    window.v2Toast = toast;
}
