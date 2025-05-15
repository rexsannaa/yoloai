// annotator.js
// EasyYOLO 標註工具模組 - 精簡整合版

class YOLOAnnotator {
    constructor(config = {}) {
        // 初始化配置
        this.config = {
            canvasId: config.canvasId || 'annotationCanvas',
            imagePreviewId: config.imagePreviewId || 'imagePreview',
            maxImageSize: config.maxImageSize || 800,
            // 繁體中文字體設定
            fontFamily: '"Microsoft JhengHei", "微軟正黑體", "PingFang TC", "蘋方-繁", sans-serif',
            fontSize: 14,
            colors: {
                active: '#ff0000',
                saved: '#00ff00',
                hover: '#ffff00',
                text: '#ffffff',
                background: 'rgba(0, 0, 0, 0.7)'
            },
            // 智慧標註設定
            enableAutoLabel: config.enableAutoLabel || false,
            autoLabelThreshold: config.autoLabelThreshold || 0.7,
            ...config
        };
        
        // 狀態管理
        this.state = {
            currentImage: null,
            currentImageIndex: 0,
            images: [],
            annotations: {},
            isDrawing: false,
            startPoint: null,
            currentBox: null,
            hoveredBox: null,
            selectedBox: null,
            mode: 'draw', // 'draw', 'select', 'resize'
            resizeHandle: null
        };
        
        // DOM 元素
        this.canvas = null;
        this.ctx = null;
        
        // 事件處理
        this.mouseHandlers = {
            down: this.handleMouseDown.bind(this),
            move: this.handleMouseMove.bind(this),
            up: this.handleMouseUp.bind(this),
            leave: this.handleMouseLeave.bind(this),
            wheel: this.handleWheel.bind(this)
        };
        
        // 鍵盤快捷鍵
        this.keyboardHandler = this.handleKeyboard.bind(this);
        
        // 初始化
        this.init();
    }
    
    init() {
        // 初始化畫布
        this.canvas = document.getElementById(this.config.canvasId);
        if (!this.canvas) {
            console.error('找不到標註畫布元素');
            return;
        }
        
        this.ctx = this.canvas.getContext('2d');
        this.ctx.font = `${this.config.fontSize}px ${this.config.fontFamily}`;
        
        // 綁定事件
        this.bindEvents();
        
        // 載入已儲存的標註
        this.loadSavedAnnotations();
        
        console.log('標註工具初始化完成');
    }
    
    bindEvents() {
        // 滑鼠事件
        this.canvas.addEventListener('mousedown', this.mouseHandlers.down);
        this.canvas.addEventListener('mousemove', this.mouseHandlers.move);
        this.canvas.addEventListener('mouseup', this.mouseHandlers.up);
        this.canvas.addEventListener('mouseleave', this.mouseHandlers.leave);
        this.canvas.addEventListener('wheel', this.mouseHandlers.wheel);
        
        // 鍵盤事件
        document.addEventListener('keydown', this.keyboardHandler);
        
        // 觸控支援
        this.canvas.addEventListener('touchstart', (e) => this.handleTouchStart(e));
        this.canvas.addEventListener('touchmove', (e) => this.handleTouchMove(e));
        this.canvas.addEventListener('touchend', (e) => this.handleTouchEnd(e));
    }
    
    // 載入圖片進行標註
    loadImage(imageData, index = 0) {
        const img = new Image();
        img.onload = () => {
            this.state.currentImage = img;
            this.state.currentImageIndex = index;
            
            // 調整畫布大小
            this.resizeCanvas(img.width, img.height);
            
            // 重繪畫布
            this.redraw();
            
            // 載入該圖片的標註
            this.loadImageAnnotations(imageData.name);
        };
        
        img.src = imageData.data;
    }
    
    resizeCanvas(originalWidth, originalHeight) {
        const maxSize = this.config.maxImageSize;
        let width = originalWidth;
        let height = originalHeight;
        
        // 保持比例縮放
        if (width > maxSize || height > maxSize) {
            const ratio = Math.min(maxSize / width, maxSize / height);
            width *= ratio;
            height *= ratio;
        }
        
        this.canvas.width = width;
        this.canvas.height = height;
        this.state.scale = width / originalWidth;
    }
    
    // 滑鼠事件處理
    handleMouseDown(e) {
        const point = this.getMousePosition(e);
        
        if (this.state.mode === 'draw') {
            this.startDrawing(point);
        } else if (this.state.mode === 'select') {
            this.selectBox(point);
        }
    }
    
