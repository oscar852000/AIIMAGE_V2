/**
 * 图片生成服务 - V2版本
 * 完全复用旧版成熟逻辑：循环调用、流式更新、失败重试
 */

import { apiClient } from './client.js';
import { API_CONFIG } from './config.js';

export class ImageService {
    /**
     * 生成唯一任务ID
     */
    generateTaskId() {
        return `temp_${Date.now()}`;
    }

    /**
     * 生成提示词变体（添加不可见空格避免Gemini重复检测）
     * 完全复用旧版逻辑
     */
    generateVariantPrompt(basePrompt, index, total) {
        if (total === 1) {
            return basePrompt;
        }
        // 添加微小空格差异，避免 Gemini 重复检测
        return `${basePrompt}${' '.repeat(index)}`;
    }

    /**
     * 文生图（Text-to-Image）- 旧版逻辑
     * 核心策略：循环调用 count 次，每次 n=1，通过 client_task_id 归并
     * @param {Object} params - 生成参数
     * @param {string} params.prompt - 提示词
     * @param {number} params.count - 生成数量（1-4）
     * @param {string} params.aspectRatio - 画面比例（1:1, 16:9, etc）
     * @param {string} params.taskId - 任务ID（可选）
     * @param {Function} params.onProgress - 进度回调（可选）
     */
    async textToImage(params) {
        const {
            prompt,
            count = 1,
            aspectRatio = '1:1',
            taskId = this.generateTaskId(),
            onProgress
        } = params;

        console.log(`[文生图] 开始生成 ${count} 张图片，分辨率: ${aspectRatio}`);

        const allImages = [];

        // 单张生成函数（复用旧版逻辑）
        const generateSingle = async (index) => {
            // 🔑 关键：使用变体提示词避免重复
            const variantPrompt = this.generateVariantPrompt(prompt, index, count);
            console.log(`[文生图] 变体 ${index + 1}: "${variantPrompt}"`);

            const requestData = {
                prompt: variantPrompt,
                n: 1,  // ⚠️ 关键：每次只请求1张
                size: aspectRatio,
                client_task_id: taskId,  // 🔑 归并到同一任务
                total_image_count: count,  // 🔑 告诉后端总共要生成几张
                model_params: {
                    response_modalities: ['Image'],
                    aspect_ratio: aspectRatio
                    // ⚠️ 不传 mode 字段（旧版没有）
                }
            };

            const requireAuth = apiClient.getToken() !== null;

            try {
                const data = await apiClient.post(
                    API_CONFIG.ENDPOINTS.GENERATE_IMAGE,
                    requestData,
                    requireAuth
                );

                // 处理返回数据
                if (data.images && data.images.length > 0) {
                    data.images.forEach(img => {
                        // 删除description字段
                        delete img.description;

                        // 转换b64_json为url
                        if (img.b64_json && !img.url) {
                            img.url = `data:image/jpeg;base64,${img.b64_json}`;
                            delete img.b64_json;
                        }

                        allImages.push(img);

                        // 流式更新：每完成一张就回调
                        if (onProgress) {
                            onProgress({
                                status: 'processing',
                                images: [...allImages],
                                completed: allImages.length,
                                total: count
                            });
                        }

                        console.log(`✅ [文生图] 第 ${allImages.length}/${count} 张已完成`);
                    });
                }

                return data;
            } catch (error) {
                console.error(`❌ [文生图] 第 ${index + 1} 张生成失败:`, error);
                throw error;
            }
        };

        // 并发策略：≤4张全并发，>4张分批
        let promises = [];
        if (count <= 4) {
            // ≤4张：全并发
            console.log(`[文生图] 全并发生成 ${count} 张`);
            for (let i = 0; i < count; i++) {
                promises.push(generateSingle(i));
            }
        } else {
            // >4张：分批（先2张，再剩余）
            console.log(`[文生图] 分批生成：第一批 2 张`);
            for (let i = 0; i < 2; i++) {
                promises.push(generateSingle(i));
            }
            await Promise.allSettled(promises);

            console.log(`[文生图] 分批生成：第二批 ${count - 2} 张`);
            promises = [];
            for (let i = 2; i < count; i++) {
                promises.push(generateSingle(i));
            }
        }

        const results = await Promise.allSettled(promises);

        // 收集失败的索引
        const failedIndices = results
            .map((result, index) => result.status === 'rejected' ? index : -1)
            .filter(index => index !== -1);

        // 自动重试失败的图片（仅重试一次）
        if (failedIndices.length > 0) {
            console.log(`[文生图] 检测到 ${failedIndices.length} 张失败，自动重试...`);
            const retryPromises = failedIndices.map(index => generateSingle(index).catch(() => null));
            await Promise.allSettled(retryPromises);
        }

        const successCount = allImages.length;
        const failedCount = count - successCount;
        console.log(`[文生图] 完成：成功 ${successCount}/${count} 张，失败 ${failedCount} 张`);

        // 🔑 退款机制：如果有失败的图片，自动退款
        if (failedCount > 0 && apiClient.getToken()) {
            try {
                console.log(`[退款] 开始退款流程：预期${count}张，实际${successCount}张，退款${failedCount}张`);

                // 🔑 后端期望FormData格式
                const refundFormData = new FormData();
                refundFormData.append('task_id', taskId);
                refundFormData.append('expected_count', count.toString());
                refundFormData.append('actual_count', successCount.toString());
                refundFormData.append('mode', 'text-to-image');

                const refundResponse = await apiClient.postFormData(
                    '/api/refund-task',
                    refundFormData,
                    true  // 需要认证
                );
                console.log(`[退款] 退款成功:`, refundResponse);
            } catch (error) {
                console.warn(`[退款] 退款失败（不影响生成结果）:`, error);
            }
        }

        return {
            images: allImages,
            task_id: taskId,
            success_count: successCount,
            failed_count: failedCount
        };
    }

