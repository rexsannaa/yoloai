// app.js
// EasyYOLO 核心應用程式 - 精簡版

class EasyYOLO {
    constructor() {
        this.state = {
            currentStep: 1,
            uploadedImages: [],
            annotations: {},
            currentImageIndex: 0,
            model: null,
            isTraining: false,
            webcamStream: null
        };
        
        this.elements = this.cacheElements();
        this.init();
    }
    
    cacheElements() {
        return {
            uploadArea: document.getElementById('uploadArea'),
            fileInput: document.getElementById('fileInput'),
            imagePreview: document.getElementById('imagePreview'),
            annotationCanvas: document.getElementById('annotationCanvas'),
            visualizerCanvas: document.getElementById('visualizerCanvas'),
            webcam: document.getElementById('webcam'),
            detectionCanvas: document.getElementById('detectionCanvas')
        };
    }
    
    init() {
        this.setupEventListeners();
        this.annotator = new YOLOAnnotator({ canvasId: 'annotationCanvas' });
        this.visualizer = new YOLOVisualizer({ canvasId: 'visualizerCanvas' });
    }
    
    setupEventListeners() {
        // 檔案上傳
        const { uploadArea, fileInput } = this.elements;
        uploadArea?.addEventListener('click', () => fileInput?.click());
        uploadArea?.addEventListener('drop', e => this.handleDrop(e));
        uploadArea?.addEventListener('dragover', e => this.handleDragOver(e));
        uploadArea?.addEventListener('dragleave', () => uploadArea.classList.remove('drag-over'));
        fileInput?.addEventListener('change', e => this.handleFiles(e.target.files));
        
        // 步驟導航
        document.querySelectorAll('.next-btn').forEach((btn, idx) => {
            btn.addEventListener('click', () => this.goToStep(idx + 2));
        });
        
        // 功能按鈕
        this.bindButton('startTraining', () => this.startTraining());
        this.bindButton('startWebcam', () => this.startWebcam());
        this.bindButton('stopWebcam', () => this.stopWebcam());
        this.bindButton('exportModel', () => this.exportModel());
        this.bindButton('prevImage', () => this.navigateImage(-1));
        this.bindButton('nextImage', () => this.navigateImage(1));
    }
    
    bindButton(id, handler) {
        document.getElementById(id)?.addEventListener('click', handler);
    }
    
    handleDrop(e) {
        e.preventDefault();
        this.elements.uploadArea.classList.remove('drag-over');
        this.handleFiles(e.dataTransfer.files);
    }
    
    handleDragOver(e) {
        e.preventDefault();
        this.elements.uploadArea.classList.add('drag-over');
    }
    
    handleFiles(files) {
        const imageFiles = Array.from(files).filter(f => f.type.startsWith('image/'));
        
        if (!imageFiles.length) {
            alert('請選擇圖片檔案');
            return;
        }
        
        this.state.uploadedImages = [];
        this.elements.imagePreview.innerHTML = '';
        
        imageFiles.forEach(file => {
            const reader = new FileReader();
            reader.onload = e => this.processImage(e.target.result, file);
            reader.readAsDataURL(file);
        });
    }
    
    processImage(data, file) {
        const img = new Image();
        img.onload = () => {
            this.state.uploadedImages.push({
                name: file.name,
                data: data,
                width: img.width,
                height: img.height
            });
            
            this.createPreview(data, file.name);
            this.updateUploadStatus();
        };
        img.src = data;
    }
    
    createPreview(src, name) {
        const item = document.createElement('div');
        item.className = 'preview-item';
        item.innerHTML = `
            <img src="${src}" alt="${name}">
            <button class="delete-btn" onclick="easyYOLO.removeImage('${name}')">&times;</button>
        `;
        this.elements.imagePreview.appendChild(item);
    }
    
    removeImage(filename) {
        this.state.uploadedImages = this.state.uploadedImages.filter(img => img.name !== filename);
        this.updateUploadStatus();
        document.querySelector(`img[alt="${filename}"]`)?.parentElement.remove();
    }
    
    updateUploadStatus() {
        const count = this.state.uploadedImages.length;
        const hasEnough = count >= 10;
        
        document.getElementById('nextStep1').style.display = hasEnough ? 'inline-block' : 'none';
        this.elements.uploadArea.querySelector('h3').textContent = 
            hasEnough ? '已上傳足夠的圖片！' : `已上傳 ${count} 張，還需 ${10 - count} 張`;
    }
    