    handleMouseMove(e) {
        const point = this.getMousePosition(e);
        
        if (this.state.isDrawing) {
            this.updateDrawing(point);
        } else if (this.state.selectedBox && this.state.resizeHandle) {
            this.resizeBox(point);
        } else {
            this.checkHover(point);
        }
        
        this.redraw();
    }
    
    handleMouseUp(e) {
        if (this.state.isDrawing) {
            this.finishDrawing();
        }
        
        this.state.resizeHandle = null;
    }
    
    handleMouseLeave(e) {
        this.state.hoveredBox = null;
        this.redraw();
    }
    
    handleWheel(e) {
        e.preventDefault();
        // 可實現縮放功能
    }
    
    // 鍵盤快捷鍵
    handleKeyboard(e) {
        switch(e.key) {
            case 'Delete':
            case 'Backspace':
                if (this.state.selectedBox !== null) {
                    this.deleteAnnotation(this.state.selectedBox);
                }
                break;
            case 'd':
                this.state.mode = 'draw';
                break;
            case 's':
                this.state.mode = 'select';
                break;
            case 'Escape':
                this.cancelDrawing();
                break;
            case 'Enter':
                this.quickSave();
                break;
        }
    }
    
    // 觸控事件處理
    handleTouchStart(e) {
        e.preventDefault();
        const touch = e.touches[0];
        const point = this.getTouchPosition(touch);
        this.handleMouseDown({ clientX: touch.clientX, clientY: touch.clientY });
    }
    
    handleTouchMove(e) {
        e.preventDefault();
        const touch = e.touches[0];
        this.handleMouseMove({ clientX: touch.clientX, clientY: touch.clientY });
    }
    
    handleTouchEnd(e) {
        e.preventDefault();
        this.handleMouseUp({});
    }
    
    // 取得滑鼠位置
    getMousePosition(e) {
        const rect = this.canvas.getBoundingClientRect();
        return {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        };
    }
    
    getTouchPosition(touch) {
        const rect = this.canvas.getBoundingClientRect();
        return {
            x: touch.clientX - rect.left,
            y: touch.clientY - rect.top
        };
    }
    
    // 開始繪製標註框
    startDrawing(point) {
        this.state.isDrawing = true;
        this.state.startPoint = point;
        this.state.currentBox = {
            x: point.x,
            y: point.y,
            width: 0,
            height: 0
        };
    }
    
    // 更新繪製中的標註框
    updateDrawing(point) {
        if (!this.state.isDrawing) return;
        
        this.state.currentBox = {
            x: Math.min(this.state.startPoint.x, point.x),
            y: Math.min(this.state.startPoint.y, point.y),
            width: Math.abs(point.x - this.state.startPoint.x),
            height: Math.abs(point.y - this.state.startPoint.y)
        };
    }
    
    // 完成繪製
    finishDrawing() {
        if (!this.state.isDrawing) return;
        
        this.state.isDrawing = false;
        
        // 檢查框的最小大小
        if (this.state.currentBox.width < 10 || this.state.currentBox.height < 10) {
            this.state.currentBox = null;
            return;
        }
        
        // 顯示標籤輸入對話框
        this.showLabelDialog(this.state.currentBox);
    }
    
    // 取消繪製
    cancelDrawing() {
        this.state.isDrawing = false;
        this.state.currentBox = null;
        this.redraw();
    }
    
    // 顯示標籤輸入對話框
    showLabelDialog(box) {
        const label = prompt('請輸入物件標籤：', '物件');
        
        if (label) {
            this.addAnnotation({
                ...box,
                label: label,
                id: Date.now(),
                confidence: 1.0
            });
        }
        
        this.state.currentBox = null;
        this.redraw();
    }
    
    // 新增標註
    addAnnotation(annotation) {
        const imageKey = this.getCurrentImageKey();
        
        if (!this.state.annotations[imageKey]) {
            this.state.annotations[imageKey] = [];
        }
        
        // 轉換座標到原始圖片尺寸
        const scaledAnnotation = {
            ...annotation,
            x: annotation.x / this.state.scale,
            y: annotation.y / this.state.scale,
            width: annotation.width / this.state.scale,
            height: annotation.height / this.state.scale
        };
        
        this.state.annotations[imageKey].push(scaledAnnotation);
        this.saveAnnotations();
    }
    
    // 刪除標註
    deleteAnnotation(index) {
        const imageKey = this.getCurrentImageKey();
        
        if (this.state.annotations[imageKey]) {
            this.state.annotations[imageKey].splice(index, 1);
            this.state.selectedBox = null;
            this.saveAnnotations();
            this.redraw();
        }
    }
    
