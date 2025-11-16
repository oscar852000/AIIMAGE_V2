/**
 * Legacy功能模块 - 过渡期代码（已优化）
 *
 * 说明：
 * - 这个文件包含从index.html迁移过来的内联JavaScript代码
 * - 已删除与现有模块重复的代码，避免冗余
 * - 未来会逐步重构剩余功能为模块化代码
 *
 * 迁移时间：2025-11-15
 * 优化时间：2025-11-15
 * 原始位置：index.html 第454-2393行
 * 原始代码：1940行 → 优化后：~1300行（删除约34%重复代码）
 *
 * 当前包含功能：
 * - ✅ 图片上传系统（主上传框、动态添加行、预览、删除）
 * - ✅ 图片生成系统（参数收集、生成按钮、流式进度）
 * - ✅ 重新生成功能（完整逻辑，包括参考图恢复）
 * - ✅ 侧边栏折叠系统
 * - ✅ 系列图模式切换
 * - ✅ 提示词优化
 * - ✅ 按钮组逻辑
 * - ✅ 任务卡片菜单
 *
 * 已删除功能（现由模块提供）：
 * - ❌ 历史记录懒加载系统 → HistoryRenderer.js
 * - ❌ Toast提示系统 → toast.js
 * - ❌ 图片查看器 → ImageViewer.js
 * - ❌ 认证弹窗 → AuthUI.js
 */

