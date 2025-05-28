// js/data-upload.js - 資料管理頁面功能

/**
 * 資料管理頁面功能處理
 */

// 全域變數
let selectedFiles = [];
let currentTab = 'dataset';
let uploadType = null;
let currentTrainingType = null; // 從主頁面傳來的訓練類型

// DOM 元素
const elements = {
  fileInput: null,
  uploadArea: null,
  fileList: null,
  fileItems: null,
  confirmBtn: null,
  addDataModal: null
};

// 初始化
document.addEventListener('DOMContentLoaded', function() {
  loadTrainingType(); // 載入訓練類型
  initElements();
  setupEventListeners();
  updatePageForTrainingType(); // 根據訓練類型更新頁面
});

/**
 * 載入訓練類型
 */
function loadTrainingType() {
  currentTrainingType = localStorage.getItem('trainingType');
  
  if (currentTrainingType) {
    // 顯示歡迎訊息
    const typeNames = {
      motion: 'Motion: 手勢識別',
      images: 'Images: 物件偵測',
      audio: 'Audio: 音頻分類'
    };
    
    showNotification(
      '歡迎來到訓練頁面', 
      `您選擇了 ${typeNames[currentTrainingType]} 訓練類型`, 
      'success'
    );
  }
}

/**
 * 根據訓練類型更新頁面
 */
function updatePageForTrainingType() {
  if (!currentTrainingType) return;
  
  // 更新頁面標題
  const typeNames = {
    motion: 'Motion: 手勢識別',
    images: 'Images: 物件偵測',
    audio: 'Audio: 音頻分類'
  };
  
  const pageTitle = document.title;
  document.title = `${typeNames[currentTrainingType]} - ${pageTitle}`;
  
  // 在資料集面板添加訓練類型提示
  const datasetHeader = document.querySelector('.dataset-panel .panel-header h3');
  if (datasetHeader) {
    datasetHeader.innerHTML = `資料集 <small style="color: #6366f1; font-weight: 500;">(${typeNames[currentTrainingType]})</small>`;
  }
  
  // 更新空狀態描述
  const addDataSection = document.querySelector('.add-data-section p');
  if (addDataSection) {
    const descriptions = {
      motion: '上傳手勢和動作相關的感測器資料或影片檔案。',
      images: '上傳圖片檔案進行物件偵測和分類訓練。',
      audio: '上傳音頻檔案進行聲音識別和分類訓練。'
    };
    addDataSection.textContent = `開始建立您的 ${typeNames[currentTrainingType]} 資料集。${descriptions[currentTrainingType]}`;
  }
}

/**
 * 初始化 DOM 元素
 */
function initElements() {
  elements.fileInput = document.getElementById('file-input');
  elements.uploadArea = document.getElementById('upload-area');
  elements.fileList = document.getElementById('file-list');
  elements.fileItems = document.getElementById('file-items');
  elements.confirmBtn = document.getElementById('confirm-btn');
  elements.addDataModal = document.getElementById('add-data-modal');
}

/**
 * 設置事件監聽器
 */
function setupEventListeners() {
  // 檔案選擇事件
  if (elements.fileInput) {
    elements.fileInput.addEventListener('change', handleFileSelect);
  }
  
  // 拖拽上傳事件
  if (elements.uploadArea) {
    elements.uploadArea.addEventListener('dragover', (e) => {
      e.preventDefault();
      elements.uploadArea.classList.add('dragover');
    });
    
    elements.uploadArea.addEventListener('dragleave', (e) => {
      e.preventDefault();
      elements.uploadArea.classList.remove('dragover');
    });
    
    elements.uploadArea.addEventListener('drop', (e) => {
      e.preventDefault();
      elements.uploadArea.classList.remove('dragover');
      const files = Array.from(e.dataTransfer.files);
      addFilesToList(files);
    });
  }
  
  // 彈窗點擊外部關閉
  if (elements.addDataModal) {
    elements.addDataModal.addEventListener('click', (e) => {
      if (e.target === elements.addDataModal) {
        closeAddDataModal();
      }
    });
  }
}

/**
 * 切換主要標籤頁
 */
function switchMainTab(tabName) {
  currentTab = tabName;
  
  // 更新標籤按鈕狀態
  document.querySelectorAll('.tab-button').forEach(btn => {
    btn.classList.remove('active');
  });
  
  // 找到對應按鈕並設為活躍
  const activeBtn = Array.from(document.querySelectorAll('.tab-button')).find(btn => 
    btn.textContent.trim().toLowerCase().includes(getTabDisplayName(tabName).toLowerCase())
  );
  if (activeBtn) {
    activeBtn.classList.add('active');
  }
  
  // 更新標籤內容
  document.querySelectorAll('.tab-content').forEach(content => {
    content.classList.remove('active');
    if (content.id === `${tabName}-tab`) {
      content.classList.add('active');
    }
  });
}

/**
 * 獲取標籤顯示名稱
 */
function getTabDisplayName(tabName) {
  const names = {
    dataset: '資料集',
    explorer: '資料瀏覽器',
    sources: '資料來源',
    synthetic: '合成資料',
    labeling: 'AI標註',
    wizard: 'CSV精靈'
  };
  return names[tabName] || tabName;
}

/**
 * 顯示添加資料彈窗
 */