    // 選擇標註框
    selectBox(point) {
        const imageKey = this.getCurrentImageKey();
        const annotations = this.state.annotations[imageKey] || [];
        
        // 從後往前檢查，優先選擇上層的框
        for (let i = annotations.length - 1; i >= 0; i--) {
            const ann = annotations[i];
            const box = {
                x: ann.x * this.state.scale,
                y: ann.y * this.state.scale,
                width: ann.width * this.state.scale,
                height: ann.height * this.state.scale
            };
            
            if (this.isPointInBox(point, box)) {
                this.state.selectedBox = i;
                
                // 檢查是否點擊到調整控制點
                this.state.resizeHandle = this.getResizeHandle(point, box);
                return;
            }
        }
        
        this.state.selectedBox = null;
    }
    
    // 檢查滑鼠懸停
    checkHover(point) {
        const imageKey = this.getCurrentImageKey();
        const annotations = this.state.annotations[imageKey] || [];
        
        this.state.hoveredBox = null;
        
        for (let i = annotations.length - 1; i >= 0; i--) {
            const ann = annotations[i];
            const box = {
                x: ann.x * this.state.scale,
                y: ann.y * this.state.scale,
                width: ann.width * this.state.scale,
                height: ann.height * this.state.scale
            };
            
            if (this.isPointInBox(point, box)) {
                this.state.hoveredBox = i;
                this.canvas.style.cursor = 'pointer';
                return;
            }
        }
        
        this.canvas.style.cursor = this.state.mode === 'draw' ? 'crosshair' : 'default';
    }
    
    // 檢查點是否在框內
    isPointInBox(point, box) {
        return point.x >= box.x && 
               point.x <= box.x + box.width &&
               point.y >= box.y && 
               point.y <= box.y + box.height;
    }
    
    // 取得調整控制點
    getResizeHandle(point, box) {
        const handleSize = 8;
        const handles = {
            'nw': { x: box.x, y: box.y },
            'ne': { x: box.x + box.width, y: box.y },
            'sw': { x: box.x, y: box.y + box.height },
            'se': { x: box.x + box.width, y: box.y + box.height }
        };
        
        for (const [key, handle] of Object.entries(handles)) {
            if (Math.abs(point.x - handle.x) < handleSize && 
                Math.abs(point.y - handle.y) < handleSize) {
                return key;
            }
        }
        
        return null;
    }
    
    // 調整框大小
    resizeBox(point) {
        if (!this.state.selectedBox || !this.state.resizeHandle) return;
        
        const imageKey = this.getCurrentImageKey();
        const annotation = this.state.annotations[imageKey][this.state.selectedBox];
        const box = {
            x: annotation.x * this.state.scale,
            y: annotation.y * this.state.scale,
            width: annotation.width * this.state.scale,
            height: annotation.height * this.state.scale
        };
        
        switch(this.state.resizeHandle) {
            case 'nw':
                box.width += box.x - point.x;
                box.height += box.y - point.y;
                box.x = point.x;
                box.y = point.y;
                break;
            case 'ne':
                box.width = point.x - box.x;
                box.height += box.y - point.y;
                box.y = point.y;
                break;
            case 'sw':
                box.width += box.x - point.x;
                box.height = point.y - box.y;
                box.x = point.x;
                break;
            case 'se':
                box.width = point.x - box.x;
                box.height = point.y - box.y;
                break;
        }
        
        // 更新標註（轉換回原始尺寸）
        annotation.x = box.x / this.state.scale;
        annotation.y = box.y / this.state.scale;
        annotation.width = box.width / this.state.scale;
        annotation.height = box.height / this.state.scale;
        
        this.saveAnnotations();
    }
    
    // 重繪畫布
    redraw() {
        if (!this.ctx || !this.state.currentImage) return;
        
        // 清除畫布
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 繪製圖片
        this.ctx.drawImage(this.state.currentImage, 0, 0, this.canvas.width, this.canvas.height);
        
        // 繪製已保存的標註
        this.drawAnnotations();
        
        // 繪製當前繪製中的框
        if (this.state.currentBox) {
            this.drawBox(this.state.currentBox, this.config.colors.active, '新標註');
        }
    }
    
