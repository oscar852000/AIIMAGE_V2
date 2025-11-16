/**
 * 图片生成UI模块
 * 负责生成界面、参数收集、进度显示、结果渲染
 */

import DOM from '../utils/dom.js';
import { truncateText, parseImageUrl, copyToClipboard } from '../utils/helpers.js';
import toast from '../utils/toast.js';
import confirmDialog from '../utils/confirm.js';

export class GeneratorUI {
    constructor(app, uploadManager) {
        this.app = app;
        this.uploadManager = uploadManager;

        // DOM元素
        this.promptInput = DOM.qs('#prompt-input');
        this.generateBtn = DOM.qs('#generate-btn-bottom');
        this.optimizeBtn = DOM.qs('#optimize-prompt-btn');
        this.resultsContainer = DOM.qs('#results-container');

        // 系列图模式
        this.seriesToggle = DOM.qs('#series-mode-toggle');
        this.aspectRatioGroup = DOM.qs('#aspect-ratio-group');
        this.imageCountGroup = DOM.qs('#image-count-group');

        this.init();
    }

    /**
     * 初始化
     */
    init() {
        // 生成按钮
        if (this.generateBtn) {
            this.generateBtn.addEventListener('click', () => this.handleGenerate());
        }

        // 优化按钮
        if (this.optimizeBtn) {
            this.optimizeBtn.addEventListener('click', () => this.handleOptimizePrompt());
        }

        // 系列图模式切换
        if (this.seriesToggle) {
            this.seriesToggle.addEventListener('click', () => this.handleSeriesModeToggle());
        }

        // 设置按钮组
        this.setupButtonGroup('image-count-group');
        this.setupAspectRatioDropdown();

        // 任务卡片操作（使用事件委托）
        if (this.resultsContainer) {
            this.resultsContainer.addEventListener('click', (e) => this.handleTaskCardAction(e));
        }
    }

    /**
     * 设置按钮组通用逻辑
     */
    setupButtonGroup(groupId, isDropdownItem = false) {
        const group = DOM.qs(`#${groupId}`);
        if (!group) return;

        group.addEventListener('click', (e) => {
            const button = e.target.closest('button');
            if (!button) return;

            // 重置所有按钮
            group.querySelectorAll('button').forEach(btn => {
                btn.dataset.active = 'false';
                if (btn.classList.contains('image-count-btn')) {
                    btn.classList.remove('bg-black', 'text-white', 'font-semibold', 'ring-2', 'ring-black');
                    btn.classList.add('bg-white/50', 'hover:bg-white/80');
                }
                if (btn.classList.contains('aspect-ratio-btn')) {
                    btn.classList.remove('bg-black', 'border-black');
                    btn.querySelector('span')?.classList.remove('bg-white');
                    btn.querySelector('span')?.classList.add('bg-gray-500');
                }
            });

            // 激活当前按钮
            button.dataset.active = 'true';
            if (button.classList.contains('image-count-btn')) {
                button.classList.add('bg-black', 'text-white', 'font-semibold', 'ring-2', 'ring-black');
                button.classList.remove('bg-white/50', 'hover:bg-white/80');
            }
            if (button.classList.contains('aspect-ratio-btn')) {
                button.classList.add('bg-black', 'border-black');
                button.querySelector('span')?.classList.add('bg-white');
                button.querySelector('span')?.classList.remove('bg-gray-500');
            }

            // 下拉菜单：更新显示并关闭
            if (isDropdownItem) {
                const displaySpan = DOM.qs('#current-aspect-ratio');
                const dropdown = DOM.qs('#aspect-ratio-dropdown');
                if (displaySpan && dropdown) {
                    const ratioText = button.dataset.ratio;
                    let iconHTML = '';
                    if (ratioText === '1:1') iconHTML = '<span class="w-4 h-4 bg-gray-600 rounded-sm inline-block"></span>';
                    else if (ratioText === '16:9') iconHTML = '<span class="w-5 h-3 bg-gray-600 rounded-sm inline-block"></span>';
                    else if (ratioText === '3:4') iconHTML = '<span class="w-3 h-4 bg-gray-600 rounded-sm inline-block"></span>';
                    else if (ratioText === '4:3') iconHTML = '<span class="w-4 h-3 bg-gray-600 rounded-sm inline-block"></span>';
                    else if (ratioText === '9:16') iconHTML = '<span class="w-3 h-5 bg-gray-600 rounded-sm inline-block"></span>';

                    displaySpan.innerHTML = `${iconHTML} <span class="font-medium v2-sidebar-text">${ratioText}</span>`;
                    dropdown.classList.add('hidden');
                }
            }
        });
    }

