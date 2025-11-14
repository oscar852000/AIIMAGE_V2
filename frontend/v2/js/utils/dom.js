/**
 * DOM操作辅助工具
 * 提供常用的DOM查询和操作方法
 */

export const DOM = {
    /**
     * querySelector简写
     */
    qs(selector, parent = document) {
        return parent.querySelector(selector);
    },

    /**
     * querySelectorAll简写
     */
    qsa(selector, parent = document) {
        return parent.querySelectorAll(selector);
    },

    /**
     * 创建元素
     * @param {string} tag - 标签名
     * @param {string|string[]} className - 类名（字符串或数组）
     * @param {string} innerHTML - 内部HTML（可选）
     * @returns {HTMLElement}
     */
    create(tag, className = '', innerHTML = '') {
        const el = document.createElement(tag);

        if (className) {
            if (Array.isArray(className)) {
                el.className = className.join(' ');
            } else {
                el.className = className;
            }
        }

        if (innerHTML) {
            el.innerHTML = innerHTML;
        }

        return el;
    },

    /**
     * 批量添加事件监听器
     * @param {Element|NodeList} elements - 元素或元素列表
     * @param {string} event - 事件类型
     * @param {Function} handler - 处理函数
     */
    on(elements, event, handler) {
        if (elements instanceof NodeList || Array.isArray(elements)) {
            elements.forEach(el => el.addEventListener(event, handler));
        } else {
            elements.addEventListener(event, handler);
        }
    },

    /**
     * 批量移除事件监听器
     */
    off(elements, event, handler) {
        if (elements instanceof NodeList || Array.isArray(elements)) {
            elements.forEach(el => el.removeEventListener(event, handler));
        } else {
            elements.removeEventListener(event, handler);
        }
    },

    /**
     * 显示元素
     */
    show(element, display = 'block') {
        if (!element) return;
        element.style.display = display;
    },

    /**
     * 隐藏元素
     */
    hide(element) {
        if (!element) return;
        element.style.display = 'none';
    },

    /**
     * 切换元素显示/隐藏
     */
    toggle(element, display = 'block') {
        if (!element) return;
        element.style.display = element.style.display === 'none' ? display : 'none';
    },

    /**
     * 添加类名
     */
    addClass(element, className) {
        if (!element) return;
        element.classList.add(className);
    },

    /**
     * 移除类名
     */
    removeClass(element, className) {
        if (!element) return;
        element.classList.remove(className);
    },

    /**
     * 切换类名
     */
    toggleClass(element, className) {
        if (!element) return;
        element.classList.toggle(className);
    },

    /**
     * 检查是否有类名
     */
    hasClass(element, className) {
        if (!element) return false;
        return element.classList.contains(className);
    },

    /**
     * 设置属性
     */
    setAttrs(element, attrs) {
        if (!element) return;
        Object.entries(attrs).forEach(([key, value]) => {
            element.setAttribute(key, value);
        });
    },

    /**
     * 移除元素
     */
    remove(element) {
        if (!element) return;
        element.remove();
    },

    /**
     * 清空元素内容
     */
    empty(element) {
        if (!element) return;
        element.innerHTML = '';
    },

    /**
     * 在元素后插入HTML
     */
    appendHTML(element, html) {
        if (!element) return;
        element.insertAdjacentHTML('beforeend', html);
    },

    /**
     * 获取最近的匹配祖先元素
     */
    closest(element, selector) {
        if (!element) return null;
        return element.closest(selector);
    }
};

// 导出单独的函数供按需引入
export const { qs, qsa, create, on, off, show, hide, toggle, addClass, removeClass, toggleClass, hasClass, setAttrs, remove, empty, appendHTML, closest } = DOM;

export default DOM;
