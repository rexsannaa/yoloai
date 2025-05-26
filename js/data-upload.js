// js/data-upload.js - 資料管理頁面功能

/**
 * 資料管理頁面功能處理
 */

// 全域變數
let selectedFiles = [];
let currentTab = 'dataset';
let uploadType = null;

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
  initElements();
  setupEventListeners();
});

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
    // 檢查檔案類型
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'text/csv', 'application/json'];
    if (!allowedTypes.includes(file.type)) {
      showNotification('檔案格式錯誤', `不支援的檔案格式: ${file.name}`, 'error');
      return;
    }
    
    // 檢查檔案大小 (100MB)
    if (file.size > 100 * 1024 * 1024) {
      showNotification('檔案過大', `檔案 ${file.name} 超過 100MB 限制`, 'error');
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
 * 更新檔案列表
 */
function updateFileList() {
  if (!elements.fileList || !elements.fileItems) return;
  
  if (selectedFiles.length === 0) {
    elements.fileList.style.display = 'none';
    return;
  }
  
  elements.fileList.style.display = 'block';
  elements.fileItems.innerHTML = '';
  
  selectedFiles.forEach((file, index) => {
    const fileItem = document.createElement('div');
    fileItem.className = 'file-item';
    
    const isImage = file.type.startsWith('image/');
    const iconClass = isImage ? 'image' : 'data';
    const iconName = isImage ? 'fa-image' : getFileIconName(file.type);
    
    fileItem.innerHTML = `
      <div class="file-icon ${iconClass}">
        <i class="fas ${iconName}"></i>
      </div>
      <div class="file-info">
        <div class="file-name" title="${file.name}">${file.name}</div>
        <div class="file-size">${formatFileSize(file.size)}</div>
      </div>
      <button class="file-remove" onclick="removeFile(${index})" title="移除檔案">
        <i class="fas fa-times"></i>
      </button>
    `;
    
    elements.fileItems.appendChild(fileItem);
  });
}

/**
 * 移除檔案
 */
function removeFile(index) {
  if (index >= 0 && index < selectedFiles.length) {
    const fileName = selectedFiles[index].name;
    selectedFiles.splice(index, 1);
    showNotification('檔案已移除', `已移除檔案: ${fileName}`, 'info');
    updateFileList();
    updateConfirmButton();
  }
}

/**
 * 更新確認按鈕
 */
function updateConfirmButton() {
  if (elements.confirmBtn) {
    elements.confirmBtn.disabled = selectedFiles.length === 0;
  }
}

/**
 * 確認上傳
 */
function confirmUpload() {
  if (selectedFiles.length === 0) return;
  
  showNotification('開始上傳', `正在上傳 ${selectedFiles.length} 個檔案...`, 'info');
  
  // 模擬上傳過程
  setTimeout(() => {
    showNotification('上傳成功', '所有檔案已成功上傳並加入資料集', 'success');
    closeAddDataModal();
    selectedFiles = [];
  }, 2000);
}

/**
 * 獲取檔案圖示名稱
 */
function getFileIconName(fileType) {
  if (fileType.includes('csv')) return 'fa-file-csv';
  if (fileType.includes('json')) return 'fa-file-code';
  return 'fa-file';
}

/**
 * 格式化檔案大小
 */
function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * 返回主頁面
 */
function goToMain() {
  window.location.href = 'index.html';
}

/**
 * 顯示即將推出訊息
 */
function showComingSoon() {
  showNotification('功能開發中', '此功能正在開發中，敬請期待！', 'info');
}

/**
 * 顯示通知
 */
function showNotification(title, message, type = 'info') {
  // 移除現有通知
  const existingNotification = document.querySelector('.notification');
  if (existingNotification) {
    existingNotification.remove();
  }
  
  // 創建通知元素
  const notification = document.createElement('div');
  notification.className = `notification notification-${type}`;
  notification.innerHTML = `
    <div class="notification-content">
      <div class="notification-header">
        <strong>${title}</strong>
        <button class="notification-close" onclick="closeNotification()">&times;</button>
      </div>
      <div class="notification-message">${message}</div>
    </div>
  `;
  
  // 添加樣式
  addNotificationStyles();
  
  // 添加到頁面
  document.body.appendChild(notification);
  
  // 動畫顯示
  setTimeout(() => {
    notification.classList.add('show');
  }, 10);
  
  // 自動關閉
  setTimeout(() => {
    closeNotification();
  }, 4000);
}

/**
 * 關閉通知
 */
function closeNotification() {
  const notification = document.querySelector('.notification');
  if (notification) {
    notification.classList.add('hide');
    setTimeout(() => {
      notification.remove();
    }, 300);
  }
}

/**
 * 添加通知樣式
 */
function addNotificationStyles() {
  if (document.querySelector('#notification-styles')) return;
  
  const style = document.createElement('style');
  style.id = 'notification-styles';
  style.textContent = `
    .notification {
      position: fixed;
      top: 20px;
      right: 20px;
      min-width: 320px;
      max-width: 400px;
      background: white;
      border-radius: 6px;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
      z-index: 1001;
      opacity: 0;
      transform: translateX(100%);
      transition: all 0.3s ease;
    }
    
    .notification.show {
      opacity: 1;
      transform: translateX(0);
    }
    
    .notification.hide {
      opacity: 0;
      transform: translateX(100%);
    }
    
    .notification-info {
      border-left: 4px solid #06b6d4;
    }
    
    .notification-success {
      border-left: 4px solid #10b981;
    }
    
    .notification-warning {
      border-left: 4px solid #f59e0b;
    }
    
    .notification-error {
      border-left: 4px solid #ef4444;
    }
    
    .notification-content {
      padding: 16px;
    }
    
    .notification-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
    }
    
    .notification-header strong {
      font-size: 0.9rem;
      color: #1e293b;
    }
    
    .notification-close {
      background: none;
      border: none;
      font-size: 16px;
      color: #94a3b8;
      cursor: pointer;
      padding: 0;
      width: 18px;
      height: 18px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 2px;
    }
    
    .notification-close:hover {
      color: #64748b;
      background: #f1f5f9;
    }
    
    .notification-message {
      font-size: 0.85rem;
      color: #64748b;
      line-height: 1.4;
    }
    
    @media (max-width: 768px) {
      .notification {
        top: 10px;
        right: 10px;
        left: 10px;
        min-width: auto;
        max-width: none;
      }
    }
  `;
  document.head.appendChild(style);
}

// 暴露全域函數
window.switchMainTab = switchMainTab;
window.showAddDataModal = showAddDataModal;
window.closeAddDataModal = closeAddDataModal;
window.selectUploadType = selectUploadType;
window.removeFile = removeFile;
window.confirmUpload = confirmUpload;
window.goToMain = goToMain;
window.showComingSoon = showComingSoon;
window.closeNotification = closeNotification;