/**
 * 自定义确认框组件
 * 用于替代阻塞式的 confirm()，提供现代化、非阻塞的确认体验
 */

class ConfirmDialog {
    constructor() {
        this.dialog = null;
        this.resolveCallback = null;
        this.init();
    }

    init() {
        // 创建对话框容器
        this.dialog = document.createElement('div');
        this.dialog.id = 'v2-confirm-dialog';
        this.dialog.className = 'v2-confirm-overlay';
        this.dialog.style.display = 'none';

        this.dialog.innerHTML = `
            <div class="v2-confirm-content">
                <div class="v2-confirm-icon">
                    <span class="material-symbols-outlined" style="font-size: 48px; color: #f59e0b;">help</span>
                </div>
                <div class="v2-confirm-message"></div>
                <div class="v2-confirm-buttons">
                    <button class="v2-confirm-btn v2-confirm-cancel">取消</button>
                    <button class="v2-confirm-btn v2-confirm-ok">确定</button>
                </div>
            </div>
        `;

        document.body.appendChild(this.dialog);

        // 绑定事件
        this.dialog.querySelector('.v2-confirm-cancel').addEventListener('click', () => this.close(false));
        this.dialog.querySelector('.v2-confirm-ok').addEventListener('click', () => this.close(true));

        // 点击背景关闭
        this.dialog.addEventListener('click', (e) => {
            if (e.target === this.dialog) {
                this.close(false);
            }
        });

        // ESC键关闭
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.dialog.style.display === 'flex') {
                this.close(false);
            }
        });
    }

    /**
     * 显示确认框
     * @param {string} message - 确认消息
     * @param {Object} options - 配置选项
     * @param {string} options.title - 标题（可选）
     * @param {string} options.okText - 确定按钮文本（默认"确定"）
     * @param {string} options.cancelText - 取消按钮文本（默认"取消"）
     * @param {string} options.type - 类型: 'warning' | 'danger' | 'info'（默认'warning'）
     * @returns {Promise<boolean>} - true表示确定，false表示取消
     */
    show(message, options = {}) {
        const {
            title = null,
            okText = '确定',
            cancelText = '取消',
            type = 'warning'
        } = options;

        return new Promise((resolve) => {
            this.resolveCallback = resolve;

            // 设置消息
            const messageEl = this.dialog.querySelector('.v2-confirm-message');
            if (title) {
                messageEl.innerHTML = `
                    <div class="v2-confirm-title">${title}</div>
                    <div class="v2-confirm-text">${message}</div>
                `;
            } else {
                messageEl.innerHTML = `<div class="v2-confirm-text">${message}</div>`;
            }

            // 设置图标
            const iconEl = this.dialog.querySelector('.v2-confirm-icon span');
            const iconMap = {
                warning: { icon: 'help', color: '#f59e0b' },
                danger: { icon: 'warning', color: '#ef4444' },
                info: { icon: 'info', color: '#3b82f6' }
            };
            const iconConfig = iconMap[type] || iconMap.warning;
            iconEl.textContent = iconConfig.icon;
            iconEl.style.color = iconConfig.color;

            // 设置按钮文本
            this.dialog.querySelector('.v2-confirm-cancel').textContent = cancelText;
            this.dialog.querySelector('.v2-confirm-ok').textContent = okText;

            // 显示对话框
            this.dialog.style.display = 'flex';

            // 淡入动画
            requestAnimationFrame(() => {
                this.dialog.classList.add('active');
            });
        });
    }

    close(result) {
        // 淡出动画
        this.dialog.classList.remove('active');

        setTimeout(() => {
            this.dialog.style.display = 'none';
            if (this.resolveCallback) {
                this.resolveCallback(result);
                this.resolveCallback = null;
            }
        }, 200);
    }
}

// 创建全局实例
const confirmDialog = new ConfirmDialog();

// 导出
export default confirmDialog;

// 也挂载到window以便直接使用
if (typeof window !== 'undefined') {
    window.v2Confirm = confirmDialog;
}