    // 繪製所有標註
    drawAnnotations() {
        const imageKey = this.getCurrentImageKey();
        const annotations = this.state.annotations[imageKey] || [];
        
        annotations.forEach((ann, index) => {
            const box = {
                x: ann.x * this.state.scale,
                y: ann.y * this.state.scale,
                width: ann.width * this.state.scale,
                height: ann.height * this.state.scale
            };
            
            let color = this.config.colors.saved;
            
            if (index === this.state.selectedBox) {
                color = this.config.colors.active;
                this.drawResizeHandles(box);
            } else if (index === this.state.hoveredBox) {
                color = this.config.colors.hover;
            }
            
            this.drawBox(box, color, ann.label, ann.confidence);
        });
    }
    
    // 繪製單個標註框
    drawBox(box, color, label = '', confidence = null) {
        const ctx = this.ctx;
        
        // 繪製框
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.strokeRect(box.x, box.y, box.width, box.height);
        
        // 繪製標籤背景
        if (label) {
            const text = confidence !== null ? 
                `${label} (${(confidence * 100).toFixed(1)}%)` : 
                label;
            
            ctx.font = `${this.config.fontSize}px ${this.config.fontFamily}`;
            const textMetrics = ctx.measureText(text);
            const textHeight = this.config.fontSize + 4;
            
            // 標籤背景
            ctx.fillStyle = this.config.colors.background;
            ctx.fillRect(box.x, box.y - textHeight, textMetrics.width + 8, textHeight);
            
            // 標籤文字 - 確保繁體中文正確顯示
            ctx.fillStyle = this.config.colors.text;
            ctx.fillText(text, box.x + 4, box.y - 4);
        }
    }
    
    // 繪製調整控制點
    drawResizeHandles(box) {
        const ctx = this.ctx;
        const handleSize = 6;
        
        const handles = [
            { x: box.x, y: box.y },                          // 左上
            { x: box.x + box.width, y: box.y },              // 右上
            { x: box.x, y: box.y + box.height },             // 左下
            { x: box.x + box.width, y: box.y + box.height }  // 右下
        ];
        
        handles.forEach(handle => {
            ctx.fillStyle = this.config.colors.active;
            ctx.fillRect(
                handle.x - handleSize / 2,
                handle.y - handleSize / 2,
                handleSize,
                handleSize
            );
        });
    }
    
    // 取得當前圖片鍵值
    getCurrentImageKey() {
        return this.state.images[this.state.currentImageIndex]?.name || '';
    }
    
    // 載入圖片標註
    loadImageAnnotations(imageKey) {
        // 如果有該圖片的標註，重繪
        if (this.state.annotations[imageKey]) {
            this.redraw();
        }
    }
    
    // 儲存標註到 LocalStorage
    saveAnnotations() {
        localStorage.setItem('easyYoloAnnotations', JSON.stringify(this.state.annotations));
    }
    
    // 載入已儲存的標註
    loadSavedAnnotations() {
        const saved = localStorage.getItem('easyYoloAnnotations');
        if (saved) {
            try {
                this.state.annotations = JSON.parse(saved);
            } catch (e) {
                console.error('載入標註失敗:', e);
            }
        }
    }
    
    // 快速儲存當前狀態
    quickSave() {
        this.saveAnnotations();
        this.showToast('標註已儲存');
    }
    
