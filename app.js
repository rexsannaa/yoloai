.preview-item:hover {// app.js
// EasyYOLO 核心應用程式模組 - 精簡整合版

class EasyYOLO {
    constructor() {
        // 核心狀態管理
        this.state = {
            currentStep: 1,
            uploadedImages: [],
            annotations: {},
            currentImageIndex: 0,
            model: null,
            isTraining: false,
            webcamStream: null
        };
        
        // 初始化 DOM 元素快取
        this.elements = {
            uploadArea: document.getElementById('uploadArea'),
            fileInput: document.getElementById('fileInput'),
            imagePreview: document.getElementById('imagePreview'),
            annotationCanvas: document.getElementById('annotationCanvas'),
            visualizerCanvas: document.getElementById('visualizerCanvas'),
            webcam: document.getElementById('webcam'),
            detectionCanvas: document.getElementById('detectionCanvas')
        };
        
        // 初始化應用程式
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.setupCanvasContexts();
        console.log('EasyYOLO 初始化完成');
    }
    
    setupCanvasContexts() {
        this.contexts = {
            annotation: this.elements.annotationCanvas ? this.elements.annotationCanvas.getContext('2d') : null,
            visualizer: this.elements.visualizerCanvas ? this.elements.visualizerCanvas.getContext('2d') : null,
            detection: this.elements.detectionCanvas ? this.elements.detectionCanvas.getContext('2d') : null
        };
    }
    
    setupEventListeners() {
        // 檔案上傳事件
        this.setupUploadEvents();
        
        // 步驟導航事件
        const nextStep1 = document.getElementById('nextStep1');
        const nextStep2 = document.getElementById('nextStep2');
        const nextStep3 = document.getElementById('nextStep3');
        
        if (nextStep1) nextStep1.addEventListener('click', () => this.goToStep(2));
        if (nextStep2) nextStep2.addEventListener('click', () => this.goToStep(3));
        if (nextStep3) nextStep3.addEventListener('click', () => this.goToStep(4));
        
        // 標註工具事件
        this.setupAnnotationEvents();
        
        // 訓練控制事件
        const startTraining = document.getElementById('startTraining');
        if (startTraining) startTraining.addEventListener('click', () => this.startTraining());
        
        // 攝影機控制事件
        const startWebcam = document.getElementById('startWebcam');
        const stopWebcam = document.getElementById('stopWebcam');
        
        if (startWebcam) startWebcam.addEventListener('click', () => this.startWebcam());
        if (stopWebcam) stopWebcam.addEventListener('click', () => this.stopWebcam());
        
        // 匯出模型事件
        const exportModel = document.getElementById('exportModel');
        if (exportModel) exportModel.addEventListener('click', () => this.exportModel());
    }
    
    setupUploadEvents() {
        const { uploadArea, fileInput } = this.elements;
        
        if (!uploadArea || !fileInput) {
            console.error('上傳元素未找到');
            return;
        }
        
        // 點擊上傳區域觸發檔案選擇
        uploadArea.addEventListener('click', () => fileInput.click());
        
        // 拖曳進入
        uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadArea.classList.add('drag-over');
        });
        
        // 拖曳離開
        uploadArea.addEventListener('dragleave', () => {
            uploadArea.classList.remove('drag-over');
        });
        
        // 拖放檔案
        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadArea.classList.remove('drag-over');
            this.handleFiles(e.dataTransfer.files);
        });
        
        // 選擇檔案
        fileInput.addEventListener('change', (e) => {
            this.handleFiles(e.target.files);
        });
    }
    
    setupAnnotationEvents() {
        const canvas = this.elements.annotationCanvas;
        if (!canvas) return;
        
        let isDrawing = false;
        let startX, startY;
        
        canvas.addEventListener('mousedown', (e) => {
            isDrawing = true;
            const rect = canvas.getBoundingClientRect();
            startX = e.clientX - rect.left;
            startY = e.clientY - rect.top;
        });
        
        canvas.addEventListener('mousemove', (e) => {
            if (!isDrawing) return;
            
            const rect = canvas.getBoundingClientRect();
            const currentX = e.clientX - rect.left;
            const currentY = e.clientY - rect.top;
            
            this.redrawAnnotationCanvas();
            
            const ctx = this.contexts.annotation;
            if (ctx) {
                ctx.strokeStyle = 'red';
                ctx.lineWidth = 2;
                ctx.strokeRect(startX, startY, currentX - startX, currentY - startY);
            }
        });
        
        canvas.addEventListener('mouseup', (e) => {
            if (!isDrawing) return;
            isDrawing = false;
            
            const rect = canvas.getBoundingClientRect();
            const endX = e.clientX - rect.left;
            const endY = e.clientY - rect.top;
            
            this.addAnnotation(startX, startY, endX, endY);
            this.redrawAnnotationCanvas();
        });
        
        // 圖片導航事件
        const prevImage = document.getElementById('prevImage');
        const nextImage = document.getElementById('nextImage');
        const saveAnnotations = document.getElementById('saveAnnotations');
        
        if (prevImage) prevImage.addEventListener('click', () => this.navigateImage(-1));
        if (nextImage) nextImage.addEventListener('click', () => this.navigateImage(1));
        if (saveAnnotations) saveAnnotations.addEventListener('click', () => this.saveAnnotations());
    }
    
    handleFiles(files) {
        const imageFiles = Array.from(files).filter(file => file.type.startsWith('image/'));
        
        if (imageFiles.length === 0) {
            alert('請選擇圖片檔案');
            return;
        }
        
        // 清空之前的圖片
        this.state.uploadedImages = [];
        this.elements.imagePreview.innerHTML = '';
        
        let loadedCount = 0;
        
        imageFiles.forEach((file) => {
            const reader = new FileReader();
            
            reader.onload = (e) => {
                // 創建圖片物件來取得尺寸
                const img = new Image();
                img.onload = () => {
                    this.state.uploadedImages.push({
                        name: file.name,
                        data: e.target.result,
                        width: img.width,
                        height: img.height,
                        file: file
                    });
                    
                    this.createImagePreview(e.target.result, file.name);
                    
                    loadedCount++;
                    
                    // 檢查是否有足夠的圖片
                    if (loadedCount === imageFiles.length) {
                        this.updateUploadStatus();
                    }
                };
                img.src = e.target.result;
            };
            
            reader.onerror = (error) => {
                console.error('讀取檔案錯誤:', error);
                alert(`無法讀取檔案: ${file.name}`);
            };
            
            reader.readAsDataURL(file);
        });
    }
    
    createImagePreview(src, name) {
        const previewItem = document.createElement('div');
        previewItem.className = 'preview-item';
        
        const img = document.createElement('img');
        img.src = src;
        img.alt = name;
        img.title = name;
        
        // 添加刪除按鈕
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'delete-btn';
        deleteBtn.innerHTML = '×';
        deleteBtn.onclick = () => this.removeImage(name);
        
        previewItem.appendChild(img);
        previewItem.appendChild(deleteBtn);
        
        this.elements.imagePreview.appendChild(previewItem);
    }
    
    removeImage(filename) {
        // 從狀態中移除圖片
        this.state.uploadedImages = this.state.uploadedImages.filter(img => img.name !== filename);
        
        // 更新預覽
        const previews = this.elements.imagePreview.querySelectorAll('.preview-item');
        previews.forEach(preview => {
            const img = preview.querySelector('img');
            if (img && img.alt === filename) {
                preview.remove();
            }
        });
        
        this.updateUploadStatus();
    }
    
    updateUploadStatus() {
        const uploadArea = this.elements.uploadArea;
        const nextButton = document.getElementById('nextStep1');
        
        if (this.state.uploadedImages.length >= 10) {
            // 顯示下一步按鈕
            if (nextButton) nextButton.style.display = 'inline-block';
            
            // 更新上傳區域文字
            const h3 = uploadArea.querySelector('h3');
            if (h3) h3.textContent = '已上傳足夠的圖片！';
        } else {
            // 隱藏下一步按鈕
            if (nextButton) nextButton.style.display = 'none';
            
            // 更新上傳區域文字
            const h3 = uploadArea.querySelector('h3');
            if (h3) h3.textContent = `已上傳 ${this.state.uploadedImages.length} 張，還需要 ${10 - this.state.uploadedImages.length} 張`;
        }
    }
    
    goToStep(step) {
        // 更新步驟狀態
        document.querySelectorAll('.step-content').forEach(el => el.style.display = 'none');
        document.querySelectorAll('.workflow-step').forEach(el => el.classList.remove('active'));
        
        const stepContent = document.getElementById(`step${step}`);
        const workflowStep = document.querySelector(`[data-step="${step}"]`);
        
        if (stepContent) stepContent.style.display = 'block';
        if (workflowStep) workflowStep.classList.add('active');
        
        this.state.currentStep = step;
        
        // 步驟特定初始化
        if (step === 2) {
            this.showImageForAnnotation(0);
        } else if (step === 3) {
            this.initializeVisualizer();
        }
    }
    
    showImageForAnnotation(index) {
        if (index < 0 || index >= this.state.uploadedImages.length) return;
        
        this.state.currentImageIndex = index;
        const canvas = this.elements.annotationCanvas;
        const ctx = this.contexts.annotation;
        
        if (!canvas || !ctx) return;
        
        const img = new Image();
        
        img.onload = () => {
            // 調整畫布大小以適應圖片，但不超過最大值
            const maxWidth = 800;
            const maxHeight = 600;
            
            let width = img.width;
            let height = img.height;
            
            if (width > maxWidth || height > maxHeight) {
                const ratio = Math.min(maxWidth / width, maxHeight / height);
                width *= ratio;
                height *= ratio;
            }
            
            canvas.width = width;
            canvas.height = height;
            canvas.style.maxWidth = '100%';
            canvas.style.height = 'auto';
            
            ctx.drawImage(img, 0, 0, width, height);
            this.redrawAnnotationCanvas();
        };
        
        img.src = this.state.uploadedImages[index].data;
        
        // 更新計數器
        const counter = document.getElementById('imageCounter');
        if (counter) {
            counter.textContent = `${index + 1}/${this.state.uploadedImages.length}`;
        }
    }
    
    redrawAnnotationCanvas() {
        const canvas = this.elements.annotationCanvas;
        const ctx = this.contexts.annotation;
        
        if (!canvas || !ctx) return;
        
        const img = new Image();
        
        img.onload = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            
            const imageKey = this.state.uploadedImages[this.state.currentImageIndex]?.name;
            if (!imageKey) return;
            
            const annotations = this.state.annotations[imageKey] || [];
            
            annotations.forEach(ann => {
                ctx.strokeStyle = 'green';
                ctx.lineWidth = 2;
                ctx.strokeRect(ann.x, ann.y, ann.width, ann.height);
                
                // 繪製標籤背景
                ctx.fillStyle = 'rgba(0, 255, 0, 0.8)';
                const textWidth = ctx.measureText(ann.label).width;
                ctx.fillRect(ann.x, ann.y - 20, textWidth + 10, 20);
                
                // 繪製標籤文字 - 確保繁體中文正確顯示
                ctx.fillStyle = 'white';
                ctx.font = '14px "Microsoft JhengHei", "微軟正黑體", sans-serif';
                ctx.fillText(ann.label, ann.x + 5, ann.y - 5);
            });
        };
        
        if (this.state.uploadedImages[this.state.currentImageIndex]) {
            img.src = this.state.uploadedImages[this.state.currentImageIndex].data;
        }
    }
    
    addAnnotation(startX, startY, endX, endY) {
        const imageKey = this.state.uploadedImages[this.state.currentImageIndex]?.name;
        if (!imageKey) return;
        
        // 確保框的尺寸不為零
        const width = Math.abs(endX - startX);
        const height = Math.abs(endY - startY);
        
        if (width < 10 || height < 10) {
            alert('請框選更大的區域');
            return;
        }
        
        if (!this.state.annotations[imageKey]) {
            this.state.annotations[imageKey] = [];
        }
        
        const objectName = document.getElementById('objectName');
        const label = objectName ? objectName.value : '物件';
        
        this.state.annotations[imageKey].push({
            x: Math.min(startX, endX),
            y: Math.min(startY, endY),
            width: width,
            height: height,
            label: label
        });
    }
    
    navigateImage(direction) {
        const newIndex = this.state.currentImageIndex + direction;
        if (newIndex >= 0 && newIndex < this.state.uploadedImages.length) {
            this.showImageForAnnotation(newIndex);
        }
    }
    
    saveAnnotations() {
        localStorage.setItem('easyYoloAnnotations', JSON.stringify(this.state.annotations));
        alert('標註已儲存！');
    }
    
    initializeVisualizer() {
        const ctx = this.contexts.visualizer;
        const canvas = this.elements.visualizerCanvas;
        
        if (!ctx || !canvas) return;
        
        // 清空畫布
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // 設定繁體中文字體
        ctx.font = '20px "Microsoft JhengHei", "微軟正黑體", sans-serif';
        ctx.fillStyle = '#333';
        ctx.textAlign = 'center';
        ctx.fillText('YOLO神經網路訓練視覺化', canvas.width / 2, 30);
        
        this.drawNeuralNetwork(ctx);
    }
    
    drawNeuralNetwork(ctx) {
        const layers = [3, 5, 7, 5, 3];
        const layerWidth = 150;
        const startX = 50;
        
        layers.forEach((nodeCount, layerIndex) => {
            const x = startX + layerIndex * layerWidth;
            const nodeSpacing = 50;
            const startY = 200 - (nodeCount * nodeSpacing) / 2;
            
            // 繪製節點和連接
            for (let i = 0; i < nodeCount; i++) {
                const y = startY + i * nodeSpacing;
                
                // 繪製節點
                ctx.beginPath();
                ctx.arc(x, y, 15, 0, 2 * Math.PI);
                ctx.fillStyle = '#667eea';
                ctx.fill();
                
                // 繪製連接線到下一層
                if (layerIndex < layers.length - 1) {
                    const nextNodeCount = layers[layerIndex + 1];
                    const nextX = x + layerWidth;
                    const nextStartY = 200 - (nextNodeCount * nodeSpacing) / 2;
                    
                    for (let j = 0; j < nextNodeCount; j++) {
                        const nextY = nextStartY + j * nodeSpacing;
                        ctx.beginPath();
                        ctx.moveTo(x + 15, y);
                        ctx.lineTo(nextX - 15, nextY);
                        ctx.strokeStyle = '#ddd';
                        ctx.lineWidth = 1;
                        ctx.stroke();
                    }
                }
            }
            
            // 層標籤 - 繁體中文
            ctx.fillStyle = '#333';
            ctx.font = '14px "Microsoft JhengHei", "微軟正黑體", sans-serif';
            const labels = ['輸入層', '隱藏層1', '隱藏層2', '隱藏層3', '輸出層'];
            ctx.fillText(labels[layerIndex], x - 30, 350);
        });
    }
    
    async startTraining() {
        if (this.state.isTraining) return;
        
        this.state.isTraining = true;
        const button = document.getElementById('startTraining');
        button.disabled = true;
        button.textContent = '訓練中...';
        
        const progressFill = document.getElementById('progressFill');
        const status = document.getElementById('trainingStatus');
        
        // 初始化視覺化器
        if (!this.visualizer && typeof YOLOVisualizer !== 'undefined') {
            this.visualizer = new YOLOVisualizer({
                canvasId: 'visualizerCanvas',
                chartCanvasId: 'chartCanvas'
            });
        }
        
        // 開始視覺化動畫
        if (this.visualizer) {
            this.visualizer.animateTraining(10000);
        }
        
        // 模擬訓練過程（非阻塞）
        const trainStep = async (epoch) => {
            if (epoch > 100) {
                // 訓練完成
                status.textContent = '訓練完成！';
                button.textContent = '重新訓練';
                button.disabled = false;
                document.getElementById('nextStep3').style.display = 'inline-block';
                
                // 載入預訓練模型
                await this.loadPretrainedModel();
                
                this.state.isTraining = false;
                return;
            }
            
            // 更新進度
            progressFill.style.width = `${epoch}%`;
            status.textContent = `訓練進度：${epoch}% - Epoch ${Math.floor(epoch / 5)}/20`;
            
            // 使用 requestAnimationFrame 確保流暢
            requestAnimationFrame(() => {
                setTimeout(() => trainStep(epoch + 5), 100);
            });
        };
        
        // 開始訓練
        trainStep(0);
        
        // 監聽訓練完成事件
        window.addEventListener('trainingComplete', (event) => {
            console.log('訓練完成事件:', event.detail);
        }, { once: true });
    }
    
    async loadPretrainedModel() {
        try {
            console.log('載入預訓練模型...');
            
            // 模擬模型載入
            this.state.model = {
                predict: (input) => {
                    // 模擬預測結果
                    const randomX = Math.random() * 400 + 50;
                    const randomY = Math.random() * 200 + 50;
                    return {
                        boxes: [[randomX, randomY, 100, 100]],
                        scores: [0.75 + Math.random() * 0.20],
                        classes: [0]
                    };
                }
            };
        } catch (error) {
            console.error('模型載入失敗:', error);
        }
    }
    
    async startWebcam() {
        const video = this.elements.webcam;
        const canvas = this.elements.detectionCanvas;
        
        if (!video || !canvas) return;
        
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ 
                video: { width: 640, height: 480 } 
            });
            video.srcObject = stream;
            this.state.webcamStream = stream;
            
            const startButton = document.getElementById('startWebcam');
            const stopButton = document.getElementById('stopWebcam');
            
            if (startButton) startButton.style.display = 'none';
            if (stopButton) stopButton.style.display = 'inline-block';
            
            video.addEventListener('loadedmetadata', () => {
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;
                canvas.style.width = video.offsetWidth + 'px';
                canvas.style.height = video.offsetHeight + 'px';
            });
            
            this.detectObjects();
        } catch (error) {
            alert('無法存取攝影機：' + error.message);
        }
    }
    
    stopWebcam() {
        const video = this.elements.webcam;
        
        if (this.state.webcamStream) {
            this.state.webcamStream.getTracks().forEach(track => track.stop());
            video.srcObject = null;
            this.state.webcamStream = null;
        }
        
        const startButton = document.getElementById('startWebcam');
        const stopButton = document.getElementById('stopWebcam');
        
        if (startButton) startButton.style.display = 'inline-block';
        if (stopButton) stopButton.style.display = 'none';
        
        const ctx = this.contexts.detection;
        if (ctx && this.elements.detectionCanvas) {
            ctx.clearRect(0, 0, this.elements.detectionCanvas.width, 
                          this.elements.detectionCanvas.height);
        }
    }
    
    async detectObjects() {
        const video = this.elements.webcam;
        const canvas = this.elements.detectionCanvas;
        const ctx = this.contexts.detection;
        const resultsDiv = document.getElementById('detectionResults');
        
        if (!video || !canvas || !ctx) return;
        
        const detect = async () => {
            if (!video.srcObject) return;
            
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            if (this.state.model) {
                const predictions = this.state.model.predict(video);
                
                predictions.boxes.forEach((box, i) => {
                    const [x, y, width, height] = box;
                    const score = predictions.scores[i];
                    const objectName = document.getElementById('objectName');
                    const className = objectName ? objectName.value : '物件';
                    
                    // 繪製偵測框
                    ctx.strokeStyle = '#00ff00';
                    ctx.lineWidth = 3;
                    ctx.strokeRect(x, y, width, height);
                    
                    // 繪製標籤背景
                    const text = `${className} (${(score * 100).toFixed(1)}%)`;
                    ctx.font = '16px "Microsoft JhengHei", "微軟正黑體", sans-serif';
                    const textWidth = ctx.measureText(text).width;
                    
                    ctx.fillStyle = '#00ff00';
                    ctx.fillRect(x, y - 25, textWidth + 10, 25);
                    
                    // 繪製標籤文字
                    ctx.fillStyle = '#000';
                    ctx.fillText(text, x + 5, y - 7);
                });
                
                // 更新偵測結果
                if (resultsDiv) {
                    resultsDiv.innerHTML = `
                        <p>偵測到 ${predictions.boxes.length} 個物件</p>
                        <p>信心度：${(predictions.scores[0] * 100).toFixed(1)}%</p>
                        <p>類別：${document.getElementById('objectName')?.value || '物件'}</p>
                    `;
                }
            }
            
            requestAnimationFrame(detect);
        };
        
        detect();
    }
    
    exportModel() {
        const config = {
            modelInfo: {
                name: 'EasyYOLO 自訂模型',
                version: '1.0',
                trainDate: new Date().toISOString(),
                classes: [document.getElementById('objectName')?.value || '物件']
            },
            annotations: this.state.annotations,
            trainingParams: {
                epochs: 20,
                batchSize: 8,
                learningRate: 0.001
            }
        };
        
        // 下載 JSON 設定檔
        const dataStr = JSON.stringify(config, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = 'easyyolo_model_config.json';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        alert('模型設定已匯出！');
    }
}

// 初始化應用程式
document.addEventListener('DOMContentLoaded', () => {
    window.easyYOLO = new EasyYOLO();
    console.log('EasyYOLO 應用程式已啟動');
});

// 工具函數
const utils = {
    // 防抖函數
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },
    
    // 節流函數
    throttle(func, limit) {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }
};

// 匯出給其他模組使用
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { EasyYOLO, utils };
} else {
    // 確保類在全域範圍內可用
    window.EasyYOLO = EasyYOLO;
    window.utils = utils;
}