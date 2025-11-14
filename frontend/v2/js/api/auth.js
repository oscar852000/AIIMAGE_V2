/**
 * 认证服务
 * 处理登录、注册、用户信息获取
 */

import { apiClient } from './client.js';
import { API_CONFIG } from './config.js';

export class AuthService {
    /**
     * 用户登录
     * @param {string} username - 用户名
     * @param {string} password - 密码
     * @returns {Promise<{access_token: string, token_type: string}>}
     */
    async login(username, password) {
        const formData = new URLSearchParams();
        formData.append('username', username);
        formData.append('password', password);

        const data = await apiClient.postUrlEncoded(
            API_CONFIG.ENDPOINTS.LOGIN,
            formData,
            false // 登录不需要token
        );

        // 保存token
        apiClient.setToken(data.access_token);

        return data;
    }

    /**
     * 用户注册
     * @param {string} username - 用户名
     * @param {string} password - 密码
     * @param {string} email - 邮箱（可选）
     */
    async register(username, password, email = null) {
        const data = await apiClient.post(
            API_CONFIG.ENDPOINTS.REGISTER,
            { username, password, email },
            false // 注册不需要token
        );

        return data;
    }

    /**
     * 获取当前用户信息
     */
    async getCurrentUser() {
        return await apiClient.get(API_CONFIG.ENDPOINTS.USER_ME);
    }

    /**
     * 登出
     */
    logout() {
        apiClient.clearToken();
    }

    /**
     * 检查是否已登录
     */
    isLoggedIn() {
        return !!apiClient.getToken();
    }

    /**
     * 获取粒子币交易记录
     */
    async getTransactions() {
        return await apiClient.get(API_CONFIG.ENDPOINTS.USER_TRANSACTIONS);
    }
}

// 创建全局实例
export const authService = new AuthService();
