/**
 * V2 辅助函数库
 * 提供常用的工具函数
 */

/**
 * 图片文件验证
 */
export function validateImageFile(file) {
    const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
    const maxSize = 10 * 1024 * 1024; // 10MB

    if (!validTypes.includes(file.type)) {
        return { valid: false, message: '请上传 PNG、JPG 或 WebP 格式的图片' };
    }

    if (file.size > maxSize) {
        return { valid: false, message: '图片大小不能超过 10MB' };
    }

    return { valid: true };
}

/**
 * 文件转Base64
 */
export function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

/**
 * Base64转Blob
 */
export function base64ToBlob(base64) {
    const arr = base64.split(',');
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], { type: mime });
}

/**
 * 下载文件
 */
export function downloadFile(url, filename) {
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}

/**
 * 生成唯一ID
 */
export function generateId() {
    return `temp_${Date.now()}`;
}

/**
 * 格式化时间
 */
export function formatTime(dateString) {
    const date = new Date(dateString);
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${month}/${day} ${hours}:${minutes}`;
}

/**
 * 防抖函数
 */
export function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * 节流函数
 */
export function throttle(func, limit) {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

/**
 * 复制文本到剪贴板
 */
export async function copyToClipboard(text) {
    try {
        await navigator.clipboard.writeText(text);
        return true;
    } catch (err) {
        // 降级方案
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        const success = document.execCommand('copy');
        document.body.removeChild(textarea);
        return success;
    }
}

/**
 * 等待指定时间
 */
export function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * 获取localStorage数据
 */
export function getStorage(key, defaultValue = null) {
    try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : defaultValue;
    } catch (err) {
        console.error('getStorage error:', err);
        return defaultValue;
    }
}

/**
 * 设置localStorage数据
 */
export function setStorage(key, value) {
    try {
        localStorage.setItem(key, JSON.stringify(value));
        return true;
    } catch (err) {
        console.error('setStorage error:', err);
        return false;
    }
}

/**
 * 移除localStorage数据
 */
export function removeStorage(key) {
    try {
        localStorage.removeItem(key);
        return true;
    } catch (err) {
        console.error('removeStorage error:', err);
        return false;
    }
}

/**
 * 解析图片URL（处理相对路径和Base64）
 * @param {string} url - 图片URL
 * @returns {string} - 完整的URL
 */
export function parseImageUrl(url) {
    if (!url) return '';

    // 如果是Base64，直接返回
    if (url.startsWith('data:image')) {
        return url;
    }

    // 如果是相对路径，转换为绝对路径
    if (url.startsWith('/')) {
        return window.location.origin + url;
    }

    // 已经是完整URL
    return url;
}

/**
 * 格式化日期（增强版）
 * @param {number|string} timestamp - 时间戳
 * @param {boolean} showTime - 是否显示时间（默认true）
 * @returns {string}
 */
export function formatDate(timestamp, showTime = true) {
    if (!timestamp) return '';

    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;

    // 今天
    if (diff < 86400000 && date.getDate() === now.getDate()) {
        if (showTime) {
            return `今天 ${formatTimeOnly(date)}`;
        }
        return '今天';
    }

    // 昨天
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    if (date.getDate() === yesterday.getDate() && date.getMonth() === yesterday.getMonth()) {
        if (showTime) {
            return `昨天 ${formatTimeOnly(date)}`;
        }
        return '昨天';
    }

    // 一周内
    if (diff < 604800000) {
        const days = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
        if (showTime) {
            return `${days[date.getDay()]} ${formatTimeOnly(date)}`;
        }
        return days[date.getDay()];
    }

    // 其他日期
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    if (showTime) {
        return `${year}-${month}-${day} ${formatTimeOnly(date)}`;
    }
    return `${year}-${month}-${day}`;
}

/**
 * 格式化时间部分（HH:MM）
 */
function formatTimeOnly(date) {
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
}

/**
 * 截断文本
 * @param {string} text - 原文本
 * @param {number} maxLength - 最大长度
 * @param {string} suffix - 后缀（默认'...'）
 * @returns {string}
 */
export function truncateText(text, maxLength, suffix = '...') {
    if (!text || text.length <= maxLength) return text;
    return text.substring(0, maxLength) + suffix;
}

/**
 * 文件大小格式化
 * @param {number} bytes - 字节数
 * @returns {string}
 */
export function formatFileSize(bytes) {
    if (bytes === 0) return '0 B';

    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
}
