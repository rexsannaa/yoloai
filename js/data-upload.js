// js/data-upload.js - 資料管理頁面功能

/**
 * 資料管理頁面功能處理
 */

// 全域變數
let selectedFiles = [];
let currentTab = 'dataset';
let uploadMode = 'individual';
let uploadCategory = 'auto-split';
let labelMode = 'from-filename';
let customLabel = '';

// DOM 元素
const elements = {
  fileInput: null,
  uploadDataModal: null,
  addDataModal: null,
  selectedFileList: null,
  selectedFilesSection: null,
  uploadDataBtn: null,
  uploadStatus: null,
  labelInputSection: null,
  customLabelInput: null
};

// 初始化
document.addEventListener('DOMContentLoaded', function() {
  console.log('DOM loaded, initializing...');
  initElements();
  setupEventListeners();
  
  // 檢查關鍵元素是否存在
  console.log('Add data modal:', elements.addDataModal ? 'Found' : 'Not found');
  console.log('Upload data modal:', elements.uploadDataModal ? 'Found' : 'Not found');
});

/**
 * 初始化 DOM 元素
 */
function initElements() {
  elements.fileInput = document.getElementById('file-input');
  elements.uploadDataModal = document.getElementById('upload-data-modal');
  elements.addDataModal = document.getElementById('add-data-modal');
  elements.selectedFileList = document.getElementById('selected-file-list');
  elements.selectedFilesSection = document.getElementById('selected-files-section');
  elements.uploadDataBtn = document.getElementById('upload-data-btn');
  elements.uploadStatus = document.getElementById('upload-status');
  elements.labelInputSection = document.getElementById('label-input-section');
  elements.customLabelInput = document.getElementById('custom-label');
  
  // 調試信息
  console.log('Elements initialized:', {
    fileInput: !!elements.fileInput,
    uploadDataModal: !!elements.uploadDataModal,
    addDataModal: !!elements.addDataModal,
    selectedFileList: !!elements.selectedFileList,
    selectedFilesSection: !!elements.selectedFilesSection,
    uploadDataBtn: !!elements.uploadDataBtn,
    uploadStatus: !!elements.uploadStatus,
    labelInputSection: !!elements.labelInputSection,
    customLabelInput: !!elements.customLabelInput
  });
}

/**
 * 設置事件監聽器
 */
