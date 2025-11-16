/**
 * 图片查看器模块
 * 负责图片查看、原图加载、下载功能
 */

import DOM from '../utils/dom.js';
import { parseImageUrl } from '../utils/helpers.js';
import toast from '../utils/toast.js';

export class ImageViewer {
    constructor(historyService) {
        this.historyService = historyService;
        this.viewer = DOM.qs('#image-viewer');
        this.viewerImage = DOM.qs('#viewer-image');
        this.viewerLoading = this.viewer ? this.viewer.querySelector('.v2-viewer-loading') : null;

        this.init();
    }

    /**
     * 初始化事件监听
     */
    init() {
        // ESC键关闭查看器
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isOpen()) {
                this.close();
            }
        });

        // 点击背景关闭查看器
        if (this.viewer) {
            this.viewer.addEventListener('click', (e) => {
                if (e.target.id === 'image-viewer') {
                    this.close();
                }
            });
        }
    }

    /**
     * 检查查看器是否打开
     */
    isOpen() {
        return this.viewer && this.viewer.style.display === 'flex';
    }

    /**
     * 打开查看器
     * @param {string} imageSrc - 图片URL
     * @param {Object} options - 选项
     * @param {boolean} options.isLoading - 是否显示加载状态
     */
    open(imageSrc, options = {}) {
        if (!this.viewer || !this.viewerImage) return;

        const { isLoading = false } = options;

        // 设置图片
        this.viewerImage.src = parseImageUrl(imageSrc);

        // 显示查看器
        this.viewer.style.display = 'flex';

        // 设置loading状态
        if (this.viewerLoading) {
            this.viewerLoading.style.display = isLoading ? 'flex' : 'none';
        }

        if (isLoading) {
            this.viewerImage.style.opacity = '0.5';
        } else {
            this.viewerImage.style.opacity = '1';
        }

        // 禁止body滚动
        document.body.style.overflow = 'hidden';
    }

    /**
     * 更新查看器中的图片
     * @param {string} newImageSrc - 新图片URL
     */
    updateImage(newImageSrc) {
        if (!this.viewerImage) return;

        this.viewerImage.src = parseImageUrl(newImageSrc);
        this.viewerImage.style.opacity = '1';

        // 隐藏loading
        if (this.viewerLoading) {
            this.viewerLoading.style.display = 'none';
        }
    }

    /**
     * 关闭查看器
     */
    close() {
        if (!this.viewer) return;

        this.viewer.style.display = 'none';

        // 恢复body滚动
        document.body.style.overflow = '';
    }

    /**
     * 打开图片并加载原图（懒加载）
     * @param {string} taskId - 任务ID
     * @param {number} imageIndex - 图片索引
     * @param {string} thumbnailUrl - 缩略图URL
     */
    async openWithOriginal(taskId, imageIndex, thumbnailUrl) {
        try {
            // 1. 先用缩略图打开查看器，显示loading
            this.open(thumbnailUrl, { isLoading: true });

            // 2. 调用API获取原图
            console.log(`🔍 加载任务 ${taskId} 的原图...`);
            const result = await this.historyService.loadFullImages(taskId);

            // 3. 解析原图URL
            if (result && result.task && result.task.generated_images) {
                const images = result.task.generated_images;
                if (Array.isArray(images) && images[imageIndex]) {
                    const imageData = images[imageIndex];
                    let fullUrl = '';

                    // 解析图片URL
                    if (typeof imageData === 'string') {
                        fullUrl = imageData;
                    } else if (imageData && imageData.url) {
                        fullUrl = imageData.url;
                    } else if (imageData && imageData.b64_json) {
                        fullUrl = `data:image/png;base64,${imageData.b64_json}`;
                    }

                    // 4. 替换成原图
                    if (fullUrl) {
                        console.log(`✅ 原图加载成功`);
                        this.updateImage(fullUrl);
                    } else {
                        console.warn('⚠️  原图URL为空');
                        this.updateImage(thumbnailUrl);
                    }
                } else {
                    console.warn('⚠️  原图索引越界');
                    this.updateImage(thumbnailUrl);
                }
            } else {
                console.warn('⚠️  原图数据格式错误');
                this.updateImage(thumbnailUrl);
            }
        } catch (error) {
            console.error(`❌ 加载任务 ${taskId} 原图失败:`, error);
            // 失败时至少显示缩略图
            this.updateImage(thumbnailUrl);
        }
    }

    /**
     * 下载当前查看的图片
     */
    download() {
        if (!this.viewerImage) return;

        const link = document.createElement('a');
        link.href = this.viewerImage.src;
        link.download = `aiimage_${Date.now()}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        toast.success('图片已开始下载');
    }
}

export default ImageViewer;
