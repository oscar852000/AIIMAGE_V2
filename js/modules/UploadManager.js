/**
 * 图片上传管理器
 * 负责文件上传、预览、状态管理（单一数据源）
 */

import DOM from '../utils/dom.js';
import { validateImageFile, fileToBase64, generateId } from '../utils/helpers.js';
import toast from '../utils/toast.js';

export class UploadManager {
    constructor() {
        // 单一数据源：只维护一个Map存储所有上传的图片
        this.uploadedImages = new Map(); // key: imageId, value: { file, dataUrl, name }
        this.labelDefaults = new WeakMap(); // 缓存label默认内容

        // DOM元素
        this.mainImageUpload = DOM.qs('#main-image-upload');
        this.mainImageUploadIcon = DOM.qs('#main-image-upload-icon');
        this.mainUploadLabel = this.mainImageUpload?.previousElementSibling;
        this.mainUploadLabelIcon = this.mainImageUploadIcon?.previousElementSibling;

        this.addUploadRowBtn = DOM.qs('#add-upload-row-btn');
        this.additionalUploadsContainer = DOM.qs('#additional-uploads-container');
        this.uploadRows = new Map(); // 存储动态行
        this.maxUploadRows = 3; // 最多3行额外上传

        this.init();
    }

    /**
     * 初始化
     */
    init() {
        // 缓存主上传框的默认内容
        if (this.mainUploadLabel) this.cacheLabelDefault(this.mainUploadLabel);
        if (this.mainUploadLabelIcon) this.cacheLabelDefault(this.mainUploadLabelIcon);

        // 主上传框事件
        if (this.mainImageUpload) {
            this.mainImageUpload.addEventListener('change', (e) => {
                if (e.target.files.length > 0) {
                    this.handleImageUpload(e.target.files[0], this.mainUploadLabel);
                    e.target.value = ''; // 清空input以允许重复上传
                }
            });
        }

        if (this.mainImageUploadIcon) {
            this.mainImageUploadIcon.addEventListener('change', (e) => {
                if (e.target.files.length > 0) {
                    this.handleImageUpload(e.target.files[0], this.mainUploadLabelIcon);
                    e.target.value = '';
                }
            });
        }

        // 添加上传行按钮
        if (this.addUploadRowBtn) {
            this.addUploadRowBtn.addEventListener('click', () => this.addUploadRow());
        }
    }

    /**
     * 缓存label的默认内容
     */
    cacheLabelDefault(labelElement) {
        if (labelElement && !this.labelDefaults.has(labelElement)) {
            this.labelDefaults.set(labelElement, labelElement.innerHTML);
        }
    }

    /**
     * 重置label内容到默认状态
     */
    resetLabelContent(labelElement) {
        if (!labelElement) return;

        const defaultContent = this.labelDefaults.get(labelElement);
        if (defaultContent !== undefined) {
            labelElement.innerHTML = defaultContent;
        } else {
            labelElement.innerHTML = '<span class="material-symbols-outlined text-3xl text-black/30">add_photo_alternate</span>';
        }

        delete labelElement.dataset.imageId;
    }

    /**
     * 获取slot标识
     */
    getSlotKey(labelElement) {
        return labelElement?.dataset?.slot || '';
    }

    /**
     * 处理图片上传
     */
    async handleImageUpload(file, labelElement) {
        if (!file || !labelElement) return;

        // 验证文件
        const validation = validateImageFile(file);
        if (!validation.valid) {
            toast.error(validation.message);
            return;
        }

        // 如果该上传槽已有图片，先移除旧数据
        this.detachLabelImage(labelElement);

        try {
            // 读取文件为Base64
            const dataUrl = await fileToBase64(file);
            const imageId = generateId('img');
            const slotKey = this.getSlotKey(labelElement);

            // 保存到Map（单一数据源）
            this.uploadedImages.set(imageId, {
                file: file,
                dataUrl: dataUrl,
                name: file.name,
                slot: slotKey || null // 记录slot归属
            });

            // 显示预览
            this.showImagePreview(labelElement, dataUrl, imageId);

            console.log('✅ 已上传图片:', file.name, 'ID:', imageId, '总数:', this.uploadedImages.size, 'Slot:', slotKey || 'N/A');
        } catch (error) {
            console.error('上传失败:', error);
            toast.error('图片上传失败，请重试');
        }
    }

