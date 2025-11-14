/**
 * 历史任务服务
 * 处理任务列表、详情、删除
 */

import { apiClient } from './client.js';
import { API_CONFIG } from './config.js';

export class HistoryService {
    /**
     * 获取任务列表（Lite模式 - 懒加载优化）
     * @param {number} limit - 数量限制
     */
    async getTasks(limit = API_CONFIG.DEFAULTS.TASK_LIMIT) {
        // 🔑 使用lite=1只获取元数据（不含图片），配合懒加载优化性能
        const url = `${API_CONFIG.ENDPOINTS.USER_TASKS}?limit=${limit}&lite=1`;
        return await apiClient.get(url);
    }

    /**
     * 获取任务详情
     * @param {string} taskId - 任务ID
     * @param {number} maxImages - 最大图片数（可选）
     * @param {boolean} full - 是否返回原图（默认false返回缩略图）
     */
    async getTaskDetail(taskId, maxImages = null, full = false) {
        let url = `${API_CONFIG.ENDPOINTS.USER_TASKS}/${taskId}?full=${full ? 1 : 0}`;
        if (maxImages) {
            url += `&max_images=${maxImages}`;
        }
        return await apiClient.get(url);
    }

    /**
     * 删除任务
     * @param {string} taskId - 任务ID
     */
    async deleteTask(taskId) {
        return await apiClient.delete(`${API_CONFIG.ENDPOINTS.USER_TASKS}/${taskId}`);
    }

    /**
     * 批量加载任务详情
     * 渐进式加载：先加载元数据，再按需加载图片
     * @param {Array} tasks - 任务元数据数组
     * @param {Function} onProgress - 进度回调
     */
    async batchLoadTaskDetails(tasks, onProgress) {
        const results = [];

        for (let i = 0; i < tasks.length; i++) {
            const task = tasks[i];

            try {
                // 先加载1张预览图（缩略图）
                const detail = await this.getTaskDetail(task.task_id, 1, false);
                results.push(detail);

                if (onProgress) {
                    onProgress(i + 1, tasks.length, detail);
                }
            } catch (error) {
                console.error(`加载任务 ${task.task_id} 失败:`, error);
                results.push({ ...task, error: true });
            }
        }

        return results;
    }

    /**
     * 懒加载任务的所有图片
     * 用户点击查看时才加载全部原图
     * @param {string} taskId - 任务ID
     */
    async loadFullImages(taskId) {
        return await this.getTaskDetail(taskId, null, true);
    }
}

// 创建全局实例
export const historyService = new HistoryService();
