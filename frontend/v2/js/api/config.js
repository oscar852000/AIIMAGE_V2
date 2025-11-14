/**
 * API 配置文件
 * V2版本 - 2025-11-14
 */

export const API_CONFIG = {
    BASE_URL: '', // 同域，使用相对路径
    ADAPTER_ID: 'google_gemini_image_rest',

    // Token配置
    TOKEN_KEY: 'auth_token', // localStorage key（与旧版共享）

    // 端点配置
    ENDPOINTS: {
        // 认证
        LOGIN: '/auth/token',
        REGISTER: '/auth/register',

        // 用户
        USER_ME: '/users/me',
        USER_TASKS: '/users/me/tasks',
        USER_TRANSACTIONS: '/users/me/transactions',

        // 图片生成
        GENERATE_IMAGE: '/run/generate_image/google_gemini_image_rest',
        EDIT_IMAGE: '/run/edit_image/google_gemini_image_rest',
    },

    // 默认配置
    DEFAULTS: {
        IMAGE_COUNT: 1,
        ASPECT_RATIO: '1:1',
        QUALITY: 'standard',
        TASK_LIMIT: 8, // 历史任务加载数量
    }
};
