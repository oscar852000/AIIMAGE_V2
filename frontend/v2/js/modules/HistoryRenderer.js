/**
 * 历史记录渲染器
 * 负责骨架屏、任务卡片渲染和懒加载
 */

import DOM from '../utils/dom.js';
import { truncateText } from '../utils/helpers.js';
import toast from '../utils/toast.js';

export class HistoryRenderer {
    constructor(historyService) {
        this.historyService = historyService;
        this.container = DOM.qs('#results-container');

        // 懒加载状态
        this.state = {
            loadedTaskIds: new Set(),
            loadingTaskIds: new Set(),
            observer: null,
            maxConcurrent: 2,
            activeLoads: 0
        };
    }

    /**
     * 显示骨架屏
     */
    showSkeletons(count = 4) {
        if (!this.container) return;

        console.log(`🎨 显示 ${count} 个骨架屏卡片`);

        // 移除占位提示
        const placeholder = this.container.querySelector('.text-center');
        if (placeholder) placeholder.remove();

        // 创建骨架屏卡片
        for (let i = 0; i < count; i++) {
            const skeleton = DOM.create('div', 'v2-skeleton-card space-y-4', `
                <div class="v2-skeleton-header"></div>
                <div class="v2-skeleton-prompt"></div>
                <div class="v2-skeleton-images"></div>
                <div class="v2-skeleton-actions"></div>
            `);
            this.container.appendChild(skeleton);
        }
    }

    /**
     * 清除骨架屏
     */
    clearSkeletons() {
        if (!this.container) return;

        const skeletons = this.container.querySelectorAll('.v2-skeleton-card');
        skeletons.forEach(skeleton => skeleton.remove());
        console.log(`🗑️ 已清除 ${skeletons.length} 个骨架屏卡片`);
    }

    /**
     * 渲染任务卡片（Lite模式：只显示占位符，不加载图片）
     */
    renderTasks(tasks) {
        if (!tasks || tasks.length === 0) {
            console.log('📜 无历史记录');
            this.clearSkeletons();
            return;
        }

        console.log('🎨 开始渲染任务卡片（Lite模式）...', tasks.length, '条');

        // 🔍 调试：输出第一个图生图任务的完整数据
        const imageToImageTask = tasks.find(t => t.mode === 'image-to-image');
        if (imageToImageTask) {
            console.log('🔍 图生图任务数据检查:', {
                task_id: imageToImageTask.task_id,
                mode: imageToImageTask.mode,
                has_reference_images: imageToImageTask.has_reference_images,
                reference_images_length: imageToImageTask.reference_images?.length,
                complete_task: imageToImageTask
            });
        }

        if (!this.container) {
            console.warn('⚠️ results-container 元素未找到');
            return;
        }

        // 清除骨架屏
        this.clearSkeletons();

        // 渲染每个任务卡片（只有占位符）
        tasks.forEach((task, index) => {
            const taskGroup = this.createTaskCard(task);
            this.container.appendChild(taskGroup);
            console.log(`  ✅ 任务 ${index + 1}/${tasks.length}: ${task.task_id} 卡片已创建（占位符）`);
        });

        console.log('✅ 任务卡片渲染完成（Lite模式）');
    }