    /**
     * 删除label关联的图片
     */
    detachLabelImage(labelElement) {
        if (!labelElement) return;

        const slotKey = this.getSlotKey(labelElement);

        if (slotKey) {
            // 如果有slot，删除该slot的所有图片
            const imageId = this.findImageBySlot(slotKey);
            if (imageId) {
                this.uploadedImages.delete(imageId);
                // 重置所有同slot的label
                const relatedLabels = DOM.qsa(`label[data-slot="${slotKey}"]`);
                relatedLabels.forEach(label => this.resetLabelContent(label));
                console.log('🗑️ 已删除图片 Slot:', slotKey, '剩余:', this.uploadedImages.size);
                return;
            }
        }

        // 如果没有slot，从label的imageId删除
        const existingId = labelElement.dataset.imageId;
        if (existingId) {
            this.uploadedImages.delete(existingId);
        }

        this.resetLabelContent(labelElement);
        console.log('🗑️ 已删除图片 ID:', existingId, '剩余:', this.uploadedImages.size);
    }

    /**
     * 根据slot查找imageId（从单一数据源查询）
     */
    findImageBySlot(slotKey) {
        for (const [imageId, imageData] of this.uploadedImages.entries()) {
            if (imageData.slot === slotKey) {
                return imageId;
            }
        }
        return null;
    }

    /**
     * 显示图片预览
     */
    showImagePreview(labelElement, dataUrl, imageId) {
        const slotKey = this.getSlotKey(labelElement);

        if (slotKey) {
            // 如果有slot，同步更新所有同slot的label
            const relatedLabels = DOM.qsa(`label[data-slot="${slotKey}"]`);
            relatedLabels.forEach(label => {
                this.cacheLabelDefault(label);
                this.renderPreview(label, dataUrl, imageId);
            });
        } else {
            // 如果没有slot，只更新当前label
            this.cacheLabelDefault(labelElement);
            this.renderPreview(labelElement, dataUrl, imageId);
        }
    }

