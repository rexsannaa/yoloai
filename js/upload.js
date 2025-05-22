// js/upload.js - 上傳功能相關邏輯

/**
 * 上傳頁面功能模組
 * 處理檔案上傳、拖放和預覽等功能
 */

document.addEventListener('DOMContentLoaded', function() {
  loadProjectInfo();
  setupUploadEvents();
  setupUploadPageEvents();
});

/**
 * 載入專案資訊
 */
function loadProjectInfo() {
  const projectInfo = JSON.parse(localStorage.getItem('currentProject') || '{}');
  const projectName = projectInfo.name || '我的第一個專案';
  
  document.title = `上傳檔案 - ${projectName} - 南臺科技大學AI視覺訓練平台`;
  
  const projectNameDisplay = document.getElementById('project-name-display');
  if (projectNameDisplay) {
    projectNameDisplay.textContent = projectName;
  }
}

/**
 * 設置上傳相關事件處理
 */
function setupUploadEvents() {
  const fileInput = document.getElementById('file-input');
  const folderInput = document.getElementById('folder-input');
  const selectFileBtn = document.getElementById('select-file-btn');
  const selectFolderBtn = document.getElementById('select-folder-btn');
  const uploadArea = document.getElementById('upload-area');
  
  if (selectFileBtn && fileInput) {
    selectFileBtn.addEventListener('click', function() {
      fileInput.click();
    });
  }
  
  if (selectFolderBtn && folderInput) {
    selectFolderBtn.addEventListener('click', function() {
      folderInput.click();
    });
  }
  
  if (fileInput) {
    fileInput.addEventListener('change', function() {
      handleFiles(this.files);
    });
  }
  
  if (folderInput) {
    folderInput.addEventListener('change', function() {
      handleFiles(this.files);
    });
  }
  
  if (uploadArea) {
    uploadArea.addEventListener('dragover', function(e) {
      e.preventDefault();
      e.stopPropagation();
      this.classList.add('dragover');
    });
    
    uploadArea.addEventListener('dragleave', function(e) {
      e.preventDefault();
      e.stopPropagation();
      this.classList.remove('dragover');
    });
    
    uploadArea.addEventListener('drop', function(e) {
      e.preventDefault();
      e.stopPropagation();
      this.classList.remove('dragover');
      
      if (e.dataTransfer.files) {
        handleFiles(e.dataTransfer.files);
      }
    });
  }
}

/**
 * 設置上傳頁面的特定事件
 */
function setupUploadPageEvents() {
  const toggleBtn = document.getElementById('toggle-project-sidebar');
  const projectSidebar = document.querySelector('.project-sidebar');
  
  if (toggleBtn && projectSidebar) {
    toggleBtn.addEventListener('click', () => {
      projectSidebar.classList.toggle('show');
    });
  }
  
  const cancelBtn = document.getElementById('cancel-btn');
  if (cancelBtn) {
    cancelBtn.addEventListener('click', () => {
      window.location.href = 'index.html';
    });
  }
  
  const continueBtn = document.getElementById('continue-btn');
  if (continueBtn) {
    continueBtn.addEventListener('click', continueToAnnotation);
  }
}

/**
 * 處理上傳的檔案
 * @param {FileList} files - 用戶選擇的檔案列表
 */
function handleFiles(files) {
  const fileList = document.getElementById('file-list');
  if (!fileList) return;
  
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    
    if (!file.type.startsWith('image/')) {
      alert(`檔案 "${file.name}" 不是支援的圖片格式`);
      continue;
    }
    
    const fileItem = document.createElement('div');
    fileItem.className = 'file-item';
    
    const fileExt = file.name.split('.').pop().toLowerCase();
    let iconClass = 'fa-file-image';
    
    fileItem.innerHTML = `
      <i class="fas ${iconClass} file-icon"></i>
      <div class="file-info">
        <div class="file-name">${file.name}</div>
        <div class="file-size">${formatFileSize(file.size)}</div>
        <div class="file-progress">
          <div class="file-progress-bar" id="progress-${i}"></div>
        </div>
      </div>
      <div class="file-actions">
        <button onclick="removeFile(this)"><i class="fas fa-times"></i></button>
      </div>
    `;
    
    fileList.appendChild(fileItem);
    
    simulateUpload(i);
  }
  
  updateFileBadge();
}

/**
 * 模擬檔案上傳進度
 * @param {number} fileIndex - 檔案索引
 */
function simulateUpload(fileIndex) {
  const progressBar = document.getElementById(`progress-${fileIndex}`);
  if (!progressBar) return;
  
  progressBar.style.animation = 'progressAnimation 1.5s forwards';
  
  setTimeout(() => {
    progressBar.style.backgroundColor = '#10b981';
  }, 1500);
}

/**
 * 移除檔案
 * @param {HTMLElement} button - 刪除按鈕元素
 */
function removeFile(button) {
  const fileItem = button.closest('.file-item');
  if (!fileItem) return;
  
  fileItem.classList.add('fadeOut');
  
  setTimeout(() => {
    fileItem.remove();
    updateFileBadge();
  }, 300);
}

/**
 * 更新檔案計數徽章
 */
function updateFileBadge() {
  const fileList = document.getElementById('file-list');
  const badge = document.getElementById('file-count-badge');
  
  if (fileList && badge) {
    const count = fileList.children.length;
    badge.textContent = count;
    
    if (count > 0) {
      badge.style.backgroundColor = '#d6e5ff';
      badge.style.color = '#3b82f6';
    } else {
      badge.style.backgroundColor = '#e5e7eb';
      badge.style.color = '#4b5563';
    }
  }
}

/**
 * 格式化檔案大小
 * @param {number} bytes - 檔案大小（位元組）
 * @returns {string} 格式化後的檔案大小
 */
function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * 前往標註頁面
 */
function continueToAnnotation() {
  const fileList = document.getElementById('file-list');
  if (fileList && fileList.children.length === 0) {
    alert('請上傳至少一張圖片');
    return;
  }
  
  if (typeof showComingSoonMessage === 'function') {
    showComingSoonMessage();
  } else {
    alert("🚧 功能尚未開放\n這個功能目前仍在開發中，敬請期待！");
  }
  
  setTimeout(() => window.location.href = 'index.html', 800);
}