    /**
     * 图生图（Image-to-Image）- 旧版逻辑
     * 核心策略：循环调用 count 次，每次 n=1，复制File对象避免并发冲突
     * @param {Object} params - 生成参数
     * @param {string} params.prompt - 提示词
     * @param {File|File[]} params.images - 参考图片文件（支持多张）
     * @param {number} params.count - 生成数量
     * @param {string} params.aspectRatio - 画面比例
     * @param {string} params.taskId - 任务ID
     * @param {Function} params.onProgress - 进度回调
     */
    async imageToImage(params) {
        const {
            prompt,
            images,
            count = 1,
            aspectRatio = '1:1',
            taskId = this.generateTaskId(),
            onProgress
        } = params;

        // 限制参考图最多3张（复用旧版逻辑）
        const imageArray = Array.isArray(images) ? images : [images];
        const selectedImages = imageArray.slice(0, 3);

        console.log(`[图生图] 开始生成 ${count} 张图片（使用 ${selectedImages.length} 张参考图），分辨率: ${aspectRatio}`);

        // 🔑 关键：预先为每个请求创建独立的File副本数组（避免并发冲突）
        const filesCopiesForRequests = [];
        for (let i = 0; i < count; i++) {
            const copiesForThisRequest = selectedImages.map(file => {
                const blobCopy = file.slice(0, file.size, file.type);
                return new File([blobCopy], file.name, { type: file.type });
            });
            filesCopiesForRequests.push(copiesForThisRequest);
        }
        console.log(`[图生图] File副本创建完成`);

        const allImages = [];
        let completedCount = 0;
        let failedCount = 0;

        // 单张生成函数（带重试）
        const generateSingle = async (index, retryCount = 0) => {
            const formData = new FormData();
            formData.append('prompt', prompt);
            formData.append('task_id', taskId);
            formData.append('total_image_count', count);  // 🔑 告诉后端总共要生成几张

            // 🔑 使用预创建的File副本
            const fileCopies = filesCopiesForRequests[index];
            fileCopies.forEach((fileCopy) => {
                formData.append('image', fileCopy);
            });

            // model_params（不传mode字段）
            formData.append('model_params', JSON.stringify({
                response_modalities: ['Image'],
                aspect_ratio: aspectRatio
            }));

            const requireAuth = apiClient.getToken() !== null;

            try {
                const data = await apiClient.postFormData(
                    API_CONFIG.ENDPOINTS.EDIT_IMAGE,
                    formData,
                    requireAuth
                );

                // 处理返回数据
                if (data.images && data.images.length > 0) {
                    data.images.forEach(img => {
                        delete img.description;
                        if (img.b64_json && !img.url) {
                            img.url = `data:image/jpeg;base64,${img.b64_json}`;
                            delete img.b64_json;
                        }
                        allImages.push(img);
                    });

                    completedCount++;

                    // 流式更新
                    if (onProgress) {
                        onProgress({
                            status: 'processing',
                            images: [...allImages],
                            completed: completedCount,
                            total: count
                        });
                    }

                    console.log(`✅ [图生图] 第 ${completedCount}/${count} 张已完成`);

                    return data.images;
                }

                throw new Error('未返回图片');

            } catch (error) {
                // 自动重试一次
                if (retryCount < 1) {
                    console.log(`[图生图] 第 ${index + 1} 张失败，2秒后重试...`);
                    await new Promise(resolve => setTimeout(resolve, 2000));
                    return await generateSingle(index, retryCount + 1);
                }

                console.error(`❌ [图生图] 第 ${index + 1} 张最终失败:`, error.message);
                failedCount++;

                if (onProgress) {
                    onProgress({
                        status: 'processing',
                        images: [...allImages],
                        completed: completedCount,
                        failed: failedCount,
                        total: count
                    });
                }

                return [];
            }
        };

        // 🚀 并发策略：并发2张 → 等待6秒 → 剩余的再并发
        if (count <= 2) {
            // ≤2张：全并发
            console.log(`[图生图] 并发生成 ${count} 张`);
            const promises = [];
            for (let i = 0; i < count; i++) {
                promises.push(generateSingle(i));
            }
            await Promise.allSettled(promises);
        } else {
            // >2张：先并发2张，等待6秒后，再并发剩余的
            console.log(`[图生图] 批次1：并发生成前 2 张`);
            const batch1Promises = [generateSingle(0), generateSingle(1)];

            // 不等待批次1完成，6秒后立即发送批次2
            console.log(`[图生图] 等待6秒后发送批次2...`);
            await new Promise(resolve => setTimeout(resolve, 6000));

            console.log(`[图生图] 批次2：并发生成剩余 ${count - 2} 张`);
            const batch2Promises = [];
            for (let i = 2; i < count; i++) {
                batch2Promises.push(generateSingle(i));
            }

            // 等待所有请求完成
            await Promise.allSettled([...batch1Promises, ...batch2Promises]);
        }

        console.log(`[图生图] 完成：成功 ${completedCount}/${count} 张，失败 ${failedCount} 张`);

        // 🔑 退款机制：如果有失败的图片，自动退款
        if (failedCount > 0 && apiClient.getToken()) {
            try {
                console.log(`[退款] 开始退款流程：预期${count}张，实际${completedCount}张，退款${failedCount}张`);

                // 🔑 后端期望FormData格式
                const refundFormData = new FormData();
                refundFormData.append('task_id', taskId);
                refundFormData.append('expected_count', count.toString());
                refundFormData.append('actual_count', completedCount.toString());
                refundFormData.append('mode', 'image-to-image');

                const refundResponse = await apiClient.postFormData(
                    '/api/refund-task',
                    refundFormData,
                    true  // 需要认证
                );
                console.log(`[退款] 退款成功:`, refundResponse);
            } catch (error) {
                console.warn(`[退款] 退款失败（不影响生成结果）:`, error);
            }
        }

        return {
            images: allImages,
            task_id: taskId,
            success_count: completedCount,
            failed_count: failedCount
        };
    }