    /**
     * 渲染预览UI
     */
    renderPreview(labelElement, dataUrl, imageId) {
        labelElement.innerHTML = '';
        labelElement.dataset.imageId = imageId;

        const preview = DOM.create('div', 'v2-upload-preview w-full h-full relative');
        preview.style.backgroundImage = `url(${dataUrl})`;
        preview.dataset.imageId = imageId;

        const deleteBtn = DOM.create('div', 'v2-upload-delete',
            '<span class="material-symbols-outlined" style="font-size: 16px;">close</span>'
        );

        deleteBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.detachLabelImage(labelElement);
        });

        preview.appendChild(deleteBtn);
        labelElement.appendChild(preview);

        // 点击预览查看大图（可选功能）
        preview.addEventListener('click', (e) => {
            if (!e.target.classList.contains('v2-upload-delete') && !e.target.closest('.v2-upload-delete')) {
                console.log('👀 点击查看图片:', imageId);
                // 可以在这里调用 imageViewer.open(dataUrl)
            }
        });
    }

    /**
     * 添加上传行
     */
    addUploadRow() {
        if (this.uploadRows.size >= this.maxUploadRows) {
            toast.warning(`最多添加${this.maxUploadRows}行附加上传`);
            return;
        }

        const rowId = `upload-row-${this.uploadRows.size + 1}`;
        const picIndex1 = this.uploadRows.size * 2 + 1;
        const picIndex2 = this.uploadRows.size * 2 + 2;

        const newRow = DOM.create('div', 'flex gap-3 items-center v2-upload-row');
        newRow.dataset.rowId = rowId;
        newRow.innerHTML = `
            <label for="${rowId}-pic1" class="v2-upload-empty v2-upload-main-empty" data-slot="additional-${picIndex1}">
                <span class="material-symbols-outlined text-3xl text-black/30">add_photo_alternate</span>
                <input id="${rowId}-pic1" type="file" accept="image/png,image/jpeg,image/jpg,image/webp" hidden>
            </label>
            <label for="${rowId}-pic2" class="v2-upload-empty v2-upload-main-empty" data-slot="additional-${picIndex2}">
                <span class="material-symbols-outlined text-3xl text-black/30">add_photo_alternate</span>
                <input id="${rowId}-pic2" type="file" accept="image/png,image/jpeg,image/jpg,image/webp" hidden>
            </label>
            <button class="v2-upload-empty-delete p-2 rounded-full hover:bg-red-500/10 transition-colors">
                <span class="material-symbols-outlined text-red-500">delete</span>
            </button>
        `;

        this.additionalUploadsContainer.appendChild(newRow);
        this.uploadRows.set(rowId, newRow);

        // 绑定删除行事件
        const deleteButtons = newRow.querySelectorAll('.v2-upload-empty-delete');
        deleteButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const rowIdToDelete = newRow.dataset.rowId;
                this.removeUploadRow(rowIdToDelete);
            });
        });

        // 绑定上传事件
        const inputs = newRow.querySelectorAll('input[type="file"]');
        inputs.forEach(input => {
            const label = input.previousElementSibling || input.parentElement;
            this.cacheLabelDefault(label);

            input.addEventListener('change', (e) => {
                if (e.target.files.length > 0) {
                    this.handleImageUpload(e.target.files[0], label);
                    e.target.value = '';
                }
            });
        });

        console.log('➕ 已添加上传行:', rowId, '当前行数:', this.uploadRows.size);
    }

    /**
     * 移除上传行
     */
    removeUploadRow(rowId) {
        const rowElement = this.uploadRows.get(rowId);
        if (!rowElement) return;

        // 删除该行关联的所有图片
        const labels = rowElement.querySelectorAll('label[data-slot]');
        labels.forEach(label => this.detachLabelImage(label));

        // 移除DOM
        rowElement.remove();
        this.uploadRows.delete(rowId);

        console.log('➖ 已移除上传行:', rowId, '剩余行数:', this.uploadRows.size);
    }

    /**
     * 获取所有上传的文件
     * @returns {Array<File>} - 文件数组
     */
    getFiles() {
        const files = [];
        for (const imageData of this.uploadedImages.values()) {
            files.push(imageData.file);
        }
        return files;
    }

    /**
     * 根据slot获取文件
     */
    getFileBySlot(slotKey) {
        const imageId = this.findImageBySlot(slotKey);
        if (imageId) {
            const imageData = this.uploadedImages.get(imageId);
            return imageData ? imageData.file : null;
        }
        return null;
    }

    /**
     * 清空所有上传
     */
    clear() {
        // 清空数据
        this.uploadedImages.clear();

        // 重置主上传框
        if (this.mainUploadLabel) this.resetLabelContent(this.mainUploadLabel);
        if (this.mainUploadLabelIcon) this.resetLabelContent(this.mainUploadLabelIcon);

        // 清空动态行
        this.uploadRows.forEach((_, rowId) => this.removeUploadRow(rowId));

        console.log('🧹 已清空所有上传');
    }

    /**
     * 获取上传统计
     */
    getStats() {
        return {
            totalImages: this.uploadedImages.size,
            totalRows: this.uploadRows.size,
            images: Array.from(this.uploadedImages.entries()).map(([id, data]) => ({
                id,
                name: data.name,
                slot: data.slot
            }))
        };
    }
}

export default UploadManager;