function setupEventListeners() {
  // 彈窗點擊外部關閉
  if (elements.addDataModal) {
    elements.addDataModal.addEventListener('click', (e) => {
      if (e.target === elements.addDataModal) {
        closeAddDataModal();
      }
    });
  }
  
  if (elements.uploadDataModal) {
    elements.uploadDataModal.addEventListener('click', (e) => {
      if (e.target === elements.uploadDataModal) {
        closeUploadDataModal();
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
 * 顯示添加資料選擇彈窗
 */
function showAddDataModal() {
  console.log('showAddDataModal called');
  if (elements.addDataModal) {
    console.log('Adding show class to modal');
    elements.addDataModal.classList.add('show');
  } else {
    console.error('Add data modal element not found');
  }
}

/**
 * 關閉添加資料選擇彈窗
 */
function closeAddDataModal() {
  if (elements.addDataModal) {
    elements.addDataModal.classList.remove('show');
  }
}

/**
 * 顯示上傳資料詳細表單彈窗
 */
function showUploadDataModal() {
  // 直接顯示詳細表單彈窗
  if (elements.uploadDataModal) {
    elements.uploadDataModal.classList.add('show');
  }
  
  // 重置狀態
  resetUploadForm();
}

/**
 * 關閉上傳資料詳細表單彈窗
 */
function closeUploadDataModal() {
  if (elements.uploadDataModal) {
    elements.uploadDataModal.classList.remove('show');
  }
  
  // 重置狀態
  resetUploadForm();
}

/**
 * 重置上傳表單
 */
function resetUploadForm() {
  selectedFiles = [];
  updateFileDisplay();
  updateUploadButton();
  
  // 重置表單選項
  const individualRadio = document.querySelector('input[name="upload-mode"][value="individual"]');
  if (individualRadio) individualRadio.checked = true;
  
  const autoSplitRadio = document.querySelector('input[name="upload-category"][value="auto-split"]');
  if (autoSplitRadio) autoSplitRadio.checked = true;
  
  const fromFilenameRadio = document.querySelector('input[name="label-mode"][value="from-filename"]');
  if (fromFilenameRadio) fromFilenameRadio.checked = true;
  
  // 隱藏標籤輸入區域
  if (elements.labelInputSection) {
    elements.labelInputSection.style.display = 'none';
  }
  
  uploadMode = 'individual';
  uploadCategory = 'auto-split';
  labelMode = 'from-filename';
  customLabel = '';
}

/**
 * 選擇上傳類型（從添加資料彈窗）
 */
function selectUploadType(type) {
  if (type === 'local') {
    closeAddDataModal();
    showUploadDataModal();
  } else if (type === 'cloud') {
    showNotification('雲端儲存', '雲端儲存功能開發中', 'info');
    closeAddDataModal();
  }
}

/**
 * 返回到資料選擇
 */
function goBackToDataSelection() {
  closeUploadDataModal();
  showAddDataModal();
}

/**
 * 處理上傳模式變更
 */
function handleUploadModeChange(mode) {
  uploadMode = mode;
  
  // 根據模式更新檔案輸入
  if (elements.fileInput) {
    if (mode === 'folder') {
      elements.fileInput.setAttribute('webkitdirectory', '');
      elements.fileInput.setAttribute('directory', '');
    } else {
      elements.fileInput.removeAttribute('webkitdirectory');
      elements.fileInput.removeAttribute('directory');
    }
  }
}

/**
 * 處理標籤模式變更
 */
function handleLabelModeChange(mode) {
  labelMode = mode;
  
  if (elements.labelInputSection) {
    if (mode === 'enter-label') {
      elements.labelInputSection.style.display = 'block';
    } else {
      elements.labelInputSection.style.display = 'none';
    }
  }
}

/**
 * 處理檔案選擇
 */
function handleFileSelect(event) {
  const files = Array.from(event.target.files);
  addFilesToList(files);
}

/**
 * 添加檔案到列表
 */
function addFilesToList(files) {
  let addedCount = 0;
  
  files.forEach(file => {
    // 檢查檔案類型
    const allowedTypes = [
      'image/jpeg', 'image/jpg', 'image/png', 
      'text/csv', 'application/json', 
      'audio/wav', 'video/avi', 'video/mp4',
      'application/cbor', 'application/parquet'
    ];
    
    const isAllowedType = allowedTypes.some(type => 
      file.type === type || 
      file.name.toLowerCase().endsWith(type.split('/')[1]) ||
      (type === 'application/cbor' && file.name.toLowerCase().endsWith('.cbor')) ||
      (type === 'application/parquet' && file.name.toLowerCase().endsWith('.parquet'))
    );
    
    if (!isAllowedType) {
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
    updateFileDisplay();
    updateUploadButton();
  }
}

/**
 * 更新檔案顯示
 */
function updateFileDisplay() {
  // 更新狀態文字
  if (elements.uploadStatus) {
    if (selectedFiles.length === 0) {
      elements.uploadStatus.textContent = '沒有選擇檔案';
    } else {
      elements.uploadStatus.textContent = `已選擇 ${selectedFiles.length} 個檔案`;
    }
  }
  
  // 更新檔案列表
  if (elements.selectedFilesSection && elements.selectedFileList) {
    if (selectedFiles.length === 0) {
      elements.selectedFilesSection.style.display = 'none';
    } else {
      elements.selectedFilesSection.style.display = 'block';
      updateFileList();
    }
  }
}

/**
 * 更新檔案列表
 */
function updateFileList() {
  if (!elements.selectedFileList) return;
  
  elements.selectedFileList.innerHTML = '';
  
  selectedFiles.forEach((file, index) => {
    const fileItem = document.createElement('div');
    fileItem.className = 'file-item';
    
    const fileType = getFileType(file);
    const iconClass = getFileIconClass(fileType);
    const iconName = getFileIconName(fileType);
    
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
    
    elements.selectedFileList.appendChild(fileItem);
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
    updateFileDisplay();
    updateUploadButton();
  }
}

/**
 * 更新上傳按鈕狀態
 */
function updateUploadButton() {
  if (elements.uploadDataBtn) {
    elements.uploadDataBtn.disabled = selectedFiles.length === 0;
  }
}

/**
 * 確認上傳資料
 */
function confirmUploadData() {
  if (selectedFiles.length === 0) return;
  
  // 獲取自訂標籤（如果有）
  if (labelMode === 'enter-label' && elements.customLabelInput) {
    customLabel = elements.customLabelInput.value.trim();
    if (!customLabel) {
      showNotification('請輸入標籤', '請為您的資料輸入標籤', 'warning');
      return;
    }
  }
  
  // 顯示上傳進度
  showNotification('開始上傳', `正在上傳 ${selectedFiles.length} 個檔案...`, 'info');
  
  // 模擬上傳過程
  setTimeout(() => {
    const uploadInfo = {
      files: selectedFiles.length,
      mode: uploadMode,
      category: uploadCategory,
      labelMode: labelMode,
      customLabel: customLabel
    };
    
    showNotification('上傳成功', `成功上傳 ${uploadInfo.files} 個檔案到${getCategoryDisplayName(uploadInfo.category)}`, 'success');
    closeUploadDataModal();
    
    // 重置檔案輸入
    if (elements.fileInput) {
      elements.fileInput.value = '';
    }
  }, 2000);
}

/**
 * 獲取類別顯示名稱
 */
function getCategoryDisplayName(category) {
  const names = {
    'auto-split': '自動分割資料集',
    'training': '訓練資料集',
    'testing': '測試資料集'
  };
  return names[category] || category;
}

/**
 * 獲取檔案類型
 */
function getFileType(file) {
  if (file.type.startsWith('image/')) return 'image';
  if (file.type.startsWith('video/')) return 'video';
  if (file.type.startsWith('audio/')) return 'audio';
  return 'data';
}

/**
 * 獲取檔案圖示類別
 */
function getFileIconClass(fileType) {
  return fileType;
}

/**
 * 獲取檔案圖示名稱
 */
function getFileIconName(fileType) {
  const icons = {
    image: 'fa-image',
    video: 'fa-video',
    audio: 'fa-music',
    data: 'fa-file-alt'
  };
  return icons[fileType] || 'fa-file';
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
 * 顯示設備配置彈窗
 */
function showDeviceConfig() {
  console.log('showDeviceConfig called');
  const modal = document.getElementById('device-config-modal');
  if (modal) {
    console.log('Adding show class to device config modal');
    modal.classList.add('show');
  } else {
    console.error('Device config modal not found');
  }
}

/**
 * 關閉設備配置彈窗
 */
function closeDeviceConfig() {
  const modal = document.getElementById('device-config-modal');
  if (modal) {
    modal.classList.remove('show');
  }
}

/**
 * 更新設備規格
 */
function updateDeviceSpecs() {
  const deviceSelect = document.getElementById('target-device');
  const processorFamily = document.getElementById('processor-family');
  const clockRate = document.getElementById('clock-rate');
  const ramBudget = document.getElementById('ram-budget');
  const romBudget = document.getElementById('rom-budget');
  const latencyBudget = document.getElementById('latency-budget');
  
  if (!deviceSelect || !processorFamily || !clockRate || !ramBudget || !romBudget || !latencyBudget) return;
  
  const deviceSpecs = {
    // 預設 Cortex-M4F
    'cortex-m4f-80': { family: 'cortex-m', clock: 80, ram: 128, rom: 1, latency: 100 },
    
    // Alif 系列
    'alif-he-m55': { family: 'cortex-m', clock: 160, ram: 4096, rom: 8, latency: 50 },
    'alif-hp-m55': { family: 'cortex-m', clock: 400, ram: 8192, rom: 16, latency: 30 },
    
    // Ambiq 系列
    'ambiq-apollo4': { family: 'cortex-m', clock: 192, ram: 2048, rom: 2, latency: 60 },
    'ambiq-apollo5': { family: 'cortex-m', clock: 250, ram: 4096, rom: 4, latency: 50 },
    
    // Arduino 系列
    'arduino-nano33-ble': { family: 'cortex-m', clock: 64, ram: 256, rom: 1, latency: 150 },
    'arduino-nicla-vision': { family: 'cortex-m', clock: 480, ram: 1024, rom: 2, latency: 80 },
    'arduino-nicla-voice': { family: 'cortex-m', clock: 240, ram: 512, rom: 1, latency: 120 },
    'arduino-portenta-h7': { family: 'cortex-m', clock: 480, ram: 1024, rom: 2, latency: 80 },
    
    // BrainChip
    'brainchip-akd1000': { family: 'other', clock: 1000, ram: 8192, rom: 32, latency: 10 },
    
    // BrickML
    'brickml-m33': { family: 'cortex-m', clock: 192, ram: 512, rom: 2, latency: 100 },
    
    // Cortex 通用系列
    'cortex-m7-216': { family: 'cortex-m', clock: 216, ram: 512, rom: 2, latency: 80 },
    
    // Digi ConnectCore
    'digi-connect-core': { family: 'cortex-a', clock: 1700, ram: 2048, rom: 8, latency: 20 },
    
    // Espressif
    'espressif-esp-eye': { family: 'xtensa', clock: 240, ram: 520, rom: 4, latency: 100 },
    
    // Himax 系列
    'himax-we1': { family: 'arc', clock: 400, ram: 2048, rom: 16, latency: 50 },
    'himax-wiseye2': { family: 'cortex-m', clock: 400, ram: 2560, rom: 16, latency: 40 },
    'himax-wiseye2-ethos': { family: 'cortex-m', clock: 400, ram: 2560, rom: 16, latency: 30 },
    
    // 其他設備...（保持原有的設備規格）
    'custom': { family: 'cortex-m', clock: 100, ram: 256, rom: 2, latency: 100 }
  };
  
  const specs = deviceSpecs[deviceSelect.value] || deviceSpecs['cortex-m4f-80'];
  processorFamily.value = specs.family;
  clockRate.value = specs.clock;
  ramBudget.value = specs.ram;
  romBudget.value = specs.rom;
  latencyBudget.value = specs.latency;
}

/**
 * 重設為預設設定
 */
function resetToDefaults() {
  const targetDevice = document.getElementById('target-device');
  const processorFamily = document.getElementById('processor-family');
  const clockRate = document.getElementById('clock-rate');
  const customName = document.getElementById('custom-name');
  const ramBudget = document.getElementById('ram-budget');
  const romBudget = document.getElementById('rom-budget');
  const latencyBudget = document.getElementById('latency-budget');
  
  if (targetDevice) targetDevice.value = 'cortex-m4f-80';
  if (processorFamily) processorFamily.value = 'cortex-m';
  if (clockRate) clockRate.value = '80';
  if (customName) customName.value = '';
  if (ramBudget) ramBudget.value = '128';
  if (romBudget) romBudget.value = '1';
  if (latencyBudget) latencyBudget.value = '100';
  
  showNotification('已重設', '所有設定已重設為預設值', 'info');
}

/**
 * 儲存設備配置
 */
function saveDeviceConfig() {
  const targetDevice = document.getElementById('target-device');
  const clockRate = document.getElementById('clock-rate');
  const ramBudget = document.getElementById('ram-budget');
  const romBudget = document.getElementById('rom-budget');
  
  if (targetDevice && clockRate && ramBudget && romBudget) {
    const config = {
      device: targetDevice.value,
      clock: clockRate.value,
      ram: ramBudget.value,
      rom: romBudget.value
    };
    
    // 這裡可以保存配置到 localStorage
    localStorage.setItem('deviceConfig', JSON.stringify(config));
    
    showNotification('配置已儲存', '設備配置已成功儲存', 'success');
    closeDeviceConfig();
  }
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
window.showUploadDataModal = showUploadDataModal;
window.closeUploadDataModal = closeUploadDataModal;
window.selectUploadType = selectUploadType;
window.goBackToDataSelection = goBackToDataSelection;
window.handleUploadModeChange = handleUploadModeChange;
window.handleLabelModeChange = handleLabelModeChange;
window.handleFileSelect = handleFileSelect;
window.removeFile = removeFile;
window.confirmUploadData = confirmUploadData;
window.goToMain = goToMain;
window.showDeviceConfig = showDeviceConfig;
window.closeDeviceConfig = closeDeviceConfig;
window.updateDeviceSpecs = updateDeviceSpecs;
window.resetToDefaults = resetToDefaults;
window.saveDeviceConfig = saveDeviceConfig;
window.showComingSoon = showComingSoon;
window.closeNotification = closeNotification;