    /**
     * 设置尺寸下拉菜单
     */
    setupAspectRatioDropdown() {
        const aspectRatioBtn = DOM.qs('#current-aspect-ratio-btn');
        const aspectRatioDropdown = DOM.qs('#aspect-ratio-dropdown');
        const aspectRatioIconBtn = DOM.qs('#aspect-ratio-icon-btn');

        if (aspectRatioBtn && aspectRatioDropdown) {
            aspectRatioBtn.addEventListener('click', () => {
                aspectRatioDropdown.classList.toggle('hidden');
            });
        }

        if (aspectRatioIconBtn) {
            aspectRatioIconBtn.addEventListener('click', () => {
                DOM.qs('#sidebar-toggle-btn')?.click();
                setTimeout(() => {
                    aspectRatioBtn?.click();
                }, 300);
            });
        }

        this.setupButtonGroup('aspect-ratio-group', true);
    }

    /**
     * 系列图模式切换
     */
    handleSeriesModeToggle() {
        const isChecked = this.seriesToggle.getAttribute('aria-checked') === 'true';
        const newState = !isChecked;
        this.seriesToggle.setAttribute('aria-checked', newState);

        if (newState) {
            // 切换到系列图模式
            console.log('✨ 切换到系列图模式');

            // 1. 重置尺寸到1:1
            const ratioButtons = this.aspectRatioGroup.querySelectorAll('button');
            ratioButtons.forEach(btn => {
                btn.dataset.active = 'false';
                btn.classList.remove('bg-black', 'border-black');
                btn.querySelector('span')?.classList.remove('bg-white');
                btn.querySelector('span')?.classList.add('bg-gray-500');

                if (btn.dataset.ratio === '1:1') {
                    btn.dataset.active = 'true';
                    btn.classList.add('bg-black', 'border-black');
                    btn.querySelector('span')?.classList.add('bg-white');
                    btn.querySelector('span')?.classList.remove('bg-gray-500');
                }
            });

            // 更新下拉显示
            const displaySpan = DOM.qs('#current-aspect-ratio');
            if (displaySpan) {
                displaySpan.innerHTML = '<span class="w-4 h-4 bg-gray-600 rounded-sm inline-block"></span> <span class="font-medium v2-sidebar-text">1:1</span>';
            }

            // 2. 重置数量到1
            const countButtons = this.imageCountGroup.querySelectorAll('button');
            countButtons.forEach(btn => {
                btn.dataset.active = 'false';
                btn.classList.remove('bg-black', 'text-white', 'font-semibold', 'ring-2', 'ring-black');
                btn.classList.add('bg-white/50', 'hover:bg-white/80');

                if (btn.textContent.trim() === '1') {
                    btn.dataset.active = 'true';
                    btn.classList.add('bg-black', 'text-white', 'font-semibold', 'ring-2', 'ring-black');
                    btn.classList.remove('bg-white/50', 'hover:bg-white/80');
                }
            });

            // 3. 禁用控件
            this.aspectRatioGroup.style.opacity = '0.5';
            this.aspectRatioGroup.style.pointerEvents = 'none';
            this.imageCountGroup.style.opacity = '0.5';
            this.imageCountGroup.style.pointerEvents = 'none';

            // 4. 显示提示
            toast.info('系列图模式已开启。尺寸和数量由模型自动决定（固定消耗2粒子币）', 4000);
        } else {
            // 切换回普通模式
            console.log('🔄 切换回普通模式');

            // 重新启用控件
            this.aspectRatioGroup.style.opacity = '1';
            this.aspectRatioGroup.style.pointerEvents = 'auto';
            this.imageCountGroup.style.opacity = '1';
            this.imageCountGroup.style.pointerEvents = 'auto';
        }
    }