    goToStep(step) {
        document.querySelectorAll('.step-content').forEach(el => el.style.display = 'none');
        document.querySelectorAll('.workflow-step').forEach(el => el.classList.remove('active'));
        
        document.getElementById(`step${step}`).style.display = 'block';
        document.querySelector(`[data-step="${step}"]`).classList.add('active');
        
        this.state.currentStep = step;
        
        if (step === 2) this.showImageForAnnotation(0);
        if (step === 3) this.visualizer.drawNeuralNetwork(0);
    }
    
    showImageForAnnotation(index) {
        if (index < 0 || index >= this.state.uploadedImages.length) return;
        
        this.state.currentImageIndex = index;
        this.annotator.loadImage(this.state.uploadedImages[index], index);
        
        document.getElementById('imageCounter').textContent = 
            `${index + 1}/${this.state.uploadedImages.length}`;
    }
    
    navigateImage(direction) {
        const newIndex = this.state.currentImageIndex + direction;
        if (newIndex >= 0 && newIndex < this.state.uploadedImages.length) {
            this.showImageForAnnotation(newIndex);
        }
    }
    
    async startTraining() {
        if (this.state.isTraining) return;
        
        this.state.isTraining = true;
        const button = document.getElementById('startTraining');
        button.disabled = true;
        button.textContent = '訓練中...';
        
        this.visualizer.animateTraining(10000);
        
        // 模擬訓練過程
        for (let progress = 0; progress <= 100; progress += 5) {
            await new Promise(resolve => setTimeout(resolve, 100));
            document.getElementById('progressFill').style.width = `${progress}%`;
            document.getElementById('trainingStatus').textContent = 
                `訓練進度：${progress}% - Epoch ${Math.floor(progress / 5)}/20`;
        }
        
        button.textContent = '訓練完成';
        button.disabled = false;
        document.getElementById('nextStep3').style.display = 'inline-block';
        this.state.isTraining = false;
    }
    
    async startWebcam() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ 
                video: { width: 640, height: 480 } 
            });
            
            this.elements.webcam.srcObject = stream;
            this.state.webcamStream = stream;
            
            document.getElementById('startWebcam').style.display = 'none';
            document.getElementById('stopWebcam').style.display = 'inline-block';
            
            this.detectObjects();
        } catch (error) {
            alert('無法存取攝影機：' + error.message);
        }
    }
    
    stopWebcam() {
        this.state.webcamStream?.getTracks().forEach(track => track.stop());
        this.elements.webcam.srcObject = null;
        this.state.webcamStream = null;
        
        document.getElementById('startWebcam').style.display = 'inline-block';
        document.getElementById('stopWebcam').style.display = 'none';
    }
    
    detectObjects() {
        if (!this.elements.webcam.srcObject) return;
        
        // 模擬偵測
        const ctx = this.elements.detectionCanvas.getContext('2d');
        const draw = () => {
            if (!this.elements.webcam.srcObject) return;
            
            ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
            
            // 模擬偵測框
            const boxes = this.generateMockDetections();
            boxes.forEach(box => this.drawDetectionBox(ctx, box));
            
            requestAnimationFrame(draw);
        };
        draw();
    }
    
    generateMockDetections() {
        return [{
            x: Math.random() * 400 + 50,
            y: Math.random() * 200 + 50,
            width: 100,
            height: 100,
            confidence: 0.85 + Math.random() * 0.1,
            label: document.getElementById('objectName')?.value || '物件'
        }];
    }
    
    drawDetectionBox(ctx, box) {
        ctx.strokeStyle = '#00ff00';
        ctx.lineWidth = 3;
        ctx.strokeRect(box.x, box.y, box.width, box.height);
        
        const text = `${box.label} (${(box.confidence * 100).toFixed(1)}%)`;
        ctx.font = '16px "Microsoft JhengHei"';
        const textWidth = ctx.measureText(text).width;
        
        ctx.fillStyle = '#00ff00';
        ctx.fillRect(box.x, box.y - 25, textWidth + 10, 25);
        
        ctx.fillStyle = '#000';
        ctx.fillText(text, box.x + 5, box.y - 7);
    }
    
    exportModel() {
        const config = {
            modelInfo: {
                name: 'EasyYOLO 模型',
                version: '1.0',
                trainDate: new Date().toISOString(),
                classes: [document.getElementById('objectName')?.value || '物件']
            },
            annotations: this.state.annotations,
            trainingParams: { epochs: 20, batchSize: 8, learningRate: 0.001 }
        };
        
        const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'model_config.json';
        link.click();
    }
}

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    window.easyYOLO = new EasyYOLO();
});