    // 顯示提示訊息
    showToast(message) {
        // 建立提示元素
        const toast = document.createElement('div');
        toast.textContent = message;
        toast.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: rgba(0, 0, 0, 0.8);
            color: white;
            padding: 10px 20px;
            border-radius: 5px;
            font-family: ${this.config.fontFamily};
            z-index: 1000;
        `;
        
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.style.opacity = '0';
            setTimeout(() => document.body.removeChild(toast), 300);
        }, 2000);
    }
    
    // 匯出標註資料
    exportAnnotations() {
        const data = {
            annotations: this.state.annotations,
            metadata: {
                exportDate: new Date().toISOString(),
                imageCount: Object.keys(this.state.annotations).length,
                totalAnnotations: Object.values(this.state.annotations)
                    .reduce((sum, anns) => sum + anns.length, 0)
            }
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], 
                             { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `annotations_${Date.now()}.json`;
        link.click();
        
        URL.revokeObjectURL(url);
    }
    
    // 匯入標註資料
    async importAnnotations(file) {
        try {
            const text = await file.text();
            const data = JSON.parse(text);
            
            if (data.annotations) {
                this.state.annotations = data.annotations;
                this.saveAnnotations();
                this.redraw();
                this.showToast('標註匯入成功');
            }
        } catch (e) {
            console.error('匯入標註失敗:', e);
            this.showToast('匯入失敗');
        }
    }
    
    // 批次操作 API
    batchDelete(indices) {
        const imageKey = this.getCurrentImageKey();
        if (!this.state.annotations[imageKey]) return;
        
        indices.sort((a, b) => b - a);
        indices.forEach(index => {
            this.state.annotations[imageKey].splice(index, 1);
        });
        
        this.saveAnnotations();
        this.redraw();
    }
    
    // 設定圖片列表
    setImages(images) {
        this.state.images = images;
    }
    
    // 導航到指定圖片
    navigateToImage(index) {
        if (index >= 0 && index < this.state.images.length) {
            this.loadImage(this.state.images[index], index);
        }
    }
    
    // 取得當前標註統計
    getStatistics() {
        const stats = {
            totalImages: Object.keys(this.state.annotations).length,
            totalAnnotations: 0,
            annotationsByClass: {}
        };
        
        Object.values(this.state.annotations).forEach(annotations => {
            annotations.forEach(ann => {
                stats.totalAnnotations++;
                
                if (!stats.annotationsByClass[ann.label]) {
                    stats.annotationsByClass[ann.label] = 0;
                }
                stats.annotationsByClass[ann.label]++;
            });
        });
        
        return stats;
    }
    
    // 清除所有標註
    clearAll() {
        if (confirm('確定要清除所有標註嗎？此操作無法復原。')) {
            this.state.annotations = {};
            this.saveAnnotations();
            this.redraw();
        }
    }
    
    // 智慧輔助標註（預留介面）
    async autoAnnotate() {
        if (!this.config.enableAutoLabel) {
            this.showToast('智慧標註功能未啟用');
            return;
        }
        
        // 這裡可以整合 AI 模型進行自動標註
        this.showToast('正在進行智慧標註...');
        
        // 模擬自動標註
        setTimeout(() => {
            const mockAnnotation = {
                x: 100,
                y: 100,
                width: 200,
                height: 150,
                label: '自動偵測物件',
                confidence: 0.85,
                id: Date.now()
            };
            
            this.addAnnotation(mockAnnotation);
            this.showToast('智慧標註完成');
        }, 1000);
    }
}

// 工具函數
const annotatorUtils = {
    // 驗證標註格式
    validateAnnotation(annotation) {
        const required = ['x', 'y', 'width', 'height', 'label'];
        return required.every(field => annotation.hasOwnProperty(field));
    },
    
    // 轉換標註格式（YOLO 格式）
    convertToYOLO(annotation, imageWidth, imageHeight) {
        const centerX = (annotation.x + annotation.width / 2) / imageWidth;
        const centerY = (annotation.y + annotation.height / 2) / imageHeight;
        const width = annotation.width / imageWidth;
        const height = annotation.height / imageHeight;
        
        return {
            class: annotation.label,
            x: centerX,
            y: centerY,
            width: width,
            height: height
        };
    },
    
    // 從 YOLO 格式轉換
    convertFromYOLO(yoloData, imageWidth, imageHeight) {
        const width = yoloData.width * imageWidth;
        const height = yoloData.height * imageHeight;
        const x = yoloData.x * imageWidth - width / 2;
        const y = yoloData.y * imageHeight - height / 2;
        
        return {
            x: x,
            y: y,
            width: width,
            height: height,
            label: yoloData.class
        };
    },
    
    // 計算 IoU (Intersection over Union)
    calculateIoU(box1, box2) {
        const x1 = Math.max(box1.x, box2.x);
        const y1 = Math.max(box1.y, box2.y);
        const x2 = Math.min(box1.x + box1.width, box2.x + box2.width);
        const y2 = Math.min(box1.y + box1.height, box2.y + box2.height);
        
        if (x2 <= x1 || y2 <= y1) return 0;
        
        const intersection = (x2 - x1) * (y2 - y1);
        const area1 = box1.width * box1.height;
        const area2 = box2.width * box2.height;
        const union = area1 + area2 - intersection;
        
        return intersection / union;
    }
};

// 匯出模組
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { YOLOAnnotator, annotatorUtils };
} else {
    window.YOLOAnnotator = YOLOAnnotator;
    window.annotatorUtils = annotatorUtils;
}

// 初始化時確保繁體中文字體載入
document.addEventListener('DOMContentLoaded', () => {
    const style = document.createElement('style');
    style.textContent = `
        @font-face {
            font-family: 'Microsoft JhengHei';
            src: local('Microsoft JhengHei'), local('微軟正黑體');
        }
    `;
    document.head.appendChild(style);
});