    /**
     * 系列图 - 有参考图（Conversation with Images）
     * 系列图只发送一次请求，返回不确定数量
     */
    async conversationWithImages(params) {
        const {
            prompt,
            images,
            aspectRatio = '1:1',
            taskId = this.generateTaskId()
        } = params;

        const formData = new FormData();
        formData.append('prompt', prompt);
        formData.append('task_id', taskId);

        // 系列图固定参数：mode=conversation
        formData.append('model_params', JSON.stringify({
            response_modalities: ['Text', 'Image'],
            mode: 'conversation',  // ⚠️ 系列图需要mode字段
            aspect_ratio: aspectRatio
        }));

        // 添加参考图片
        const imageArray = Array.isArray(images) ? images : [images];
        imageArray.forEach(file => {
            formData.append('image', file);
        });

        console.log('📤 系列图(有图)请求: images=', imageArray.length);

        const requireAuth = apiClient.getToken() !== null;

        const result = await apiClient.postFormData(
            API_CONFIG.ENDPOINTS.EDIT_IMAGE,
            formData,
            requireAuth
        );

        console.log('📥 系列图(有图)原始返回:', result);

        // 处理返回数据
        if (result.images && Array.isArray(result.images)) {
            result.images = result.images.map(img => {
                delete img.description;
                if (img.b64_json && !img.url) {
                    img.url = `data:image/jpeg;base64,${img.b64_json}`;
                    delete img.b64_json;
                }
                return img;
            });

            console.log('✅ 系列图(有图)处理后返回', result.images.length, '张图片');
        }

        return result;
    }

    /**
     * 系列图 - 无参考图（Pure Text Conversation）
     */
    async conversationWithoutImages(params) {
        const {
            prompt,
            aspectRatio = '1:1',
            taskId = this.generateTaskId()
        } = params;

        const requestData = {
            prompt,
            model_params: {
                response_modalities: ['Text', 'Image'],
                mode: 'conversation',  // ⚠️ 系列图需要mode字段
                aspect_ratio: aspectRatio
            },
            client_task_id: taskId
        };

        console.log('📤 系列图(纯文字)请求:', requestData);

        const requireAuth = apiClient.getToken() !== null;

        const result = await apiClient.post(
            API_CONFIG.ENDPOINTS.GENERATE_IMAGE,
            requestData,
            requireAuth
        );

        console.log('📥 系列图(纯文字)原始返回:', result);

        // 处理返回数据
        if (result.images && Array.isArray(result.images)) {
            result.images = result.images.map(img => {
                delete img.description;
                if (img.b64_json && !img.url) {
                    img.url = `data:image/jpeg;base64,${img.b64_json}`;
                    delete img.b64_json;
                }
                return img;
            });

            console.log('✅ 系列图(纯文字)处理后返回', result.images.length, '张图片');
        }

        return result;
    }