    /**
     * 获取当前参数
     */
    getGenerationParams() {
        const promptText = this.promptInput.value.trim();

        const countBtn = DOM.qs('#image-count-group button[data-active="true"]');
        const count = countBtn ? parseInt(countBtn.textContent) : 1;

        const ratioBtn = DOM.qs('#aspect-ratio-group button[data-active="true"]');
        const aspectRatio = ratioBtn ? ratioBtn.dataset.ratio : '1:1';

        const seriesMode = this.seriesToggle.getAttribute('aria-checked') === 'true';

        // 获取上传的图片
        const uploadedFiles = this.uploadManager.getFiles();

        // 判断模式
        let mode = 'text-to-image';
        if (uploadedFiles.length > 0) {
            mode = seriesMode ? 'conversation' : 'image-to-image';
        } else if (seriesMode) {
            mode = 'conversation';
        }

        return {
            prompt: promptText,
            count,
            aspectRatio,
            seriesMode,
            mode,
            uploadedFiles
        };
    }

    /**
     * 处理图片生成
     */
    async handleGenerate() {
        const params = this.getGenerationParams();

        // 验证输入
        if (!params.prompt) {
            toast.warning('请输入提示词');
            return;
        }

        // 移除占位提示
        const placeholder = this.resultsContainer.querySelector('.text-center');
        if (placeholder) placeholder.remove();

        // 创建任务卡片
        const taskCard = this.createTaskCard(params);
        this.resultsContainer.insertBefore(taskCard, this.resultsContainer.firstChild);

        const grid = taskCard.querySelector('.grid');

        try {
            console.log('🎨 开始生成图片...', params);

            // 调用生成API
            const result = await this.app.handleGenerate({
                prompt: params.prompt,
                count: params.count,
                aspectRatio: params.aspectRatio,
                mode: params.mode,
                onProgress: (progress) => this.onProgress(progress, grid, params.aspectRatio)
            });

            if (!result.success) {
                // 处理失败
                if (result.message === 'TIMEOUT_504') {
                    // 504超时特殊处理
                    grid.innerHTML = `
                        <div class="col-span-full text-center p-8">
                            <span class="material-symbols-outlined text-6xl text-yellow-500 mb-4">schedule</span>
                            <div class="text-yellow-600 text-lg font-medium mb-2">⏱️ 图片生成时间较长，正在后台处理中</div>
                            <div class="text-gray-500 mb-4">${result.userMessage || '请稍后刷新页面查看历史记录'}</div>
                            <button onclick="location.reload()" class="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors">
                                刷新页面
                            </button>
                        </div>
                    `;
                } else {
                    throw new Error(result.message || '生成失败');
                }
            } else {
                console.log('✅ 生成成功！');
            }
        } catch (error) {
            console.error('❌ 生成失败:', error);
            grid.innerHTML = `
                <div class="col-span-full text-center p-8">
                    <span class="material-symbols-outlined text-6xl text-red-500 mb-4">error</span>
                    <div class="text-red-600">${error.message || '生成失败，请重试'}</div>
                </div>
            `;
            toast.error(error.message || '生成失败');
        }
    }

    /**
     * 创建任务卡片
     */
    createTaskCard(params) {
        const taskCard = DOM.create('div', 'space-y-4');
        taskCard.dataset.originalPrompt = params.prompt;
        taskCard.dataset.aspectRatio = params.aspectRatio;
        taskCard.dataset.count = params.count;
        taskCard.dataset.seriesMode = params.seriesMode;

        const header = DOM.create('div', 'flex justify-between items-center');
        const promptDisplay = truncateText(params.prompt, 40);
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

        const grid = DOM.create('div', 'grid grid-cols-2 md:grid-cols-4 gap-4');

        // 显示加载占位符
        for (let i = 0; i < params.count; i++) {
            const placeholder = DOM.create('div',
                'v2-image-wrapper w-full rounded-lg bg-gray-200 dark:bg-zinc-800 animate-pulse flex items-center justify-center',
                '<span class="material-symbols-outlined text-4xl text-gray-400">image</span>'
            );
            placeholder.setAttribute('data-aspect', params.aspectRatio);
            grid.appendChild(placeholder);
        }

        taskCard.appendChild(header);
        taskCard.appendChild(grid);

        return taskCard;
    }

    /**
     * 进度回调
     */
    onProgress(progress, grid, aspectRatio) {
        console.log('📊 生成进度:', progress);

        // 支持 processing 和 completed 状态（兼容系列图）
        if ((progress.status === 'processing' || progress.status === 'completed') &&
            progress.images && progress.images.length > 0) {

            // 清空占位符并渲染图片
            grid.innerHTML = '';

            progress.images.forEach((imageData, index) => {
                const imageWrapper = this.createImageElement(imageData, index, aspectRatio);
                grid.appendChild(imageWrapper);
            });
        }
    }

