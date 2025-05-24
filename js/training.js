// js/training.js - 訓練頁面功能模組

/**
 * 物件偵測訓練頁面功能處理
 */

// 全域變數
let uploadedImages = [];
let annotationData = [];
let currentImageIndex = -1;
let currentStep = 1;
let annotationCanvas = null;
let annotationCtx = null;
let isDrawing = false;
let startX, startY, endX, endY;
let currentClass = '';
let availableClasses = [];
let trainingInProgress = false;
let trainingStartTime = null;

// 訓練配置
const trainingConfig = {
  modelSize: 'small',
  epochs: 100,
  batchSize: 16,
  learningRate: 0.01
};

// 模擬的訓練數據
let trainingData = {
  currentEpoch: 0,
  totalEpochs: 100,
  currentLoss: 0,
  currentAccuracy: 0,
  lossHistory: [],
  accuracyHistory: []
};

// 初始化
document.addEventListener('DOMContentLoaded', function() {
  initTrainingPage();
  setupFileUpload();
  setupAnnotationCanvas();
  setupTrainingConfig();
});

/**
 * 初始化訓練頁面
 */
function initTrainingPage() {
  console.log('訓練頁面已載入');
  
  // 檢查是否有來自工作流的配置
  const savedTrainingType = localStorage.getItem('selectedTrainingType');
  const savedConfig = localStorage.getItem('trainingConfig');
  
  if (savedTrainingType && savedConfig) {
    try {
      const config = JSON.parse(savedConfig);
      console.log('載入訓練配置:', config);
    } catch (e) {
      console.warn('無法解析訓練配置');
    }
  }
  
  // 設置當前步驟
  updateStepProgress(1);
  
  // 設置事件監聽器
  setupEventListeners();
}

/**
 * 設置事件監聽器
 */
function setupEventListeners() {
  // 檔案輸入變化
  const fileInput = document.getElementById('file-input');
  if (fileInput) {
    fileInput.addEventListener('change', handleFileSelect);
  }
  
  // 拖拽上傳
  const uploadArea = document.getElementById('upload-area');
  if (uploadArea) {
    uploadArea.addEventListener('dragover', handleDragOver);
    uploadArea.addEventListener('dragleave', handleDragLeave);
    uploadArea.addEventListener('drop', handleDrop);
  }
  
  // 類別輸入
  const classInput = document.getElementById('class-input');
  if (classInput) {
    classInput.addEventListener('keypress', handleClassInput);
  }
}

/**
 * 設置檔案上傳
 */
function setupFileUpload() {
  console.log('檔案上傳功能已設置');
}

/**
 * 處理檔案選擇
 */
function handleFileSelect(event) {
  const files = Array.from(event.target.files);
  processFiles(files);
}

/**
 * 處理拖拽懸停
 */
function handleDragOver(event) {
  event.preventDefault();
  event.currentTarget.classList.add('dragover');
}

/**
 * 處理拖拽離開
 */
function handleDragLeave(event) {
  event.currentTarget.classList.remove('dragover');
}

/**
 * 處理拖拽放下
 */
function handleDrop(event) {
  event.preventDefault();
  event.currentTarget.classList.remove('dragover');
  
  const files = Array.from(event.dataTransfer.files);
  const imageFiles = files.filter(file => file.type.startsWith('image/'));
  
  if (imageFiles.length > 0) {
    processFiles(imageFiles);
  } else {
    alert('請選擇圖片檔案 (JPG, PNG, WEBP)');
  }
}

/**
 * 處理檔案
 */
