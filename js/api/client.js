/**
 * API 基础类
 * 处理所有HTTP请求的基础逻辑
 */

import { API_CONFIG } from './config.js';

export class APIClient {
    constructor() {
        this.baseURL = API_CONFIG.BASE_URL;
        this.tokenKey = API_CONFIG.TOKEN_KEY;
    }

    /**
     * 获取存储的token
     */
    getToken() {
        return localStorage.getItem(this.tokenKey);
    }

    /**
     * 保存token
     */
    setToken(token) {
        localStorage.setItem(this.tokenKey, token);
    }

    /**
     * 清除token
     */
    clearToken() {
        localStorage.removeItem(this.tokenKey);
    }

    /**
     * 构建请求头
     */
    buildHeaders(requireAuth = true, contentType = 'application/json') {
        const headers = {};

        if (contentType) {
            headers['Content-Type'] = contentType;
        }

        if (requireAuth) {
            const token = this.getToken();
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }
        }

        return headers;
    }

    /**
     * 通用请求方法（增强版：支持超时和重试）
     */
    async request(url, options = {}) {
        const { requireAuth = true, timeout = null, ...fetchOptions } = options;

        // 创建超时控制器（如果指定了timeout）
        let abortController = null;
        let timeoutId = null;

        if (timeout) {
            abortController = new AbortController();
            fetchOptions.signal = abortController.signal;

            timeoutId = setTimeout(() => {
                abortController.abort();
            }, timeout);
        }

        try {
            const response = await fetch(this.baseURL + url, fetchOptions);

            // 清除超时定时器
            if (timeoutId) {
                clearTimeout(timeoutId);
            }

            // 处理401（未授权）
            if (response.status === 401) {
                this.clearToken();
                throw new Error('登录已过期，请重新登录');
            }

            // 处理402（余额不足）
            if (response.status === 402) {
                const data = await response.json();
                throw new Error(data.detail || '粒子币余额不足');
            }

            // 处理504（网关超时）
            if (response.status === 504) {
                throw new Error('TIMEOUT_504'); // 特殊标记，前端会特殊处理
            }

            // 处理其他错误
            if (!response.ok) {
                const data = await response.json().catch(() => ({}));
                throw new Error(data.detail || `请求失败: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            // 清除超时定时器
            if (timeoutId) {
                clearTimeout(timeoutId);
            }

            // 如果是AbortError，转换为超时错误
            if (error.name === 'AbortError') {
                throw new Error('请求超时，请稍后重试');
            }

            console.error('API请求错误:', error);
            throw error;
        }
    }

    /**
     * GET请求
     */
    async get(url, requireAuth = true) {
        return this.request(url, {
            method: 'GET',
            headers: this.buildHeaders(requireAuth),
            requireAuth
        });
    }

    /**
     * POST请求（JSON）
     */
    async post(url, data, requireAuth = true) {
        return this.request(url, {
            method: 'POST',
            headers: this.buildHeaders(requireAuth),
            body: JSON.stringify(data),
            requireAuth
        });
    }

    /**
     * POST请求（FormData）
     */
    async postFormData(url, formData, requireAuth = true) {
        // FormData不需要设置Content-Type，浏览器会自动设置
        const headers = this.buildHeaders(requireAuth, null);

        return this.request(url, {
            method: 'POST',
            headers,
            body: formData,
            requireAuth
        });
    }

    /**
     * POST请求（URLEncoded）
     */
    async postUrlEncoded(url, data, requireAuth = true) {
        return this.request(url, {
            method: 'POST',
            headers: this.buildHeaders(requireAuth, 'application/x-www-form-urlencoded'),
            body: data,
            requireAuth
        });
    }

    /**
     * DELETE请求
     */
    async delete(url, requireAuth = true) {
        return this.request(url, {
            method: 'DELETE',
            headers: this.buildHeaders(requireAuth),
            requireAuth
        });
    }
}

// 创建全局实例
export const apiClient = new APIClient();
