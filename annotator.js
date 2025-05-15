// annotator.js
// EasyYOLO 標註工具模組 - 精簡版

class YOLOAnnotator {
    constructor(config = {}) {
        this.config = {
            canvasId: 'annotationCanvas',
            maxImageSize: 800,
            fontFamily: '"Microsoft JhengHei", sans-serif',
            colors: {
                active: '#ff0000',
                saved: '#00ff00',
                hover: '#ffff00',
                text: '#ffffff',
                background: 'rgba(0, 0, 0, 0.7)'
            },
            ...config
        };
        
        this.state = {
            currentImage: null,
            currentImageIndex: 0,
            annotations: {},
            isDrawing: false,
            startPoint: null,
            currentBox: null
        };
        
        this.init();
    }
    
    init() {
        this.canvas = document.getElementById(this.config.canvasId);
        if (!this.canvas) return;
        
        this.ctx = this.canvas.getContext('2d');
        this.ctx.font = `14px ${this.config.fontFamily}`;
        
        this.bindEvents();
        this.loadSavedAnnotations();
    }
    
    bindEvents() {
        this.canvas.addEventListener('mousedown', e => this.handleMouseDown(e));
        this.canvas.addEventListener('mousemove', e => this.handleMouseMove(e));
        this.canvas.addEventListener('mouseup', e => this.handleMouseUp(e));
        this.canvas.addEventListener('mouseleave', () => this.handleMouseLeave());
    }
    
    loadImage(imageData, index = 0) {
        const img = new Image();
        img.onload = () => {
            this.state.currentImage = img;
            this.state.currentImageIndex = index;
            this.resizeCanvas(img.width, img.height);
            this.redraw();
        };
        img.src = imageData.data;
    }
    
    resizeCanvas(originalWidth, originalHeight) {
        const maxSize = this.config.maxImageSize;
        let width = originalWidth;
        let height = originalHeight;
        
        if (width > maxSize || height > maxSize) {
            const ratio = Math.min(maxSize / width, maxSize / height);
            width *= ratio;
            height *= ratio;
        }
        
        this.canvas.width = width;
        this.canvas.height = height;
        this.state.scale = width / originalWidth;
    }
    
    handleMouseDown(e) {
        const point = this.getMousePosition(e);
        this.state.isDrawing = true;
        this.state.startPoint = point;
        this.state.currentBox = { x: point.x, y: point.y, width: 0, height: 0 };
    }
    
    handleMouseMove(e) {
        const point = this.getMousePosition(e);
        
        if (this.state.isDrawing) {
            this.state.currentBox = {
                x: Math.min(this.state.startPoint.x, point.x),
                y: Math.min(this.state.startPoint.y, point.y),
                width: Math.abs(point.x - this.state.startPoint.x),
                height: Math.abs(point.y - this.state.startPoint.y)
            };
            this.redraw();
        }
    }
    
    handleMouseUp() {
        if (!this.state.isDrawing) return;
        
        this.state.isDrawing = false;
        
        if (this.state.currentBox.width < 10 || this.state.currentBox.height < 10) {
            this.state.currentBox = null;
            return;
        }
        
        const label = prompt('請輸入物件標籤：', '物件');
        if (label) {
            this.addAnnotation({
                ...this.state.currentBox,
                label: label,
                id: Date.now()
            });
        }
        
        this.state.currentBox = null;
        this.redraw();
    }
    
    handleMouseLeave() {
        if (this.state.isDrawing) {
            this.state.isDrawing = false;
            this.state.currentBox = null;
            this.redraw();
        }
    }
    
    getMousePosition(e) {
        const rect = this.canvas.getBoundingClientRect();
        return {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        };
    }
    
    addAnnotation(annotation) {
        const imageKey = this.getCurrentImageKey();
        if (!this.state.annotations[imageKey]) {
            this.state.annotations[imageKey] = [];
        }
        
        this.state.annotations[imageKey].push({
            ...annotation,
            x: annotation.x / this.state.scale,
            y: annotation.y / this.state.scale,
            width: annotation.width / this.state.scale,
            height: annotation.height / this.state.scale
        });
        
        this.saveAnnotations();
    }
    
    redraw() {
        if (!this.ctx || !this.state.currentImage) return;
        
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.drawImage(this.state.currentImage, 0, 0, this.canvas.width, this.canvas.height);
        
        this.drawAnnotations();
        
        if (this.state.currentBox) {
            this.drawBox(this.state.currentBox, this.config.colors.active, '新標註');
        }
    }
    
    drawAnnotations() {
        const imageKey = this.getCurrentImageKey();
        const annotations = this.state.annotations[imageKey] || [];
        
        annotations.forEach(ann => {
            const box = {
                x: ann.x * this.state.scale,
                y: ann.y * this.state.scale,
                width: ann.width * this.state.scale,
                height: ann.height * this.state.scale
            };
            this.drawBox(box, this.config.colors.saved, ann.label);
        });
    }
    
    drawBox(box, color, label = '') {
        const ctx = this.ctx;
        
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.strokeRect(box.x, box.y, box.width, box.height);
        
        if (label) {
            ctx.font = `14px ${this.config.fontFamily}`;
            const textWidth = ctx.measureText(label).width;
            
            ctx.fillStyle = this.config.colors.background;
            ctx.fillRect(box.x, box.y - 20, textWidth + 8, 20);
            
            ctx.fillStyle = this.config.colors.text;
            ctx.fillText(label, box.x + 4, box.y - 5);
        }
    }
    
    getCurrentImageKey() {
        return `image_${this.state.currentImageIndex}`;
    }
    
    saveAnnotations() {
        localStorage.setItem('easyYoloAnnotations', JSON.stringify(this.state.annotations));
    }
    
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
}