    /**
     * 创建图片元素
     */
    createImageElement(imageData, index, aspectRatio) {
        let imageUrl = '';

        if (typeof imageData === 'string') {
            imageUrl = imageData;
        } else if (imageData && imageData.url) {
            imageUrl = imageData.url;
        } else if (imageData && imageData.thumbnail_url) {
            imageUrl = imageData.thumbnail_url;
        } else if (imageData && imageData.b64_json) {
            imageUrl = `data:image/png;base64,${imageData.b64_json}`;
        }

        const imageWrapper = DOM.create('div',
            'v2-image-wrapper relative group w-full rounded-xl flex-shrink-0 overflow-hidden bg-gray-100'
        );
        imageWrapper.setAttribute('data-aspect', aspectRatio);

        const img = DOM.create('img');
        img.src = parseImageUrl(imageUrl);
        img.alt = `生成的图片 ${index + 1}`;
        img.className = 'w-full h-full object-cover';

        const overlay = DOM.create('div',
            'absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-300 flex items-center justify-center gap-4 opacity-0 group-hover:opacity-100',
            `
                <span class="material-symbols-outlined text-white text-2xl cursor-pointer hover:scale-125 transition-transform"
                    data-action="view">
                    visibility
                </span>
                <span class="material-symbols-outlined text-white text-2xl cursor-pointer hover:scale-125 transition-transform"
                    data-action="download">
                    download
                </span>
            `
        );

        // 绑定图片操作事件
        overlay.addEventListener('click', (e) => {
            const action = e.target.closest('[data-action]')?.dataset.action;
            if (action === 'view') {
                window.openImageViewer(imageUrl);
            } else if (action === 'download') {
                window.location.href = imageUrl;
            }
        });

        imageWrapper.appendChild(img);
        imageWrapper.appendChild(overlay);

        return imageWrapper;
    }

    /**
     * 处理任务卡片操作（事件委托）
     */
    async handleTaskCardAction(e) {
        const menuItem = e.target.closest('.v2-dropdown-item');
        if (!menuItem) return;

        const action = menuItem.dataset.action;
        const taskCard = e.target.closest('[data-original-prompt]');
        if (!taskCard) return;

        const originalPrompt = taskCard.dataset.originalPrompt || '';

        if (action === 'copy') {
            // 复制提示词
            try {
                await copyToClipboard(originalPrompt);
                toast.success('提示词已复制到剪贴板');
            } catch (error) {
                toast.error('复制失败');
            }
        } else if (action === 'delete') {
            // 删除任务
            const confirmed = await confirmDialog.show('确定删除此记录吗？', {
                type: 'danger',
                okText: '删除',
                cancelText: '取消'
            });

            if (confirmed) {
                const taskId = taskCard.dataset.taskId;

                // 如果有task_id，调用后端API删除
                if (taskId) {
                    try {
                        await this.app.history.deleteTask(taskId);
                        taskCard.remove();
                        toast.success('删除成功');
                    } catch (error) {
                        console.error('删除失败:', error);
                        toast.error('删除失败');
                    }
                } else {
                    // 本地生成的结果，直接移除DOM
                    taskCard.remove();
                }
            }
        } else if (action === 'regenerate') {
            // 重新生成
            toast.info('正在重新生成...');
            // TODO: 实现重新生成逻辑
        }
    }

    /**
     * 处理提示词优化
     */
    async handleOptimizePrompt() {
        const params = this.getGenerationParams();

        if (!params.prompt) {
            toast.warning('请先输入提示词');
            return;
        }

        try {
            console.log('✨ 开始优化提示词...');
            toast.info('正在优化提示词...', 2000);

            const result = await this.app.handleOptimizePrompt({
                prompt: params.prompt,
                mode: params.mode,
                aspectRatio: params.aspectRatio
            });

            if (result.success && result.data.optimized_prompt) {
                this.promptInput.value = result.data.optimized_prompt;
                console.log('✅ 提示词优化成功！');
                toast.success('提示词已优化！');
            } else {
                console.error('❌ 优化失败:', result.message);
                toast.error('优化失败: ' + (result.message || '未知错误'));
            }
        } catch (error) {
            console.error('❌ 优化异常:', error);
            toast.error('优化失败: ' + error.message);
        }
    }
}

export default GeneratorUI;