function showAddDataModal() {
  if (elements.addDataModal) {
    elements.addDataModal.classList.add('show');
  }
  // 重置狀態
  selectedFiles = [];
  uploadType = null;
  hideUploadArea();
  updateConfirmButton();
  
  // 根據訓練類型更新彈窗內容
  updateModalForTrainingType();
}

/**
 * 根據訓練類型更新彈窗內容
 */
function updateModalForTrainingType() {
  if (!currentTrainingType) return;
  
  const modalTitle = document.querySelector('#add-data-modal .modal-header h3');
  const fileInput = document.getElementById('file-input');
  const uploadInfo = document.querySelector('.upload-info small');
  
  if (modalTitle) {
    const typeNames = {
      motion: 'Motion 手勢識別',
      images: 'Images 物件偵測',
      audio: 'Audio 音頻分類'
    };
    modalTitle.textContent = `添加 ${typeNames[currentTrainingType]} 資料`;
  }
  
  // 根據訓練類型設置接受的檔案格式
  const acceptFormats = {
    motion: '.mp4,.avi,.mov,.csv,.json',
    images: '.jpg,.jpeg,.png,.bmp,.gif',
    audio: '.wav,.mp3,.m4a,.aac,.flac'
  };
  
  const formatDescriptions = {
    motion: '支援格式：MP4, AVI, MOV, CSV, JSON | 最大：100MB',
    images: '支援格式：JPG, PNG, BMP, GIF | 最大：50MB',
    audio: '支援格式：WAV, MP3, M4A, AAC, FLAC | 最大：100MB'
  };
  
  if (fileInput && acceptFormats[currentTrainingType]) {
    fileInput.accept = acceptFormats[currentTrainingType];
  }
  
  if (uploadInfo && formatDescriptions[currentTrainingType]) {
    uploadInfo.textContent = formatDescriptions[currentTrainingType];
  }
}

/**
 * 關閉添加資料彈窗
 */
function closeAddDataModal() {
  if (elements.addDataModal) {
    elements.addDataModal.classList.remove('show');
  }
}

/**
 * 選擇上傳類型
 */
function selectUploadType(type) {
  uploadType = type;
  
  if (type === 'local') {
    showUploadArea();
  } else if (type === 'cloud') {
    showNotification('雲端儲存', '雲端儲存功能開發中', 'info');
  }
}

/**
 * 顯示上傳區域
 */
function showUploadArea() {
  if (elements.uploadArea) {
    elements.uploadArea.style.display = 'block';
  }
}

/**
 * 隱藏上傳區域
 */
function hideUploadArea() {
  if (elements.uploadArea) {
    elements.uploadArea.style.display = 'none';
  }
  if (elements.fileList) {
    elements.fileList.style.display = 'none';
  }
}

/**
 * 處理檔案選擇
 */
function handleFileSelect(e) {
  const files = Array.from(e.target.files);
  addFilesToList(files);
}

/**
 * 添加檔案到列表
 */
function addFilesToList(files) {
  let addedCount = 0;
  
  files.forEach(file => {
    // 根據訓練類型檢查檔案類型
    if (!isValidFileType(file)) {
      showNotification('檔案格式錯誤', `不支援的檔案格式: ${file.name}`, 'error');
      return;
    }
    
    // 檢查檔案大小
    const maxSize = getMaxFileSize();
    if (file.size > maxSize) {
      const maxSizeMB = Math.round(maxSize / (1024 * 1024));
      showNotification('檔案過大', `檔案 ${file.name} 超過 ${maxSizeMB}MB 限制`, 'error');
      return;
    }
    
    // 檢查是否已存在
    if (selectedFiles.find(f => f.name === file.name && f.size === file.size)) {
      showNotification('重複檔案', `檔案 ${file.name} 已經選擇`, 'warning');
      return;
    }
    
    selectedFiles.push(file);
    addedCount++;
  });
  
  if (addedCount > 0) {
    showNotification('檔案已添加', `成功添加 ${addedCount} 個檔案`, 'success');
    updateFileList();
    updateConfirmButton();
  }
}

/**
 * 檢查檔案類型是否有效
 */
function isValidFileType(file) {
  const allowedTypes = {
    motion: ['video/mp4', 'video/avi', 'video/quicktime', 'text/csv', 'application/json'],
    images: ['image/jpeg', 'image/jpg', 'image/png', 'image/bmp', 'image/gif'],
    audio: ['audio/wav', 'audio/mp3', 'audio/mpeg', 'audio/mp4', 'audio/aac', 'audio/flac']
  };
  
  if (!currentTrainingType) {
    // 如果沒有訓練類型，使用預設的允許類型
    const defaultTypes = ['image/jpeg', 'image/jpg', 'image/png', 'text/csv', 'application/json'];
    return defaultTypes.includes(file.type);
  }
  
  return allowedTypes[currentTrainingType]?.includes(file.type) || false;
}

/**
 * 獲取最大檔案大小
 */
function getMaxFileSize() {
  const maxSizes = {
    motion: 100 * 1024 * 1024, // 100MB
    images: 50 * 1024 * 1024,  // 50MB
    audio: 100 * 1024 * 1024   // 100MB
  };
  
  return maxSizes[currentTrainingType] || 100 * 1024 * 1024; // 預設 100MB
}