    /**
     * 智能模式检测
     * 根据系列图开关和上传图片数量自动选择模式
     * @param {Map} uploadedImages - 上传的图片Map
     * @param {boolean} seriesMode - 是否开启系列图开关
     * @returns {'text-to-image'|'image-to-image'|'series'}
     */
    detectMode(uploadedImages, seriesMode = false) {
        const imageCount = uploadedImages?.size || 0;

        // 优先级1: 系列图开关
        if (seriesMode) {
            return 'series';
        }

        // 优先级2: 无图 → 文生图
        if (imageCount === 0) {
            return 'text-to-image';
        }

        // 优先级3: 有图 → 图生图（支持多张参考图）
        return 'image-to-image';
    }

    /**
     * 统一生成接口（V2智能模式）
     * @param {Object} params
     * @param {string} params.prompt - 提示词
     * @param {Map} params.uploadedImages - 上传的图片Map
     * @param {number} params.count - 生成数量（系列图模式下此参数无效）
     * @param {string} params.aspectRatio - 画面比例
     * @param {boolean} params.seriesMode - 是否系列图模式
     * @param {Function} params.onProgress - 进度回调
     */
    async generate(params) {
        const {
            prompt,
            uploadedImages,
            count,
            aspectRatio,
            seriesMode = false,
            onProgress
        } = params;

        // 智能检测模式
        const mode = this.detectMode(uploadedImages, seriesMode);
        const taskId = this.generateTaskId();
        const imageCount = uploadedImages?.size || 0;

        console.log('🎨 生成模式:', mode, '| 任务ID:', taskId, '| 参考图数量:', imageCount);

        if (mode === 'series') {
            // 系列图模式（固定扣2币，返回1-4张）
            const imageFiles = Array.from(uploadedImages.values()).map(img => img.file);

            if (imageFiles.length > 0) {
                // 有参考图的系列图
                const result = await this.conversationWithImages({
                    prompt,
                    images: imageFiles,
                    aspectRatio,
                    taskId
                });

                // 删除description字段
                if (result.images) {
                    result.images.forEach(img => {
                        delete img.description;
                    });

                    // 🔑 调用onProgress回调（修复系列图不渲染的bug）
                    if (onProgress) {
                        onProgress({
                            status: 'completed',
                            images: result.images,
                            completed: result.images.length,
                            total: result.images.length
                        });
                    }
                }

                return result;
            } else {
                // 纯文字系列图
                const result = await this.conversationWithoutImages({
                    prompt,
                    aspectRatio,
                    taskId
                });

                // 删除description字段
                if (result.images) {
                    result.images.forEach(img => {
                        delete img.description;
                    });

                    // 🔑 调用onProgress回调（修复系列图不渲染的bug）
                    if (onProgress) {
                        onProgress({
                            status: 'completed',
                            images: result.images,
                            completed: result.images.length,
                            total: result.images.length
                        });
                    }
                }

                return result;
            }
        } else if (mode === 'text-to-image') {
            // 纯文生图（使用循环调用逻辑）
            return await this.textToImage({
                prompt,
                count,
                aspectRatio,
                taskId,
                onProgress
            });
        } else {
            // 图生图（支持多张参考图，使用循环调用逻辑）
            const imageFiles = Array.from(uploadedImages.values()).map(img => img.file);

            return await this.imageToImage({
                prompt,
                images: imageFiles,
                count,
                aspectRatio,
                taskId,
                onProgress
            });
        }
    }

    /**
     * 提示词优化
     * @param {Object} params
     * @param {string} params.prompt - 原始提示词
     * @param {string} params.mode - 生成模式（text-to-image/image-to-image/conversation）
     * @param {string} params.aspectRatio - 画面比例
     * @returns {Promise<Object>} - { optimized_prompt: string }
     */
    async optimizePrompt(params) {
        const {
            prompt,
            mode = 'text-to-image',
            aspectRatio = '1:1'
        } = params;

        console.log('[提示词优化] 开始优化:', { prompt, mode, aspectRatio });

        const formData = new FormData();
        formData.append('prompt', prompt);
        formData.append('mode', mode);
        formData.append('aspect_ratio', aspectRatio);

        try {
            const response = await fetch('/api/optimize-prompt', {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || '优化失败');
            }

            const result = await response.json();
            console.log('[提示词优化] 优化成功:', result);
            return result;
        } catch (error) {
            console.error('[提示词优化] 优化失败:', error);
            throw error;
        }
    }
}

// 创建全局实例
export const imageService = new ImageService();