    /**
     * 创建任务卡片DOM
     */
    createTaskCard(task) {
        const taskGroup = DOM.create('div', 'space-y-4');
        taskGroup.dataset.taskId = task.task_id;
        taskGroup.dataset.originalPrompt = task.prompt || '';
        taskGroup.dataset.aspectRatio = task.aspect_ratio || '1:1';
        taskGroup.dataset.count = task.image_count || 4;
        taskGroup.dataset.seriesMode = task.mode === 'conversation' ? 'true' : 'false';
        // 🔑 修复：不依赖 has_reference_images 字段，直接根据 mode 判断（旧版逻辑）
        taskGroup.dataset.hasReferenceImages = (task.mode === 'image-to-image' || task.mode === 'conversation') ? 'true' : 'false';
        taskGroup.dataset.lazyLoad = 'pending'; // 标记为待加载

        // 🔍 调试：记录是否有参考图片
        if (task.mode === 'image-to-image' || task.mode === 'conversation') {
            console.log(`  📌 ${task.mode}任务: ${task.task_id}, 根据mode设置hasReferenceImages=true`);
        }

        // 创建header
        const header = DOM.create('div', 'flex justify-between items-center');
        const promptDisplay = truncateText(task.prompt || '无提示词', 40);
        header.innerHTML = `
            <p class="text-sm text-gray-500 dark:text-gray-400">
                ${promptDisplay}
            </p>
            <div class="relative v2-task-menu-wrapper">
                <button class="v2-task-menu-btn p-2 rounded-full hover:bg-gray-200 dark:hover:bg-zinc-700 transition-colors">
                    <span class="material-symbols-outlined text-base">more_horiz</span>
                </button>
                <div class="v2-dropdown-menu">
                    <div class="v2-dropdown-item" data-action="regenerate" title="重新生成">
                        <span class="material-symbols-outlined">refresh</span>
                    </div>
                    <div class="v2-dropdown-item" data-action="copy" title="复制提示词">
                        <span class="material-symbols-outlined">content_copy</span>
                    </div>
                    <div class="v2-dropdown-item" data-action="delete" title="删除任务">
                        <span class="material-symbols-outlined">delete</span>
                    </div>
                </div>
            </div>
        `;

        // 创建图片网格（只显示占位符）
        const grid = DOM.create('div', 'grid grid-cols-2 md:grid-cols-4 gap-4');

        const imageCount = task.image_count || 4;
        for (let i = 0; i < imageCount; i++) {
            const placeholder = DOM.create('div',
                'v2-image-wrapper w-full rounded-lg bg-gray-200 dark:bg-zinc-800 animate-pulse flex items-center justify-center',
                '<span class="material-symbols-outlined text-4xl text-gray-400">image</span>'
            );
            placeholder.setAttribute('data-aspect', task.aspect_ratio || '1:1');
            grid.appendChild(placeholder);
        }

        taskGroup.appendChild(header);
        taskGroup.appendChild(grid);

        return taskGroup;
    }

