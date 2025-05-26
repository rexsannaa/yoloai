/**
 * 顯示即將推出訊息
 */
function showComingSoon() {
  showNotification('功能開發中', '此功能正在開發中，敬請期待！', 'info');
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
window.showDeviceConfig = showDeviceConfig;
window.closeDeviceConfig = closeDeviceConfig;
window.updateDeviceSpecs = updateDeviceSpecs;
window.resetToDefaults = resetToDefaults;
window.saveDeviceConfig = saveDeviceConfig;// js/data-upload.js - 資料管理頁面功能

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
 * 顯示設備配置彈窗
 */
function showDeviceConfig() {
  const modal = document.getElementById('device-config-modal');
  if (modal) {
    modal.classList.add('show');
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
 * 顯示設備選擇彈窗
 */
function showDeviceSelect() {
  const modal = document.getElementById('device-select-modal');
  if (modal) {
    modal.classList.add('show');
  }
}

/**
 * 關閉設備選擇彈窗
 */
function closeDeviceSelect() {
  const modal = document.getElementById('device-select-modal');
  if (modal) {
    modal.classList.remove('show');
  }
}

/**
 * 更新設備規格
 */
function updateDeviceSpecs() {
  const deviceSelect = document.getElementById('target-device');
  const clockRate = document.getElementById('clock-rate');
  const ramBudget = document.getElementById('ram-budget');
  const romBudget = document.getElementById('rom-budget');
  const latencyBudget = document.getElementById('latency-budget');
  
  if (!deviceSelect || !clockRate || !ramBudget || !romBudget || !latencyBudget) return;
  
  const deviceSpecs = {
    // 預設 Cortex-M4F
    'cortex-m4f-80': { clock: 80, ram: 128, rom: 1, latency: 100 },
    
    // Alif 系列
    'alif-he-m55': { clock: 160, ram: 4096, rom: 8, latency: 50 },
    'alif-hp-m55': { clock: 400, ram: 8192, rom: 16, latency: 30 },
    
    // Ambiq 系列
    'ambiq-apollo4': { clock: 192, ram: 2048, rom: 2, latency: 60 },
    'ambiq-apollo5': { clock: 250, ram: 4096, rom: 4, latency: 50 },
    
    // Arduino 系列
    'arduino-nano33-ble': { clock: 64, ram: 256, rom: 1, latency: 150 },
    'arduino-nicla-vision': { clock: 480, ram: 1024, rom: 2, latency: 80 },
    'arduino-nicla-voice': { clock: 240, ram: 512, rom: 1, latency: 120 },
    'arduino-portenta-h7': { clock: 480, ram: 1024, rom: 2, latency: 80 },
    
    // BrainChip
    'brainchip-akd1000': { clock: 1000, ram: 8192, rom: 32, latency: 10 },
    
    // BrickML
    'brickml-m33': { clock: 192, ram: 512, rom: 2, latency: 100 },
    
    // Cortex 通用系列
    'cortex-m7-216': { clock: 216, ram: 512, rom: 2, latency: 80 },
    
    // Digi ConnectCore
    'digi-connect-core': { clock: 1700, ram: 2048, rom: 8, latency: 20 },
    
    // Espressif
    'espressif-esp-eye': { clock: 240, ram: 520, rom: 4, latency: 100 },
    
    // Himax 系列
    'himax-we1': { clock: 400, ram: 2048, rom: 16, latency: 50 },
    'himax-wiseye2': { clock: 400, ram: 2560, rom: 16, latency: 40 },
    'himax-wiseye2-ethos': { clock: 400, ram: 2560, rom: 16, latency: 30 },
    
    // IMDT
    'imdt-v2h-cpu': { clock: 1200, ram: 2048, rom: 8, latency: 25 },
    'imdt-v2h-renesas': { clock: 1200, ram: 2048, rom: 8, latency: 20 },
    
    // Infineon PSoC6
    'infineon-psoc6-cy8c6244': { clock: 150, ram: 1024, rom: 2, latency: 100 },
    'infineon-psoc6-cy8c6347': { clock: 150, ram: 1024, rom: 2, latency: 100 },
    
    // MacBook Pro (特殊情況)
    'macbook-pro-16-2020': { clock: 2400, ram: 16384, rom: 512, latency: 5 },
    
    // MemoryX
    'memoryx-mx3': { clock: 800, ram: 4096, rom: 32, latency: 20 },
    
    // Microchip
    'microchip-sama7g54': { clock: 1000, ram: 512, rom: 4, latency: 30 },
    
    // Nordic 系列
    'nordic-nrf52840': { clock: 64, ram: 256, rom: 1, latency: 150 },
    'nordic-nrf5340': { clock: 128, ram: 512, rom: 1, latency: 120 },
    'nordic-nrf9151': { clock: 64, ram: 256, rom: 1, latency: 150 },
    'nordic-nrf9160': { clock: 64, ram: 256, rom: 1, latency: 150 },
    'nordic-nrf9161': { clock: 64, ram: 256, rom: 1, latency: 150 },
    
    // Nvidia Jetson 系列
    'nvidia-jetson-nano': { clock: 1430, ram: 4096, rom: 16, latency: 15 },
    'nvidia-jetson-orin-nx': { clock: 2000, ram: 8192, rom: 32, latency: 10 },
    'nvidia-jetson-orin-nano': { clock: 1500, ram: 8192, rom: 32, latency: 12 },
    
    // OpenMV
    'openmv-cam-h7': { clock: 480, ram: 1024, rom: 2, latency: 80 },
    
    // Particle 系列
    'particle-boron': { clock: 64, ram: 256, rom: 1, latency: 150 },
    'particle-photon-2': { clock: 200, ram: 512, rom: 2, latency: 100 },
    
    // Qualcomm
    'qualcomm-dragonwing-rb3': { clock: 2840, ram: 4096, rom: 32, latency: 8 },
    
    // Raspberry Pi 系列
    'raspberry-pi-4': { clock: 1500, ram: 4096, rom: 32, latency: 15 },
    'raspberry-pi-5': { clock: 2400, ram: 8192, rom: 64, latency: 10 },
    'raspberry-pi-rp2040': { clock: 133, ram: 264, rom: 2, latency: 120 },
    
    // Renesas 系列
    'renesas-ra6m5': { clock: 200, ram: 512, rom: 2, latency: 90 },
    'renesas-ra8d1': { clock: 480, ram: 1024, rom: 4, latency: 60 },
    'renesas-rz-g2l': { clock: 1200, ram: 1024, rom: 4, latency: 25 },
    'renesas-rz-v2h-cpu': { clock: 1200, ram: 2048, rom: 8, latency: 25 },
    'renesas-rz-v2h-drp': { clock: 1200, ram: 2048, rom: 8, latency: 15 },
    'renesas-rz-v2l-cpu': { clock: 1200, ram: 1024, rom: 4, latency: 30 },
    'renesas-rz-v2l-drp': { clock: 1200, ram: 1024, rom: 4, latency: 20 },
    
    // STMicroelectronics 系列
    'st-discovery-kit': { clock: 80, ram: 128, rom: 1, latency: 100 },
    'st-stm32n6': { clock: 600, ram: 2048, rom: 8, latency: 40 },
    
    // Seeed 系列
    'seeed-sensecap-a1101': { clock: 400, ram: 2048, rom: 16, latency: 50 },
    'seeed-studio-wio-terminal': { clock: 120, ram: 192, rom: 4, latency: 120 },
    'seeed-vision-ai-module': { clock: 400, ram: 2048, rom: 16, latency: 50 },
    
    // SiLabs 系列
    'silabs-efr32mg24': { clock: 78, ram: 256, rom: 1, latency: 140 },
    'silabs-thunderboard-sense2': { clock: 40, ram: 256, rom: 1, latency: 200 },
    
    // Sony
    'sony-spresense': { clock: 156, ram: 1536, rom: 8, latency: 80 },
    
    // Synaptics
    'synaptics-ka10000': { clock: 1000, ram: 4096, rom: 16, latency: 20 },
    
    // Texas Instruments 系列
    'ti-am62a-deep-learning': { clock: 1400, ram: 2048, rom: 8, latency: 15 },
    'ti-am68a-deep-learning': { clock: 2000, ram: 8192, rom: 32, latency: 10 },
    'ti-launchxl-cc1352p': { clock: 48, ram: 80, rom: 0.3, latency: 200 },
    'ti-tda4vm-mma': { clock: 2000, ram: 4096, rom: 16, latency: 12 },
    
    // Think Silicon
    'think-silicon-neox-ga100': { clock: 200, ram: 512, rom: 4, latency: 100 },
    
    // 自訂
    'custom': { clock: 100, ram: 256, rom: 2, latency: 100 }
  };
  
  const specs = deviceSpecs[deviceSelect.value] || deviceSpecs['cortex-m4f-80'];
  clockRate.value = specs.clock;
  ramBudget.value = specs.ram;
  romBudget.value = specs.rom;
  latencyBudget.value = specs.latency;
}

/**
 * 篩選設備列表
 */
function filterDevices() {
  const searchInput = document.getElementById('device-search');
  const deviceItems = document.querySelectorAll('.device-item');
  
  if (!searchInput) return;
  
  const searchTerm = searchInput.value.toLowerCase();
  
  deviceItems.forEach(item => {
    const deviceName = item.textContent.toLowerCase();
    if (deviceName.includes(searchTerm)) {
      item.classList.remove('hidden');
    } else {
      item.classList.add('hidden');
    }
  });
}

/**
 * 選擇設備
 */
function selectDevice() {
  const selectedItem = document.querySelector('.device-item.selected');
  const targetDeviceSelect = document.getElementById('target-device');
  
  if (selectedItem && targetDeviceSelect) {
    const deviceValue = selectedItem.getAttribute('data-device');
    targetDeviceSelect.value = deviceValue;
    updateDeviceSpecs();
    closeDeviceSelect();
  }
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
    
    // 這裡可以保存配置到 localStorage 或發送到伺服器
    localStorage.setItem('deviceConfig', JSON.stringify(config));
    
    showNotification('配置已儲存', '設備配置已成功儲存', 'success');
    closeDeviceConfig();
  }
}

// 設備項目點擊事件
document.addEventListener('DOMContentLoaded', function() {
  // 載入已保存的設備配置
  const savedConfig = localStorage.getItem('deviceConfig');
  if (savedConfig) {
    try {
      const config = JSON.parse(savedConfig);
      const targetDevice = document.getElementById('target-device');
      const clockRate = document.getElementById('clock-rate');
      const ramBudget = document.getElementById('ram-budget');
      const romBudget = document.getElementById('rom-budget');
      
      if (targetDevice && config.device) targetDevice.value = config.device;
      if (clockRate && config.clock) clockRate.value = config.clock;
      if (ramBudget && config.ram) ramBudget.value = config.ram;
      if (romBudget && config.rom) romBudget.value = config.rom;
    } catch (e) {
      console.log('無法載入設備配置');
    }
  }
});

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