export function initLegacyFeatures() {
    console.log('🔧 初始化Legacy功能模块...');

    // 等待DOM加载完成
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    function init() {
        console.log('✅ Legacy模块DOM已加载，开始初始化...');

        // ====================================================================================
        // 📦 以下是从index.html迁移的内联代码（已优化）
        // ====================================================================================
        // ⚠️ 已删除历史记录懒加载系统（showSkeletonCards, renderHistoryTasksLite, initHistoryLazyLoad）
        // ✅ 现由 HistoryRenderer.js 模块提供（通过app.js全局桥接函数）

                // --- 占位提示函数 ---
                function showComingSoon(featureName) {
                    showInfo(`${featureName} 功能开发中，敬请期待！`);
                }
        
                // ⚠️ 已删除Toast提示系统（showToast, showSuccess, showError, showWarning, showInfo）
                // ✅ 现由 toast.js 模块提供（通过app.js全局桥接函数）

        
                // ⚠️ 已删除图片查看器（openImageViewer, updateImageViewer, closeImageViewer, openImageWithOriginal, downloadViewerImage）
                // ✅ 现由 ImageViewer.js 模块提供（通过app.js全局桥接函数）
        
                // --- 按钮组通用逻辑 ---
                function setupButtonGroup(groupId, isDropdownItem = false) {
                    const group = document.getElementById(groupId);
                    if (!group) return;
        
                    group.addEventListener('click', (e) => {
                        const button = e.target.closest('button');
                        if (!button) return;
        
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
        
                        if (isDropdownItem) {
                            const wrapper = group.closest('#aspect-ratio-wrapper');
                            const displaySpan = wrapper.querySelector('#current-aspect-ratio-display');
                            const dropdown = wrapper.querySelector('#aspect-ratio-dropdown');
                            
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
                    });
                }
        
                // 1. 设置数量按钮组
                setupButtonGroup('image-count-group');
                
                // 2. 设置尺寸下拉菜单
                const aspectRatioBtn = document.getElementById('current-aspect-ratio-btn');
                const aspectRatioDropdown = document.getElementById('aspect-ratio-dropdown');
                const aspectRatioIconBtn = document.getElementById('aspect-ratio-icon-btn');
                
                aspectRatioBtn.addEventListener('click', () => {
                    aspectRatioDropdown.classList.toggle('hidden');
                });
                aspectRatioIconBtn.addEventListener('click', () => {
                     document.getElementById('sidebar-toggle-btn').click();
                     setTimeout(() => {
                        aspectRatioBtn.click();
                     }, 300);
                });
                setupButtonGroup('aspect-ratio-group', true);
        
                // 3. 动态生成结果
                const generateBtnBottom = document.getElementById('generate-btn-bottom');
                const resultsContainer = document.getElementById('results-container');
                const promptInput = document.getElementById('prompt-input');
                const sidebar = document.getElementById('sidebar');

                // 🎨 提示词输入框自适应高度功能
                function adjustTextareaHeight() {
                    // 重置高度以获取正确的scrollHeight
                    promptInput.style.height = 'auto';

                    // 获取内容高度
                    const scrollHeight = promptInput.scrollHeight;
                    const minHeight = 64; // 最小高度64px

                    // 🔑 根据侧边栏折叠状态动态调整最大高度
                    const isCollapsed = sidebar?.classList.contains('is-collapsed');
                    const maxHeight = isCollapsed
                        ? window.innerHeight - 250  // 折叠后：允许更高
                        : 208;  // 未折叠：7-8行高度

                    // 计算新高度
                    let newHeight = Math.max(minHeight, Math.min(scrollHeight, maxHeight));

                    // 设置新高度
                    promptInput.style.height = newHeight + 'px';

                    // 如果超过单行，添加expanded类（调整圆角）
                    if (newHeight > minHeight) {
                        promptInput.classList.add('is-expanded');
                    } else {
                        promptInput.classList.remove('is-expanded');
                    }
                }

                // 监听输入事件
                promptInput.addEventListener('input', adjustTextareaHeight);

                // 监听粘贴事件
                promptInput.addEventListener('paste', () => {
                    setTimeout(adjustTextareaHeight, 10);
                });

                // 初始化时调整一次
                adjustTextareaHeight();

                // 🔑 监听侧边栏折叠事件，重新调整输入框高度
                const sidebarObserver = new MutationObserver(() => {
                    adjustTextareaHeight();
                });
                if (sidebar) {
                    sidebarObserver.observe(sidebar, {
                        attributes: true,
                        attributeFilter: ['class']
                    });
                }

                // 3.5 AI提示词优化功能
                const handleOptimizePrompt = async () => {
                    const promptText = promptInput.value.trim();
        
                    if (!promptText) {
                        showWarning('请先输入提示词');
                        return;
                    }
        
                    // 获取当前参数
                    const ratioBtn = document.querySelector('#aspect-ratio-group button[data-active="true"]');
                    const aspectRatio = ratioBtn ? ratioBtn.dataset.ratio : '1:1';
                    const seriesMode = seriesToggle.getAttribute('aria-checked') === 'true';
        
                    // 判断模式
                    let mode = 'text-to-image';
                    if (uploadedImages.size > 0) {
                        mode = seriesMode ? 'conversation' : 'image-to-image';
                    } else if (seriesMode) {
                        mode = 'conversation';
                    }
        
                    try {
                        console.log('✨ 开始优化提示词...');
                        showInfo('正在优化提示词...', 2000);
        
                        const result = await window.V2App.handleOptimizePrompt({
                            prompt: promptText,
                            mode: mode,
                            aspectRatio: aspectRatio
                        });
        
                        if (result.success && result.data.optimized_prompt) {
                            promptInput.value = result.data.optimized_prompt;
                            console.log('✅ 提示词优化成功！');
                            showSuccess('提示词已优化！');
                        } else {
                            console.error('❌ 优化失败:', result.message);
                            showError('优化失败: ' + (result.message || '未知错误'));
                        }
                    } catch (error) {
                        console.error('❌ 优化异常:', error);
                        showError('优化失败: ' + error.message);
                    }
                };
        
                generateBtnBottom.addEventListener('click', async () => {
                    const promptText = promptInput.value.trim();
        
                    // 验证输入
                    if (!promptText) {
                        showWarning('请输入提示词');
                        return;
                    }
        
                    // 移除占位提示
                    const placeholder = resultsContainer.querySelector('.text-center');
                    if (placeholder) {
                        placeholder.remove();
                    }
        
                    // 获取当前选择的参数
                    const countBtn = document.querySelector('#image-count-group button[data-active="true"]');
                    const count = countBtn ? parseInt(countBtn.textContent) : 1;
        
                    const ratioBtn = document.querySelector('#aspect-ratio-group button[data-active="true"]');
                    const aspectRatio = ratioBtn ? ratioBtn.dataset.ratio : '1:1';
        
                    const seriesMode = seriesToggle.getAttribute('aria-checked') === 'true';
        
                    // 创建加载中的任务卡片
                    const newResultGroup = document.createElement('div');
                    newResultGroup.className = 'space-y-4';
                    // 🔑 保存原始提示词到data属性，用于复制和再次生成
                    newResultGroup.dataset.originalPrompt = promptText;
                    newResultGroup.dataset.aspectRatio = aspectRatio;
                    newResultGroup.dataset.count = count;
                    newResultGroup.dataset.seriesMode = seriesMode;
                    // 🔑 保存是否有参考图片的标记（用于重新生成时恢复图片）
                    newResultGroup.dataset.hasReferenceImages = (uploadedImages.size > 0) ? 'true' : 'false';
        
                    const header = document.createElement('div');
                    header.className = 'flex justify-between items-center';
                    header.innerHTML = `
                        <p class="text-sm text-gray-500 dark:text-gray-400">
                            ${promptText.substring(0, 40)}${promptText.length > 40 ? '...' : ''}
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
        
                    const grid = document.createElement('div');
                    grid.className = 'grid grid-cols-2 md:grid-cols-4 gap-4';
        
                    // 显示加载占位符
                    for (let i = 0; i < count; i++) {
                        const loadingPlaceholder = document.createElement('div');
                        // ⚠️ 关键修改：使用 v2-image-wrapper 类和 data-aspect 属性（复用旧版逻辑）
                        loadingPlaceholder.className = 'v2-image-wrapper w-full rounded-lg bg-gray-200 dark:bg-zinc-800 animate-pulse flex items-center justify-center';
                        loadingPlaceholder.setAttribute('data-aspect', aspectRatio);  // 🔑 根据实际尺寸设置
                        loadingPlaceholder.innerHTML = '<span class="material-symbols-outlined text-4xl text-gray-400">image</span>';
                        grid.appendChild(loadingPlaceholder);
                    }
        
                    newResultGroup.appendChild(header);
                    newResultGroup.appendChild(grid);
                    resultsContainer.insertBefore(newResultGroup, resultsContainer.firstChild);
        
                    // 🔑 修复：丝滑滚动到新创建的任务，给用户反馈
                    setTimeout(() => {
                        newResultGroup.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }, 100);
        
                    // 调用 V2App.handleGenerate() - 添加流式更新回调
                    try {
                        console.log('🎨 V2 开始生成图片...', {
                            prompt: promptText,
                            count: count,
                            aspectRatio: aspectRatio,
                            seriesMode: seriesMode,
                            uploadedImagesCount: uploadedImages.size
                        });
        
                        const result = await window.V2App.handleGenerate({
                            prompt: promptText,
                            uploadedImages: uploadedImages,
                            count: count,
                            aspectRatio: aspectRatio,
                            seriesMode: seriesMode,
                            // 🔑 流式更新回调：每完成一张就显示
                            onProgress: (progress) => {
                                console.log('📊 生成进度:', progress);
        
                                // 🔑 修复系列图渲染：同时处理 'processing' 和 'completed' 状态
                                if ((progress.status === 'processing' || progress.status === 'completed') && progress.images && progress.images.length > 0) {
                                    // 清空grid并重新渲染所有已完成的图片
                                    grid.innerHTML = '';
        
                                    // 渲染已完成的图片
                                    progress.images.forEach((imageData, index) => {
                                        const imageWrapper = document.createElement('div');
                                        imageWrapper.className = 'v2-image-wrapper relative group w-full rounded-xl flex-shrink-0 overflow-hidden bg-gray-100';
                                        imageWrapper.setAttribute('data-aspect', aspectRatio);
        
                                        const img = document.createElement('img');
                                        img.src = imageData.url || imageData.thumbnail_url;
                                        img.className = 'w-full h-full object-cover';
                                        img.alt = `生成的图片 ${index + 1}`;
        
                                        const overlay = document.createElement('div');
                                        overlay.className = 'absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3';
                                        overlay.innerHTML = `
                                            <span class="material-symbols-outlined text-white text-2xl cursor-pointer hover:scale-110 p-2" data-action="view" title="查看大图">visibility</span>
                                            <span class="material-symbols-outlined text-white text-2xl cursor-pointer hover:scale-110 p-2" data-action="edit" title="修改图片">edit</span>
                                            <span class="material-symbols-outlined text-white text-2xl cursor-pointer hover:scale-110 p-2" data-action="video" title="转视频">movie</span>
                                            <span class="material-symbols-outlined text-white text-2xl cursor-pointer hover:scale-110 p-2" data-action="favorite" title="收藏">favorite</span>
                                            <span class="material-symbols-outlined text-white text-2xl cursor-pointer hover:scale-110 p-2" data-action="download" title="下载">download</span>
                                        `;
        
                                        // 添加事件监听
                                        overlay.addEventListener('click', (e) => {
                                            const action = e.target.closest('[data-action]')?.dataset.action;
                                            if (action === 'view') {
                                                openImageViewer(imageData.url || imageData.thumbnail_url);
                                            } else if (action === 'download') {
                                                const link = document.createElement('a');
                                                link.href = imageData.url || imageData.thumbnail_url;
                                                link.download = `aiimage_${Date.now()}_${index + 1}.png`;
                                                document.body.appendChild(link);
                                                link.click();
                                                document.body.removeChild(link);
                                                showSuccess('图片已开始下载');
                                            } else if (action === 'edit') {
                                                showInfo('编辑图片功能开发中');
                                            } else if (action === 'video') {
                                                showInfo('转视频功能开发中');
                                            } else if (action === 'favorite') {
                                                showInfo('收藏功能开发中');
                                            }
                                        });
        
                                        imageWrapper.appendChild(img);
                                        imageWrapper.appendChild(overlay);
                                        grid.appendChild(imageWrapper);
                                    });
        
                                    // 添加剩余的占位符
                                    const remainingCount = progress.total - progress.images.length;
                                    for (let i = 0; i < remainingCount; i++) {
                                        const loadingPlaceholder = document.createElement('div');
                                        loadingPlaceholder.className = 'v2-image-wrapper w-full rounded-lg bg-gray-200 dark:bg-zinc-800 animate-pulse flex items-center justify-center';
                                        loadingPlaceholder.setAttribute('data-aspect', aspectRatio);
                                        loadingPlaceholder.innerHTML = '<span class="material-symbols-outlined text-4xl text-gray-400">image</span>';
                                        grid.appendChild(loadingPlaceholder);
                                    }
                                }
                            }
                        });
        
                        console.log('📦 V2 API返回数据:', result);
        
                        if (result.success && result.data && result.data.images && result.data.images.length > 0) {
                            console.log('✅ V2 生成成功！最终', result.data.images.length, '张图片');
        
                            // 🔑 保存task_id到dataset，用于删除操作
                            if (result.data.task_id) {
                                newResultGroup.dataset.taskId = result.data.task_id;
                            }
        
                            // 🔑 流式显示已经渲染了所有图片，这里只需显示Toast提示
        
                            // 显示最终状态Toast
                            const successCount = result.data.success_count || result.data.images.length;
                            const failedCount = result.data.failed_count || 0;
        
                            if (failedCount > 0) {
                                showWarning(`生成完成：成功 ${successCount} 张，失败 ${failedCount} 张`);
                            } else {
                                showSuccess(`成功生成 ${successCount} 张图片！`);
                            }
        
                            // 清空输入框
                            promptInput.value = '';
                        } else {
                            // 生成失败，显示错误
                            console.error('❌ V2 生成失败，数据结构:', result);
        
                            // 🔑 特殊处理：504超时错误（系列图可能正在后台处理）
                            if (result.message === 'TIMEOUT_504') {
                                grid.innerHTML = `
                                    <div class="col-span-full text-center p-4">
                                        <span class="material-symbols-outlined text-6xl text-yellow-500">schedule</span>
                                        <div class="text-yellow-600 dark:text-yellow-400 mt-4 font-medium">
                                            ⏱️ 图片生成时间较长，正在后台处理中
                                        </div>
                                        <div class="text-sm mt-2 text-gray-600 dark:text-gray-400">
                                            请稍后刷新页面查看历史记录
                                        </div>
                                        <button onclick="location.reload()" class="mt-4 px-4 py-2 bg-yellow-400 hover:bg-yellow-500 text-black rounded-lg transition-colors">
                                            刷新页面
                                        </button>
                                    </div>
                                `;
                                showWarning(result.userMessage || '图片生成时间较长，正在后台处理中。请稍后刷新页面查看历史记录。', 6000);
                            } else {
                                // 其他错误
                                grid.innerHTML = `
                                    <div class="col-span-full text-center text-red-500 p-4">
                                        ❌ ${result.message || '生成失败，请重试'}
                                        <div class="text-xs mt-2 text-gray-500">请打开控制台查看详细信息</div>
                                    </div>
                                `;
                                showError(result.message || '生成失败，请重试');
                            }
                        }
                    } catch (error) {
                        // 捕获异常
                        console.error('❌ V2 生成异常:', error);
                        console.error('❌ V2 异常堆栈:', error.stack);
                        grid.innerHTML = `
                            <div class="col-span-full text-center text-red-500 p-4">
                                ❌ 生成出错: ${error.message}
                                <div class="text-xs mt-2 text-gray-500">请打开控制台查看详细信息</div>
                            </div>
                        `;
                    }
                });
        
                // 4. 动态添加上传框（限制7张：1主图 + 6附加）
                const addUploadRowBtn = document.getElementById('add-upload-row-btn');
                const additionalUploadsContainer = document.getElementById('additional-uploads-container');
                const uploadRows = new Map(); // 存储行ID和元素的映射
                let rowIdCounter = 0; // 行ID计数器
                const maxUploadRows = 3; // 3行 x 2张 = 6张附加
        
                addUploadRowBtn.addEventListener('click', () => {
                    if (uploadRows.size >= maxUploadRows) {
                        showWarning('最多只能上传7张图片（1张主图 + 6张附加图）');
                        return;
                    }
        
                    const rowId = `row_${rowIdCounter++}`; // 唯一行ID
                    const newRow = document.createElement('div');
                    newRow.className = 'grid grid-cols-2 gap-2';
                    newRow.dataset.rowId = rowId;
        
                    const picIndex1 = uploadRows.size * 2 + 1;
                    const picIndex2 = picIndex1 + 1;
        
                    newRow.innerHTML = `
                        <div class="v2-upload-label-wrapper">
                            <label for="ref-img-${rowId}-1" data-slot="${rowId}-1" class="flex flex-col items-center justify-center w-full aspect-square border-2 border-dashed border-black/20 rounded-xl bg-black/5 v2-pattern-bg cursor-pointer hover:border-black/40">
                                <span class="material-symbols-outlined text-3xl text-black/30">add_photo_alternate</span>
                            </label>
                            <div class="v2-upload-empty-delete" data-row-id="${rowId}">
                                <span class="material-symbols-outlined" style="font-size: 16px;">close</span>
                            </div>
                            <input id="ref-img-${rowId}-1" type="file" class="sr-only">
                        </div>
                        <div class="v2-upload-label-wrapper">
                            <label for="ref-img-${rowId}-2" data-slot="${rowId}-2" class="flex flex-col items-center justify-center w-full aspect-square border-2 border-dashed border-black/20 rounded-xl bg-black/5 v2-pattern-bg cursor-pointer hover:border-black/40">
                                <span class="material-symbols-outlined text-3xl text-black/30">add_photo_alternate</span>
                            </label>
                            <div class="v2-upload-empty-delete" data-row-id="${rowId}">
                                <span class="material-symbols-outlined" style="font-size: 16px;">close</span>
                            </div>
                            <input id="ref-img-${rowId}-2" type="file" class="sr-only">
                        </div>
                    `;
                    
                    additionalUploadsContainer.appendChild(newRow);
                    uploadRows.set(rowId, newRow); // 存储映射
                    newRow.querySelectorAll('label').forEach(label => cacheLabelDefault(label));
        
                    // 绑定删除按钮事件
                    const deleteButtons = newRow.querySelectorAll('.v2-upload-empty-delete');
                    deleteButtons.forEach(btn => {
                        btn.addEventListener('click', (e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            const rowIdToDelete = btn.dataset.rowId;
                            const rowElement = uploadRows.get(rowIdToDelete);
                            if (rowElement) {
                                const labels = rowElement.querySelectorAll('label');
                                labels.forEach(label => detachLabelImage(label));
                                rowElement.remove();
                                uploadRows.delete(rowIdToDelete); // 从Map中删除
                                // 恢复添加按钮
                                addUploadRowBtn.disabled = false;
                                addUploadRowBtn.classList.remove('opacity-50', 'cursor-not-allowed');
                            }
                        });
                    });
        
                    // 绑定上传框的input事件
                    const inputs = newRow.querySelectorAll('input[type="file"]');
                    inputs.forEach(input => {
                        input.addEventListener('change', (e) => {
                            if (e.target.files.length > 0) {
                                // 找到对应的label（input的父元素的第一个子元素）
                                const wrapper = input.parentElement;
                                const label = wrapper.querySelector('label');
                                handleImageUpload(e.target.files[0], label);
                                e.target.value = '';
                            }
                        });
                    });
        
                    if (uploadRows.size >= maxUploadRows) {
                        addUploadRowBtn.disabled = true;
                        addUploadRowBtn.classList.add('opacity-50', 'cursor-not-allowed');
                    }
                });

                // 5. 侧边栏折叠功能（重构版）
                // sidebar 已在上方声明，此处复用
                const toggleBtn = document.getElementById('sidebar-toggle-btn');
                const iconLeft = document.getElementById('toggle-icon-left');
                const iconRight = document.getElementById('toggle-icon-right');
                const promptWrapper = document.getElementById('prompt-wrapper');
                // promptInput 已在上方第320行声明，此处复用
        
                // 折叠/展开函数
                function toggleSidebar() {
                    const isCollapsed = sidebar.classList.contains('w-20');
        
                    // 🔑 修复1: 添加transitioning类以解决内容闪烁问题
                    sidebar.classList.add('transitioning');
                    sidebar.classList.toggle('is-collapsed');
        
                    if (isCollapsed) {
                        // --- 展开 ---
                        sidebar.classList.remove('w-20', 'p-4');
                        sidebar.classList.add('w-[340px]', 'p-6');
                        iconLeft.classList.remove('hidden');
                        iconRight.classList.add('hidden');
        
                        // 🔑 修复2: 移除按钮位置JS（CSS已通过fixed定位处理）
                        // toggleBtn.classList.remove('left-3.5');
                        // toggleBtn.classList.add('-right-3.5');
        
                        // 展开时：恢复默认单行，rounded-full
                        promptInput.classList.remove('h-40', 'rounded-3xl');
                        promptInput.classList.add('h-16', 'rounded-full');
                        promptInput.rows = 1;
                        promptInput.style.height = 'auto';
        
                        // 恢复prompt wrapper最大宽度
                        promptWrapper.classList.remove('max-w-6xl');
                        promptWrapper.classList.add('max-w-4xl');
                    } else {
                        // --- 折叠 ---
                        sidebar.classList.add('w-20', 'p-4');
                        sidebar.classList.remove('w-[340px]', 'p-6');
                        iconLeft.classList.add('hidden');
                        iconRight.classList.remove('hidden');
        
                        // 🔑 修复2: 移除按钮位置JS（CSS已通过fixed定位处理）
                        // toggleBtn.classList.remove('-right-3.5');
                        // toggleBtn.classList.add('left-3.5');
        
                        // 折叠时：真正增加textarea高度（5行，适中圆角）
                        promptInput.classList.remove('h-16', 'rounded-full');
                        promptInput.classList.add('h-40', 'rounded-3xl');
                        promptInput.rows = 5;
                        promptInput.style.height = '10rem'; // h-40 = 10rem
        
                        // 扩大prompt wrapper最大宽度
                        promptWrapper.classList.remove('max-w-4xl');
                        promptWrapper.classList.add('max-w-6xl');
        
                        // 🔑 修复3: 更新折叠时的缩略图容器
                        updateCollapsedThumbnails();
                    }
        
                    // 🔑 修复1: 过渡动画完成后移除transitioning类
                    setTimeout(() => {
                        sidebar.classList.remove('transitioning');
                    }, 300);
                }
        
                // 🔑 修复3: 更新折叠时的缩略图容器
                function updateCollapsedThumbnails() {
                    const container = document.getElementById('collapsed-thumbnails-container');
                    if (!container) return;
        
                    // 清空容器
                    container.innerHTML = '';
        
                    // 如果没有上传的图片，不显示
                    if (slotImageMap.size === 0) {
                        return;
                    }
        
                    // 🔑 调试：输出slotImageMap的完整内容
                    console.log('🔍 slotImageMap内容:', Array.from(slotImageMap.entries()));
                    console.log('🔍 uploadedImages内容:', Array.from(uploadedImages.entries()));
        
                    // 🔑 修复：遍历slotImageMap而不是uploadedImages，避免同一slot的图片重复显示
                    slotImageMap.forEach((imageId, slotKey) => {
                        const imageData = uploadedImages.get(imageId);
                        if (!imageData) {
                            console.warn('⚠️  slotKey:', slotKey, 'imageId:', imageId, '但imageData不存在！');
                            return; // 安全检查
                        }
        
                        console.log('  ✅ 添加缩略图:', slotKey, '->', imageId);
        
                        const thumbnail = document.createElement('div');
                        thumbnail.className = 'relative w-full aspect-square rounded-lg overflow-hidden bg-gray-200 dark:bg-zinc-800';
                        thumbnail.innerHTML = `
                            <img src="${imageData.dataUrl}" alt="${imageData.name}" class="w-full h-full object-cover">
                        `;
                        container.appendChild(thumbnail);
                    });
        
                    console.log(`🔍 已更新折叠缩略图: ${slotImageMap.size} 张（按slot去重）`);
                }
        
                // textarea输入时不自动增高（保持固定高度）
                promptInput.addEventListener('input', () => {
                    // 只在展开状态下不做任何处理，折叠状态下保持固定高度
                    // 移除自动增高逻辑
                });
        
                // 点击折叠按钮
                toggleBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    toggleSidebar();
                });
        
                // 点击侧边栏特定空白区域折叠/展开
                sidebar.addEventListener('click', (e) => {
                    // 只在点击sidebar本身或logo区域时触发，缩小范围
                    if (e.target === sidebar) {
                        toggleSidebar();
                    }
                });
        
                // 阻止特定元素冒泡（避免点击时触发折叠）
                // 只阻止input和label，不阻止按钮组的button
                const interactiveElements = sidebar.querySelectorAll('input, label, #add-upload-row-btn, #sidebar-toggle-btn');
                interactiveElements.forEach(el => {
                    el.addEventListener('click', (e) => {
                        e.stopPropagation();
                    });
                });
        
                // 6. 图片上传预览功能
                const uploadedImages = new Map(); // 使用Map存储，key为唯一ID
                const slotImageMap = new Map(); // 记录每个slot对应的图片ID
                const labelDefaults = new WeakMap(); // 记录label默认内容
                let imageIdCounter = 0; // 全局ID计数器
        
                function cacheLabelDefault(labelElement) {
                    if (labelElement && !labelDefaults.has(labelElement)) {
                        labelDefaults.set(labelElement, labelElement.innerHTML);
                    }
                }
        
                function resetLabelContent(labelElement) {
                    if (!labelElement) return;
                    const defaultContent = labelDefaults.get(labelElement);
                    if (defaultContent !== undefined) {
                        labelElement.innerHTML = defaultContent;
                    } else {
                        labelElement.innerHTML = '<span class="material-symbols-outlined text-3xl text-black/30">add_photo_alternate</span>';
                    }
                    delete labelElement.dataset.imageId;
                }
        
                function getSlotKey(labelElement) {
                    return labelElement?.dataset?.slot || '';
                }
        
                function detachLabelImage(labelElement) {
                    if (!labelElement) return;
                    const slotKey = getSlotKey(labelElement);
        
                    if (slotKey && slotImageMap.has(slotKey)) {
                        const imageId = slotImageMap.get(slotKey);
                        uploadedImages.delete(imageId);
                        slotImageMap.delete(slotKey);
                        document.querySelectorAll(`label[data-slot="${slotKey}"]`).forEach(label => {
                            resetLabelContent(label);
                        });
                        console.log('已删除图片 Slot:', slotKey, '剩余:', uploadedImages.size);
        
                        // 🔑 修复3: 更新折叠时的缩略图（如果侧边栏当前是折叠状态）
                        if (sidebar && sidebar.classList.contains('is-collapsed')) {
                            updateCollapsedThumbnails();
                        }
                        return;
                    }
        
                    const existingId = labelElement.dataset.imageId;
                    if (existingId) {
                        uploadedImages.delete(existingId);
                    }
                    resetLabelContent(labelElement);
                    console.log('已删除图片 ID:', existingId, '剩余:', uploadedImages.size);
        
                    // 🔑 修复3: 更新折叠时的缩略图（如果侧边栏当前是折叠状态）
                    if (sidebar && sidebar.classList.contains('is-collapsed')) {
                        updateCollapsedThumbnails();
                    }
                }
        
                // 主上传框
                const mainImageUpload = document.getElementById('main-image-upload');
                const mainImageUploadIcon = document.getElementById('main-image-upload-icon');
                const mainUploadLabel = mainImageUpload.previousElementSibling;
                const mainUploadLabelIcon = mainImageUploadIcon.previousElementSibling;
                [mainUploadLabel, mainUploadLabelIcon].forEach(label => cacheLabelDefault(label));
        
                // 处理图片上传
                async function handleImageUpload(file, labelElement) {
                    // 验证文件
                    const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
                    if (!validTypes.includes(file.type)) {
                        showError('请上传 PNG、JPG 或 WebP 格式的图片');
                        return;
                    }
        
                    const maxSize = 10 * 1024 * 1024; // 10MB
                    if (file.size > maxSize) {
                        showError('图片大小不能超过 10MB');
                        return;
                    }
        
                    // 如果该上传槽已有图片，先移除旧数据
                    detachLabelImage(labelElement);
        
                    // 读取文件为Base64
                    const reader = new FileReader();
                    reader.onload = (e) => {
                        const dataUrl = e.target.result;
                        const imageId = `img_${imageIdCounter++}`; // 生成唯一ID
                        const slotKey = getSlotKey(labelElement);
        
                        // 保存到Map
                        uploadedImages.set(imageId, {
                            file: file,
                            dataUrl: dataUrl,
                            name: file.name
                        });
        
                        // 显示预览
                        showImagePreview(labelElement, dataUrl, imageId);
        
                        if (slotKey) {
                            slotImageMap.set(slotKey, imageId);
                        }
        
                        console.log('已上传图片:', file.name, 'ID:', imageId, '总数:', uploadedImages.size, 'Slot:', slotKey || 'N/A');
        
                        // 🔑 修复3: 更新折叠时的缩略图（如果侧边栏当前是折叠状态）
                        if (sidebar.classList.contains('is-collapsed')) {
                            updateCollapsedThumbnails();
                        }
                    };
                    reader.readAsDataURL(file);
                }
        
                function renderPreview(labelElement, dataUrl, imageId) {
                    labelElement.innerHTML = '';
                    labelElement.dataset.imageId = imageId;
        
                    const preview = document.createElement('div');
                    preview.className = 'v2-upload-preview w-full h-full relative';
                    preview.style.backgroundImage = `url(${dataUrl})`;
                    preview.dataset.imageId = imageId;
        
                    const deleteBtn = document.createElement('div');
                    deleteBtn.className = 'v2-upload-delete';
                    deleteBtn.innerHTML = '<span class="material-symbols-outlined" style="font-size: 16px;">close</span>';
                    deleteBtn.addEventListener('click', (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        detachLabelImage(labelElement);
                    });
        
                    preview.appendChild(deleteBtn);
                    labelElement.appendChild(preview);
        
                    preview.addEventListener('click', (e) => {
                        if (!e.target.classList.contains('v2-upload-delete') && !e.target.closest('.v2-upload-delete')) {
                            console.log('点击查看图片:', imageId);
                        }
                    });
                }
        
                // 显示图片预览（支持同slot的多个label同步状态）
                function showImagePreview(labelElement, dataUrl, imageId) {
                    const slotKey = getSlotKey(labelElement);
                    if (slotKey) {
                        const relatedLabels = document.querySelectorAll(`label[data-slot="${slotKey}"]`);
                        relatedLabels.forEach(label => {
                            cacheLabelDefault(label);
                            renderPreview(label, dataUrl, imageId);
                        });
                    } else {
                        cacheLabelDefault(labelElement);
                        renderPreview(labelElement, dataUrl, imageId);
                    }
                }
        
                // 主上传框事件
                mainImageUpload.addEventListener('change', (e) => {
                    if (e.target.files.length > 0) {
                        handleImageUpload(e.target.files[0], mainUploadLabel);
                        e.target.value = ''; // 清空input以允许重复上传
                    }
                });
        
                mainImageUploadIcon.addEventListener('change', (e) => {
                    if (e.target.files.length > 0) {
                        handleImageUpload(e.target.files[0], mainUploadLabelIcon);
                        e.target.value = '';
                    }
                });
        
                // 7. 开关系列图（增强：禁用尺寸/数量选择+重置+提示）
                const seriesToggle = document.getElementById('series-mode-toggle');
                const aspectRatioGroup = document.getElementById('aspect-ratio-group');
                const imageCountGroup = document.getElementById('image-count-group');
        
                seriesToggle.addEventListener('click', () => {
                    const isChecked = seriesToggle.getAttribute('aria-checked') === 'true';
                    const newState = !isChecked;
                    seriesToggle.setAttribute('aria-checked', newState);
        
                    if (newState) {
                        // 切换到系列图模式
                        console.log('✨ 切换到系列图模式');
        
                        // 1. 重置尺寸到1:1
                        const ratioButtons = aspectRatioGroup.querySelectorAll('button');
                        ratioButtons.forEach(btn => {
                            btn.dataset.active = 'false';
                            btn.classList.remove('bg-black', 'text-white', 'font-semibold', 'ring-2', 'ring-black');
                            btn.classList.add('bg-white/50', 'hover:bg-white/80');
        
                            if (btn.dataset.ratio === '1:1') {
                                btn.dataset.active = 'true';
                                btn.classList.remove('bg-white/50', 'hover:bg-white/80');
                                btn.classList.add('bg-black', 'text-white', 'font-semibold', 'ring-2', 'ring-black');
                            }
                        });
        
                        // 2. 重置数量到1
                        const countButtons = imageCountGroup.querySelectorAll('button');
                        countButtons.forEach(btn => {
                            btn.dataset.active = 'false';
                            btn.classList.remove('bg-black', 'text-white', 'font-semibold', 'ring-2', 'ring-black');
                            btn.classList.add('bg-white/50', 'hover:bg-white/80');
        
                            if (btn.textContent.trim() === '1') {
                                btn.dataset.active = 'true';
                                btn.classList.remove('bg-white/50', 'hover:bg-white/80');
                                btn.classList.add('bg-black', 'text-white', 'font-semibold', 'ring-2', 'ring-black');
                            }
                        });
        
                        // 3. 禁用尺寸和数量选择
                        aspectRatioGroup.style.opacity = '0.5';
                        aspectRatioGroup.style.pointerEvents = 'none';
                        imageCountGroup.style.opacity = '0.5';
                        imageCountGroup.style.pointerEvents = 'none';
        
                        // 4. 显示温和提示
                        showInfo('系列图模式已开启。尺寸和数量由模型自动决定（固定消耗2粒子币）', 4000);
        
                    } else {
                        // 切换回普通模式
                        console.log('✨ 切换回普通模式');
        
                        // 恢复尺寸和数量选择
                        aspectRatioGroup.style.opacity = '1';
                        aspectRatioGroup.style.pointerEvents = 'auto';
                        imageCountGroup.style.opacity = '1';
                        imageCountGroup.style.pointerEvents = 'auto';
        
                        showInfo('已切换回普通模式');
                    }
                });
        
                // 7.5. 任务卡片下拉菜单处理
                let currentOpenMenu = null;
        
                // 点击任务菜单按钮
                resultsContainer.addEventListener('click', async (e) => {
                    const menuBtn = e.target.closest('.v2-task-menu-btn');
                    if (menuBtn) {
                        e.stopPropagation();
                        const wrapper = menuBtn.closest('.v2-task-menu-wrapper');
                        const menu = wrapper.querySelector('.v2-dropdown-menu');
        
                        // 关闭其他菜单
                        if (currentOpenMenu && currentOpenMenu !== menu) {
                            currentOpenMenu.classList.remove('active');
                        }
        
                        // 切换当前菜单
                        menu.classList.toggle('active');
                        currentOpenMenu = menu.classList.contains('active') ? menu : null;
                        return;
                    }
        
                    // 点击菜单项
                    const menuItem = e.target.closest('.v2-dropdown-item');
                    if (menuItem) {
                        const action = menuItem.dataset.action;
                        const taskCard = menuItem.closest('.space-y-4');
        
                        if (action === 'regenerate') {
                            // 复用旧版逻辑：再次生成
        
                            // 1. 检查登录状态
                            if (!window.V2App || !window.V2App.isLoggedIn) {
                                showWarning('请先登录');
                                return;
                            }
        
                            // 2. 获取存储的原始参数
                            const originalPrompt = taskCard.dataset.originalPrompt || '';
                            const aspectRatio = taskCard.dataset.aspectRatio || '1:1';
                            const count = parseInt(taskCard.dataset.count) || 1;
                            const seriesMode = taskCard.dataset.seriesMode === 'true';
                            const hasReferenceImages = taskCard.dataset.hasReferenceImages === 'true';
                            const taskId = taskCard.dataset.taskId;
        
                            // 🔍 调试：输出dataset值
                            console.log('🔍 重新生成参数:', {
                                taskId,
                                hasReferenceImages,
                                hasReferenceImagesRaw: taskCard.dataset.hasReferenceImages,
                                seriesMode,
                                count,
                                aspectRatio
                            });
        
                            if (!originalPrompt) {
                                showError('无法获取原始提示词');
                                return;
                            }
        
                            // 3. 检查粒子币余额（复用旧版逻辑）
                            const currentUser = window.V2App.currentUser;
                            const requiredParticles = seriesMode ? 2 : count;  // 系列图2币，文生图1币/张
        
                            if (!currentUser || currentUser.particles < requiredParticles) {
                                showWarning(
                                    `粒子币余额不足。当前余额：${currentUser?.particles || 0} 币，再次生成需要：${requiredParticles} 币`
                                );
                                return;
                            }
        
                            // 4. 关闭菜单
                            if (currentOpenMenu) {
                                currentOpenMenu.classList.remove('active');
                                currentOpenMenu = null;
                            }
        
                            // 5. 如果是图生图或系列图模式，需要先加载原始参考图片
                            let regenerateUploadedImages = new Map();
        
                            if (hasReferenceImages && taskId) {
                                try {
                                    showInfo('正在加载原始参考图片...');
                                    console.log('🔄 加载原始参考图片 from task:', taskId);
        
                                    // 🔑 复用旧版逻辑：调用getTaskDetail获取完整数据（包含reference_images）
                                    const taskDetail = await window.V2App.history.getTaskDetail(taskId, null, true);
        
                                    console.log('  📦 任务详情返回:', {
                                        has_task: !!taskDetail?.task,
                                        has_reference_images: !!taskDetail?.task?.reference_images,
                                        reference_images_length: taskDetail?.task?.reference_images?.length
                                    });
        
                                    if (taskDetail && taskDetail.task && taskDetail.task.reference_images && taskDetail.task.reference_images.length > 0) {
                                        const referenceImages = taskDetail.task.reference_images;
                                        console.log('  ✅ 获取到参考图片:', referenceImages.length, '张');
        
                                        // 🔑 辅助函数：将base64 dataUrl转换为File对象
                                        const dataURLtoFile = (dataUrl, filename) => {
                                            const arr = dataUrl.split(',');
                                            const mime = arr[0].match(/:(.*?);/)[1];
                                            const bstr = atob(arr[1]);
                                            let n = bstr.length;
                                            const u8arr = new Uint8Array(n);
                                            while (n--) {
                                                u8arr[n] = bstr.charCodeAt(n);
                                            }
                                            return new File([u8arr], filename, { type: mime });
                                        };
        
                                        // 将reference_images（base64格式）转换为uploadedImages Map格式
                                        for (let index = 0; index < referenceImages.length; index++) {
                                            const dataUrl = referenceImages[index];
                                            const imageId = `regenerate-${Date.now()}-${index}`;
                                            const filename = `reference-image-${index + 1}.png`;
        
                                            // 转换为File对象
                                            const file = dataURLtoFile(dataUrl, filename);
        
                                            regenerateUploadedImages.set(imageId, {
                                                file: file,  // ✅ 真实的File对象
                                                dataUrl: dataUrl,  // base64格式
                                                name: filename,
                                                slot: `image-upload-${index + 1}`
                                            });
                                        }
        
                                        console.log('  ✅ 已恢复', regenerateUploadedImages.size, '张参考图片（已转换为File对象）');
                                    } else {
                                        console.warn('  ⚠️ 任务详情中没有找到reference_images，可能是纯文生图或系列图');
                                    }
                                } catch (error) {
                                    console.error('  ❌ 加载参考图片失败:', error);
                                    showWarning('无法加载原始参考图片，将以文生图模式重新生成');
                                }
                            }
        
                            // 6. 创建新的任务卡片（与生成按钮逻辑一致）
                            const newResultGroup = document.createElement('div');
                            newResultGroup.className = 'space-y-4';
                            newResultGroup.dataset.originalPrompt = originalPrompt;
                            newResultGroup.dataset.aspectRatio = aspectRatio;
                            newResultGroup.dataset.count = count;
                            newResultGroup.dataset.seriesMode = seriesMode;
                            newResultGroup.dataset.hasReferenceImages = (regenerateUploadedImages.size > 0) ? 'true' : 'false';
        
                            const header = document.createElement('div');
                            header.className = 'flex justify-between items-center';
                            header.innerHTML = `
                                <p class="text-sm text-gray-500 dark:text-gray-400">
                                    ${originalPrompt.substring(0, 40)}${originalPrompt.length > 40 ? '...' : ''}
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
        
                            const grid = document.createElement('div');
                            grid.className = 'grid grid-cols-2 md:grid-cols-4 gap-4';
        
                            // 显示加载占位符
                            for (let i = 0; i < count; i++) {
                                const loadingPlaceholder = document.createElement('div');
                                loadingPlaceholder.className = 'v2-image-wrapper w-full rounded-lg bg-gray-200 dark:bg-zinc-800 animate-pulse flex items-center justify-center';
                                loadingPlaceholder.setAttribute('data-aspect', aspectRatio);
                                loadingPlaceholder.innerHTML = '<span class="material-symbols-outlined text-4xl text-gray-400">image</span>';
                                grid.appendChild(loadingPlaceholder);
                            }
        
                            newResultGroup.appendChild(header);
                            newResultGroup.appendChild(grid);
        
                            // 插入到结果容器顶部
                            const resultsContainer = document.getElementById('results-container');
                            resultsContainer.insertBefore(newResultGroup, resultsContainer.firstChild);
        
                            // 🔑 修复：丝滑滚动到新创建的任务，给用户反馈
                            setTimeout(() => {
                                newResultGroup.scrollIntoView({ behavior: 'smooth', block: 'start' });
                            }, 100);
        
                            // 7. 调用生成API（与生成按钮逻辑一致）
                            (async () => {
                                try {
                                    console.log('🔄 再次生成...', {
                                        prompt: originalPrompt,
                                        count: count,
                                        aspectRatio: aspectRatio,
                                        seriesMode: seriesMode,
                                        hasReferenceImages: regenerateUploadedImages.size > 0,
                                        referenceImagesCount: regenerateUploadedImages.size
                                    });
        
                                    const result = await window.V2App.handleGenerate({
                                        prompt: originalPrompt,
                                        uploadedImages: regenerateUploadedImages,  // ✅ 传入恢复的参考图片
                                        count: count,
                                        aspectRatio: aspectRatio,
                                        seriesMode: seriesMode,
                                        onProgress: (progress) => {
                                            // 🔑 修复系列图渲染：同时处理 'processing' 和 'completed' 状态
                                            if ((progress.status === 'processing' || progress.status === 'completed') && progress.images && progress.images.length > 0) {
                                                grid.innerHTML = '';
        
                                                progress.images.forEach((imageData, index) => {
                                                    const imageWrapper = document.createElement('div');
                                                    imageWrapper.className = 'v2-image-wrapper relative group w-full rounded-xl flex-shrink-0 overflow-hidden bg-gray-100';
                                                    imageWrapper.setAttribute('data-aspect', aspectRatio);
        
                                                    const img = document.createElement('img');
                                                    img.src = imageData.url || imageData.thumbnail_url;
                                                    img.alt = `生成的图片 ${index + 1}`;
                                                    img.className = 'w-full h-full object-cover';
        
                                                    const overlay = document.createElement('div');
                                                    overlay.className = 'absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-300 flex items-center justify-center gap-4 opacity-0 group-hover:opacity-100';
                                                    overlay.innerHTML = `
                                                        <span class="material-symbols-outlined text-white text-2xl cursor-pointer hover:scale-125 transition-transform"
                                                            data-action="view"
                                                            onclick="openImageViewer('${imageData.url || imageData.thumbnail_url}')">
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
                                                            onclick="window.location.href='${imageData.url || imageData.thumbnail_url}'">
                                                            download
                                                        </span>
                                                    `;
        
                                                    imageWrapper.appendChild(img);
                                                    imageWrapper.appendChild(overlay);
                                                    grid.appendChild(imageWrapper);
                                                });
        
                                                const remainingCount = progress.total - progress.images.length;
                                                for (let i = 0; i < remainingCount; i++) {
                                                    const loadingPlaceholder = document.createElement('div');
                                                    loadingPlaceholder.className = 'v2-image-wrapper w-full rounded-lg bg-gray-200 dark:bg-zinc-800 animate-pulse flex items-center justify-center';
                                                    loadingPlaceholder.setAttribute('data-aspect', aspectRatio);
                                                    loadingPlaceholder.innerHTML = '<span class="material-symbols-outlined text-4xl text-gray-400">image</span>';
                                                    grid.appendChild(loadingPlaceholder);
                                                }
                                            }
                                        }
                                    });
        
                                    console.log('📦 再次生成返回数据:', result);
        
                                    if (result.success && result.data && result.data.images && result.data.images.length > 0) {
                                        // 🔑 保存task_id到dataset，用于删除操作
                                        if (result.data.task_id) {
                                            newResultGroup.dataset.taskId = result.data.task_id;
                                        }
        
                                        const successCount = result.data.success_count || result.data.images.length;
                                        const failedCount = result.data.failed_count || 0;
        
                                        if (failedCount > 0) {
                                            showWarning(`生成完成：成功 ${successCount} 张，失败 ${failedCount} 张`);
                                        } else {
                                            showSuccess(`成功生成 ${successCount} 张图片！`);
                                        }
                                    } else {
                                        console.error('❌ 再次生成失败，数据结构:', result);
                                        grid.innerHTML = `
                                            <div class="col-span-full text-center text-red-500 p-4">
                                                生成失败，请重试
                                            </div>
                                        `;
                                        showError(result.message || '生成失败，请重试');
                                    }
                                } catch (error) {
                                    console.error('❌ 再次生成异常:', error);
                                    grid.innerHTML = `
                                        <div class="col-span-full text-center text-red-500 p-4">
                                            ${error.message || '生成失败，请重试'}
                                        </div>
                                    `;
                                    showError(error.message || '生成失败，请重试');
                                }
                            })();
        
                            return;  // 提前返回，避免继续执行后续逻辑
                        } else if (action === 'copy') {
                            // 使用存储的原始提示词，而不是显示文本（可能包含状态信息）
                            const originalPrompt = taskCard.dataset.originalPrompt || '';
                            navigator.clipboard.writeText(originalPrompt).then(() => {
                                showSuccess('提示词已复制到剪贴板');
                            });
                        } else if (action === 'delete') {
                            // 复用旧版逻辑：删除任务
                            const confirmed = await window.v2Confirm.show('确定删除此记录吗？', {
                                type: 'danger',
                                okText: '删除',
                                cancelText: '取消'
                            });
                            if (!confirmed) return;
        
                            const taskId = taskCard.dataset.taskId;
        
                            // 如果有task_id，调用后端API删除
                            if (taskId) {
                                (async () => {
                                    try {
                                        await window.V2App.history.deleteTask(taskId);
                                        taskCard.remove();
                                        showSuccess('删除成功');
                                    } catch (error) {
                                        console.error('[删除任务] 失败:', error);
                                        showError('删除失败：' + error.message);
                                    }
                                })();
                            } else {
                                // 没有task_id，说明是本地未保存的任务，直接删除DOM
                                taskCard.remove();
                                showSuccess('已删除');
                            }
                        }
        
                        // 关闭菜单
                        if (currentOpenMenu) {
                            currentOpenMenu.classList.remove('active');
                            currentOpenMenu = null;
                        }
                    }
                });
        
                // 点击其他地方关闭菜单
                document.addEventListener('click', () => {
                    if (currentOpenMenu) {
                        currentOpenMenu.classList.remove('active');
                        currentOpenMenu = null;
                    }
                });
        
                // 8. 为未实现功能的按钮添加占位提示
                // 注意：使用事件委托来处理动态生成的按钮
        
                // 顶部header按钮（视频、收藏）
                document.querySelector('header').addEventListener('click', (e) => {
                    const btn = e.target.closest('button');
                    if (!btn) return;
        
                    const icon = btn.querySelector('.material-symbols-outlined');
                    if (!icon) return;
        
                    const iconText = icon.textContent.trim();
                    if (iconText === 'movie') {
                        showComingSoon('视频管理');
                    } else if (iconText === 'favorite') {
                        showComingSoon('收藏管理');
                    }
                });
        
                // 底部输入框右侧按钮（mic/image/settings/AI优化）
                const promptInputArea = document.querySelector('#prompt-wrapper');
                promptInputArea.addEventListener('click', (e) => {
                    const btn = e.target.closest('button');
                    if (!btn || btn.id === 'generate-btn-bottom') return; // 排除生成按钮
        
                    const icon = btn.querySelector('.material-symbols-outlined');
                    if (!icon) return;
        
                    const iconText = icon.textContent.trim();
                    if (iconText === 'mic') {
                        showComingSoon('语音输入');
                    } else if (iconText === 'image') {
                        showComingSoon('图片识别提示词');
                    } else if (iconText === 'settings') {
                        showComingSoon('高级设置');
                    } else if (iconText === 'auto_awesome') {
                        // AI提示词优化
                        handleOptimizePrompt();
                    }
                });
        
                // 结果容器中的动态按钮（使用事件委托）
                // overlay中的图标按钮占位提示
                document.addEventListener('click', (e) => {
                    const icon = e.target.closest('.material-symbols-outlined');
        
                    // overlay中的图标按钮
                    if (icon && icon.closest('[class*="opacity-0"]')) {
                        const iconText = icon.textContent.trim();
                        if (iconText === 'edit') {
                            showComingSoon('编辑图片');
                        } else if (iconText === 'movie') {
                            showComingSoon('转视频');
                        } else if (iconText === 'favorite') {
                            showComingSoon('收藏图片');
                        } else if (iconText === 'download') {
                            showComingSoon('下载图片');
                        }
                    }
                });

                // ⚠️ 已删除认证弹窗逻辑（openAuthModal, closeAuthModal, switchAuthTab, 登录/注册表单处理等）
                // ✅ 现由 AuthUI.js 模块提供

        console.log('✅ Legacy功能模块初始化完成');
    }
}