    /**
     * 初始化历史记录懒加载（Intersection Observer）
     */
    initLazyLoad() {
        console.log('🔍 初始化Intersection Observer懒加载...');

        if (!this.container) {
            console.warn('⚠️ results-container 元素未找到');
            return;
        }

        // 创建Intersection Observer
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const taskGroup = entry.target;
                    const taskId = taskGroup.dataset.taskId;
                    const lazyLoadStatus = taskGroup.dataset.lazyLoad;

                    // 如果还没加载，且没有正在加载
                    if (taskId && lazyLoadStatus === 'pending' &&
                        !this.state.loadedTaskIds.has(taskId) &&
                        !this.state.loadingTaskIds.has(taskId)) {

                        console.log(`👀 任务进入视口: ${taskId}，开始加载图片...`);
                        this.loadTaskImages(taskGroup);
                    }
                }
            });
        }, {
            root: null,
            rootMargin: '100px', // 提前100px开始加载
            threshold: 0.01
        });

        // 观察所有待加载的任务卡片
        const taskCards = this.container.querySelectorAll('[data-lazy-load="pending"]');
        taskCards.forEach(card => observer.observe(card));

        this.state.observer = observer;

        console.log(`✅ Intersection Observer已初始化，观察 ${taskCards.length} 个任务卡片`);
    }

    /**
     * 加载单个任务的图片（异步加载）
     */
    async loadTaskImages(taskGroup) {
        const taskId = taskGroup.dataset.taskId;
        const aspectRatio = taskGroup.dataset.aspectRatio || '1:1';

        // 检查并发限制
        while (this.state.activeLoads >= this.state.maxConcurrent) {
            await new Promise(resolve => setTimeout(resolve, 100));
        }

        // 标记为加载中
        this.state.loadingTaskIds.add(taskId);
        this.state.activeLoads++;
        taskGroup.dataset.lazyLoad = 'loading';

        try {
            console.log(`🖼️ 开始加载任务图片: ${taskId}`);

            // 调用API加载图片
            const detail = await this.historyService.getTaskDetail(taskId);

            if (detail && detail.task && detail.task.generated_images) {
                let images = [];

                // 解析图片数据
                if (typeof detail.task.generated_images === 'string') {
                    try {
                        images = JSON.parse(detail.task.generated_images);
                    } catch (e) {
                        console.error('  ❌ 解析图片数据失败:', e);
                    }
                } else if (Array.isArray(detail.task.generated_images)) {
                    images = detail.task.generated_images;
                }

                if (images.length > 0) {
                    console.log(`  ✅ 已加载 ${images.length} 张图片`);

                    // 渲染图片
                    const grid = taskGroup.querySelector('.grid');
                    if (grid) {
                        this.renderImages(grid, images, taskId, aspectRatio);

                        // 标记为已加载
                        taskGroup.dataset.lazyLoad = 'loaded';
                        this.state.loadedTaskIds.add(taskId);
                    }
                } else {
                    console.log(`  ⚠️ 任务 ${taskId} 没有图片`);
                    taskGroup.dataset.lazyLoad = 'empty';
                }
            }
        } catch (error) {
            console.error(`  ❌ 加载任务 ${taskId} 的图片失败:`, error);
            taskGroup.dataset.lazyLoad = 'error';
        } finally {
            // 释放并发槽位
            this.state.loadingTaskIds.delete(taskId);
            this.state.activeLoads--;
        }
    }

    /**
     * 渲染图片到网格
     */
    renderImages(grid, images, taskId, aspectRatio) {
        grid.innerHTML = ''; // 清空占位符

        images.forEach((imageData, index) => {
            let imageUrl = '';

            // 解析图片URL
            if (typeof imageData === 'string') {
                imageUrl = imageData;
            } else if (imageData && imageData.url) {
                imageUrl = imageData.url;
            } else if (imageData && imageData.thumbnail_url) {
                imageUrl = imageData.thumbnail_url;
            } else if (imageData && imageData.b64_json) {
                imageUrl = `data:image/png;base64,${imageData.b64_json}`;
            }

            if (!imageUrl) return;

            const imageWrapper = this.createImageElement(imageUrl, taskId, index, aspectRatio);
            grid.appendChild(imageWrapper);
        });
    }

    /**
     * 创建图片元素
     */
    createImageElement(imageUrl, taskId, index, aspectRatio) {
        const imageWrapper = DOM.create('div',
            'v2-image-wrapper relative group w-full rounded-xl flex-shrink-0 overflow-hidden bg-gray-100'
        );
        imageWrapper.setAttribute('data-aspect', aspectRatio);

        const img = DOM.create('img');
        img.src = imageUrl;
        img.alt = `生成的图片 ${index + 1}`;
        img.className = 'w-full h-full object-cover';

        const overlay = DOM.create('div',
            'absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-300 flex items-center justify-center gap-4 opacity-0 group-hover:opacity-100',
            `
                <span class="material-symbols-outlined text-white text-2xl cursor-pointer hover:scale-125 transition-transform"
                    data-action="view"
                    onclick="openImageWithOriginal('${taskId}', ${index}, '${imageUrl}')">
                    visibility
                </span>
                <span class="material-symbols-outlined text-white text-2xl cursor-pointer hover:scale-125 transition-transform"
                    data-action="edit"
                    onclick="showInfo('编辑功能开发中')">
                    edit
                </span>
                <span class="material-symbols-outlined text-white text-2xl cursor-pointer hover:scale-125 transition-transform"
                    data-action="video"
                    onclick="showInfo('视频功能开发中')">
                    movie
                </span>
                <span class="material-symbols-outlined text-white text-2xl cursor-pointer hover:scale-125 transition-transform"
                    data-action="favorite"
                    onclick="showInfo('收藏功能开发中')">
                    favorite
                </span>
                <span class="material-symbols-outlined text-white text-2xl cursor-pointer hover:scale-125 transition-transform"
                    data-action="download"
                    onclick="downloadHistoryImage('${imageUrl}', '${taskId}_${index}')">
                    download
                </span>
            `
        );

        imageWrapper.appendChild(img);
        imageWrapper.appendChild(overlay);

        return imageWrapper;
    }

    /**
     * 销毁Observer
     */
    destroy() {
        if (this.state.observer) {
            this.state.observer.disconnect();
            this.state.observer = null;
        }
    }
}

export default HistoryRenderer;