function processFiles(files) {
  const maxSize = 10 * 1024 * 1024; // 10MB
  const validFiles = [];
  
  files.forEach(file => {
    if (file.size > maxSize) {
      alert(`檔案 ${file.name} 太大，請選擇小於 10MB 的圖片`);
      return;
    }
    
    if (!file.type.startsWith('image/')) {
      alert(`檔案 ${file.name} 不是有效的圖片格式`);
      return;
    }
    
    validFiles.push(file);
  });
  
  if (validFiles.length === 0) return;
  
  // 顯示載入狀態
  showUploadProgress();
  
  // 處理每個檔案
  validFiles.forEach((file, index) => {
    const reader = new FileReader();
    reader.onload = function(e) {
      const img = new Image();
      img.onload = function() {
        const imageData = {
          id: Date.now() + index,
          name: file.name,
          src: e.target.result,
          width: img.width,
          height: img.height,
          size: file.size,
          annotations: []
        };
        
        uploadedImages.push(imageData);
        
        // 如果是最後一個檔案，更新UI
        if (uploadedImages.length === validFiles.length + (uploadedImages.length - validFiles.length)) {
          updateImageGrid();
          updateDatasetStats();
          hideUploadProgress();
        }
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
}

/**
 * 顯示上傳進度
 */
function showUploadProgress() {
  const uploadArea = document.getElementById('upload-area');
  if (uploadArea) {
    uploadArea.innerHTML = `
      <div class="upload-progress">
        <i class="fas fa-spinner fa-spin" style="font-size: 2em; color: var(--primary); margin-bottom: 16px;"></i>
        <h3>正在處理圖片...</h3>
        <p>請稍候</p>
      </div>
    `;
  }
}

/**
 * 隱藏上傳進度
 */
function hideUploadProgress() {
  const uploadArea = document.getElementById('upload-area');
  if (uploadArea) {
    uploadArea.innerHTML = `
      <div class="upload-placeholder">
        <i class="fas fa-cloud-upload-alt"></i>
        <h3>拖拽圖片到此處或點擊上傳</h3>
        <p>支援 JPG, PNG, WEBP 格式，建議至少 20 張圖片</p>
        <p>單張圖片大小不超過 10MB</p>
        <input type="file" id="file-input" multiple accept="image/*" style="display: none;">
        <button class="btn btn-primary" onclick="document.getElementById('file-input').click()">
          <i class="fas fa-folder-open"></i> 選擇圖片
        </button>
      </div>
    `;
    
    // 重新設置事件監聽器
    const fileInput = document.getElementById('file-input');
    if (fileInput) {
      fileInput.addEventListener('change', handleFileSelect);
    }
  }
}

/**
 * 更新圖片網格
 */
function updateImageGrid() {
  const imageGrid = document.getElementById('image-grid');
  const imagesContainer = document.getElementById('images-container');
  const imageCount = document.getElementById('image-count');
  
  if (!imageGrid || !imagesContainer || !imageCount) return;
  
  if (uploadedImages.length === 0) {
    imageGrid.style.display = 'none';
    return;
  }
  
  imageGrid.style.display = 'block';
  imageCount.textContent = uploadedImages.length;
  
  imagesContainer.innerHTML = uploadedImages.map((image, index) => `
    <div class="image-item" data-index="${index}" onclick="selectImage(${index})">
      <img src="${image.src}" alt="${image.name}" loading="lazy">
      <div class="image-overlay">
        <div class="image-actions">
          <button class="image-action image-view" onclick="event.stopPropagation(); viewImage(${index})" title="查看">
            <i class="fas fa-eye"></i>
          </button>
          <button class="image-action image-delete" onclick="event.stopPropagation(); deleteImage(${index})" title="刪除">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      </div>
    </div>
  `).join('');
}

/**
 * 更新資料集統計
 */
function updateDatasetStats() {
  const totalImages = document.getElementById('total-images');
  const totalSize = document.getElementById('total-size');
  const avgResolution = document.getElementById('avg-resolution');
  const readyStatus = document.getElementById('ready-status');
  const nextButton = document.getElementById('next-to-annotation');
  
  if (!totalImages || !totalSize || !avgResolution || !readyStatus) return;
  
  const imageCount = uploadedImages.length;
  const totalSizeBytes = uploadedImages.reduce((sum, img) => sum + img.size, 0);
  const totalSizeMB = (totalSizeBytes / (1024 * 1024)).toFixed(1);
  
  let avgWidth = 0, avgHeight = 0;
  if (imageCount > 0) {
    avgWidth = Math.round(uploadedImages.reduce((sum, img) => sum + img.width, 0) / imageCount);
    avgHeight = Math.round(uploadedImages.reduce((sum, img) => sum + img.height, 0) / imageCount);
  }
  
  totalImages.textContent = imageCount;
  totalSize.textContent = `${totalSizeMB} MB`;
  avgResolution.textContent = imageCount > 0 ? `${avgWidth}x${avgHeight}` : '-';
  
  const isReady = imageCount >= 10; // 至少需要10張圖片
  readyStatus.textContent = isReady ? '已就緒' : `需要至少 10 張圖片 (目前 ${imageCount})`;
  readyStatus.style.color = isReady ? 'var(--success)' : 'var(--warning)';
  
  if (nextButton) {
    nextButton.disabled = !isReady;
  }
}

/**
 * 選擇圖片
 */
function selectImage(index) {
  document.querySelectorAll('.image-item').forEach(item => {
    item.classList.remove('selected');
  });
  
  document.querySelector(`[data-index="${index}"]`)?.classList.add('selected');
}

/**
 * 查看圖片
 */
function viewImage(index) {
  if (index < 0 || index >= uploadedImages.length) return;
  
  const image = uploadedImages[index];
  const viewer = document.createElement('div');
  viewer.className = 'image-viewer';
  viewer.innerHTML = `
    <div class="viewer-overlay" onclick="closeImageViewer()"></div>
    <div class="viewer-content">
      <div class="viewer-header">
        <h3>${image.name}</h3>
        <button class="viewer-close" onclick="closeImageViewer()">&times;</button>
      </div>
      <div class="viewer-body">
        <img src="${image.src}" alt="${image.name}">
      </div>
      <div class="viewer-info">
        <span>尺寸: ${image.width}x