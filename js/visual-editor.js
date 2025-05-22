// visual-editor.js - 視覺化編輯器頁面腳本

/**
 * 視覺化編輯器頁面功能模組
 * 處理標註框拖拽、調整大小和標籤管理
 */

document.addEventListener('DOMContentLoaded', function() {
  // 檢查登入狀態
  if (typeof checkLoginStatus === 'function') {
    checkLoginStatus();
  }
  
  // 初始化編輯器
  initEditor();
  
  // 設置移動設備側邊欄切換
  setupMobileSidebar();
  
  // 設置彈窗功能
  setupModals();
});

// 全局變量
let activeLabel = '人';
let zoomLevel = 100;
let activeTool = 'select';
let isDragging = false;
let isResizing = false;
let activeBox = null;
let startX, startY, startWidth, startHeight, startLeft, startTop;
let resizeHandle = null;

/**
 * 初始化編輯器功能
 */
function initEditor() {
  // 設置工具按鈕事件
  setupToolButtons();
  
  // 設置縮放控制事件
  setupZoomControls();
  
  // 設置標籤項目點擊事件
  setupLabelItems();
  
  // 設置標註框拖拽功能
  setupAnnotationBoxes();
  
  // 設置畫布拖拽和繪製事件
  setupCanvasEvents();
  
  // 設置坐標輸入更新事件
  setupCoordinateInputs();
  
  // 設置保存按鈕事件
  document.getElementById('save-labels-btn').addEventListener('click', saveLabels);
  
  // 設置AI自動標註按鈕事件
  document.getElementById('auto-label-btn').addEventListener('click', showAILabelModal);
  
  // 設置圖片選擇事件
  setupImageSelection();
  
  // 設置標籤添加和確認事件
  setupLabelAddition();
  
  // 設置圖片過濾器事件
  setupImageFilter();
  
  // 設置視覺化顯示按鈕
  document.getElementById('show-visualization-btn').addEventListener('click', showVisualization);
}

/**
 * 設置工具按鈕事件
 */
function setupToolButtons() {
  const toolButtons = document.querySelectorAll('.tool-btn');
  
  toolButtons.forEach(button => {
    button.addEventListener('click', function() {
      // 移除所有按鈕的active類
      toolButtons.forEach(btn => btn.classList.remove('active'));
      
      // 添加當前按鈕的active類
      this.classList.add('active');
      
      // 更新活動工具
      activeTool = this.getAttribute('data-tool');
      
      // 如果選擇了刪除工具
      if (activeTool === 'delete') {
        if (activeBox) {
          activeBox.remove();
          activeBox = null;
          updateCoordinateInputs(null);
        }
        
        // 自動切換回選擇工具
        setTimeout(() => {
          activeTool = 'select';
          document.querySelector('[data-tool="select"]').classList.add('active');
          document.querySelector('[data-tool="delete"]').classList.remove('active');
        }, 300);
      }
    });
  });
}

/**
 * 設置縮放控制事件
 */
function setupZoomControls() {
  const zoomInBtn = document.getElementById('zoom-in-btn');
  const zoomOutBtn = document.getElementById('zoom-out-btn');
  const zoomLevelDisplay = document.querySelector('.zoom-level');
  
  zoomInBtn.addEventListener('click', function() {
    if (zoomLevel < 200) {
      zoomLevel += 10;
      updateZoom();
    }
  });
  
  zoomOutBtn.addEventListener('click', function() {
    if (zoomLevel > 50) {
      zoomLevel -= 10;
      updateZoom();
    }
  });
  
  function updateZoom() {
    zoomLevelDisplay.textContent = `${zoomLevel}%`;
    document.getElementById('editor-image').style.transform = `scale(${zoomLevel / 100})`;
  }
}

/**
 * 設置標籤項目點擊事件
 */
function setupLabelItems() {
  const labelItems = document.querySelectorAll('.label-item');
  
  labelItems.forEach(item => {
    item.addEventListener('click', function() {
      // 移除所有項目的active類
      labelItems.forEach(li => li.classList.remove('active'));
      
      // 添加當前項目的active類
      this.classList.add('active');
      
      // 更新活動標籤
      activeLabel = this.querySelector('.label-name').textContent;
      
      // 更新表單
      document.getElementById('label-name-input').value = activeLabel;
      const labelColor = this.querySelector('.label-color').style.backgroundColor;
      document.getElementById('label-color-input').value = rgbToHex(labelColor);
      
      // 如果有活動的標註框，更新其標籤
      if (activeBox) {
        activeBox.querySelector('.annotation-label').textContent = activeLabel;
      }
    });
  });
}

/**
 * 設置標註框拖拽功能
 */
function setupAnnotationBoxes() {
  const annotationBoxes = document.querySelectorAll('.annotation-box');
  
  annotationBoxes.forEach(box => {
    makeBoxDraggable(box);
    makeBoxResizable(box);
    
    // 點擊選擇框
    box.addEventListener('mousedown', function(e) {
      if (activeTool === 'select' && !isResizing) {
        // 移除其他框的高亮
        document.querySelectorAll('.annotation-box').forEach(b => {
          b.style.borderColor = '';
        });
        
        // 高亮當前框
        this.style.borderColor = '#ef4444';
        
        // 設置為活動框
        activeBox = this;
        
        // 更新坐標輸入
        updateCoordinateInputs(this);
        
        // 更新標籤表單
        updateLabelForm(this.querySelector('.annotation-label').textContent);
      }
    });
  });
}

/**
 * 使框可拖動
 * @param {HTMLElement} box - 標註框元素
 */
function makeBoxDraggable(box) {
  box.addEventListener('mousedown', function(e) {
    if (activeTool !== 'select') return;
    
    // 如果點擊的是調整手柄，不進行拖動
    if (e.target.classList.contains('resize-handle')) return;
    
    isDragging = true;
    activeBox = box;
    
    const rect = box.getBoundingClientRect();
    startX = e.clientX;
    startY = e.clientY;
    startLeft = parseInt(box.style.left) || 0;
    startTop = parseInt(box.style.top) || 0;
    
    document.addEventListener('mousemove', dragBox);
    document.addEventListener('mouseup', stopDragging);
    
    e.preventDefault();
  });
}

/**
 * 拖動框
 * @param {MouseEvent} e - 鼠標事件
 */
function dragBox(e) {
  if (!isDragging) return;
  
  const dx = e.clientX - startX;
  const dy = e.clientY - startY;
  
  activeBox.style.left = `${startLeft + dx}px`;
  activeBox.style.top = `${startTop + dy}px`;
  
  // 更新坐標輸入
  updateCoordinateInputs(activeBox);
}

/**
 * 停止拖動
 */
function stopDragging() {
  isDragging = false;
  document.removeEventListener('mousemove', dragBox);
  document.removeEventListener('mouseup', stopDragging);
}

/**
 * 使框可調整大小
 * @param {HTMLElement} box - 標註框元素
 */
function makeBoxResizable(box) {
  const handles = box.querySelectorAll('.resize-handle');
  
  handles.forEach(handle => {
    handle.addEventListener('mousedown', function(e) {
      if (activeTool !== 'select') return;
      
      isResizing = true;
      activeBox = box;
      resizeHandle = this;
      
      startX = e.clientX;
      startY = e.clientY;
      startWidth = parseInt(box.style.width) || box.offsetWidth;
      startHeight = parseInt(box.style.height) || box.offsetHeight;
      startLeft = parseInt(box.style.left) || 0;
      startTop = parseInt(box.style.top) || 0;
      
      document.addEventListener('mousemove', resizeBox);
      document.addEventListener('mouseup', stopResizing);
      
      e.preventDefault();
      e.stopPropagation();
    });
  });
}

/**
 * 調整框大小
 * @param {MouseEvent} e - 鼠標事件
 */
function resizeBox(e) {
  if (!isResizing) return;
  
  const dx = e.clientX - startX;
  const dy = e.clientY - startY;
  
  if (resizeHandle.classList.contains('top-left')) {
    activeBox.style.width = `${startWidth - dx}px`;
    activeBox.style.height = `${startHeight - dy}px`;
    activeBox.style.left = `${startLeft + dx}px`;
    activeBox.style.top = `${startTop + dy}px`;
  } else if (resizeHandle.classList.contains('top-right')) {
    activeBox.style.width = `${startWidth + dx}px`;
    activeBox.style.height = `${startHeight - dy}px`;
    activeBox.style.top = `${startTop + dy}px`;
  } else if (resizeHandle.classList.contains('bottom-left')) {
    activeBox.style.width = `${startWidth - dx}px`;
    activeBox.style.height = `${startHeight + dy}px`;
    activeBox.style.left = `${startLeft + dx}px`;
  } else if (resizeHandle.classList.contains('bottom-right')) {
    activeBox.style.width = `${startWidth + dx}px`;
    activeBox.style.height = `${startHeight + dy}px`;
  }
  
  // 防止尺寸太小
  if (parseInt(activeBox.style.width) < 20) activeBox.style.width = '20px';
  if (parseInt(activeBox.style.height) < 20) activeBox.style.height = '20px';
  
  // 更新坐標輸入
  updateCoordinateInputs(activeBox);
}

/**
 * 停止調整大小
 */
function stopResizing() {
  isResizing = false;
  document.removeEventListener('mousemove', resizeBox);
  document.removeEventListener('mouseup', stopResizing);
}

/**
 * 設置畫布拖拽和繪製事件
 */
function setupCanvasEvents() {
  const canvasContainer = document.querySelector('.canvas-container');
  let isDrawing = false;
  let startDrawX, startDrawY;
  
  // 繪製矩形
  canvasContainer.addEventListener('mousedown', function(e) {
    if (activeTool !== 'rectangle') return;
    
    // 只有點擊畫布背景時才開始繪製
    if (e.target !== canvasContainer && e.target.id !== 'editor-image') return;
    
    isDrawing = true;
    
    const rect = canvasContainer.getBoundingClientRect();
    startDrawX = e.clientX - rect.left;
    startDrawY = e.clientY - rect.top;
    
    // 創建新的標註框
    const newBox = document.createElement('div');
    newBox.className = 'annotation-box';
    newBox.style.left = `${startDrawX}px`;
    newBox.style.top = `${startDrawY}px`;
    newBox.style.width = '0';
    newBox.style.height = '0';
    
    // 添加標籤
    const label = document.createElement('div');
    label.className = 'annotation-label';
    label.textContent = activeLabel;
    newBox.appendChild(label);
    
    // 添加調整手柄
    const positions = ['top-left', 'top-right', 'bottom-left', 'bottom-right'];
    positions.forEach(pos => {
      const handle = document.createElement('div');
      handle.className = `resize-handle ${pos}`;
      newBox.appendChild(handle);
    });
    
    canvasContainer.appendChild(newBox);
    activeBox = newBox;
    
    document.addEventListener('mousemove', drawBox);
    document.addEventListener('mouseup', stopDrawing);
  });
  
  // 繪製框
  function drawBox(e) {
    if (!isDrawing) return;
    
    const rect = canvasContainer.getBoundingClientRect();
    const currentX = e.clientX - rect.left;
    const currentY = e.clientY - rect.top;
    
    const width = Math.abs(currentX - startDrawX);
    const height = Math.abs(currentY - startDrawY);
    
    // 根據拖動方向設置位置
    if (currentX < startDrawX) {
      activeBox.style.left = `${currentX}px`;
    } else {
      activeBox.style.left = `${startDrawX}px`;
    }
    
    if (currentY < startDrawY) {
      activeBox.style.top = `${currentY}px`;
    } else {
      activeBox.style.top = `${startDrawY}px`;
    }
    
    activeBox.style.width = `${width}px`;
    activeBox.style.height = `${height}px`;
    
    // 更新坐標輸入
    updateCoordinateInputs(activeBox);
  }
  
  // 停止繪製
  function stopDrawing() {
    if (!isDrawing) return;
    
    isDrawing = false;
    
    // 如果框太小，刪除它
    if (parseInt(activeBox.style.width) < 20 || parseInt(activeBox.style.height) < 20) {
      activeBox.remove();
      activeBox = null;
    } else {
      // 否則添加拖拽和調整大小功能
      makeBoxDraggable(activeBox);
      makeBoxResizable(activeBox);
      
      // 高亮當前框
      document.querySelectorAll('.annotation-box').forEach(b => {
        b.style.borderColor = '';
      });
      activeBox.style.borderColor = '#ef4444';
      
      // 更新標籤表單
      updateLabelForm(activeLabel);
    }
    
    document.removeEventListener('mousemove', drawBox);
    document.removeEventListener('mouseup', stopDrawing);
  }
}

/**
 * 更新坐標輸入
 * @param {HTMLElement} box - 標註框元素
 */
function updateCoordinateInputs(box) {
  const posXInput = document.getElementById('pos-x-input');
  const posYInput = document.getElementById('pos-y-input');
  const sizeWInput = document.getElementById('size-w-input');
  const sizeHInput = document.getElementById('size-h-input');
  
  if (box) {
    posXInput.value = parseInt(box.style.left) || 0;
    posYInput.value = parseInt(box.style.top) || 0;
    sizeWInput.value = parseInt(box.style.width) || box.offsetWidth;
    sizeHInput.value = parseInt(box.style.height) || box.offsetHeight;
  } else {
    posXInput.value = '';
    posYInput.value = '';
    sizeWInput.value = '';
    sizeHInput.value = '';
  }
}

/**
 * 設置坐標輸入更新事件
 */
function setupCoordinateInputs() {
  const posXInput = document.getElementById('pos-x-input');
  const posYInput = document.getElementById('pos-y-input');
  const sizeWInput = document.getElementById('size-w-input');
  const sizeHInput = document.getElementById('size-h-input');
  
  [posXInput, posYInput, sizeWInput, sizeHInput].forEach(input => {
    input.addEventListener('change', function() {
      if (!activeBox) return;
      
      activeBox.style.left = `${posXInput.value}px`;
      activeBox.style.top = `${posYInput.value}px`;
      activeBox.style.width = `${sizeWInput.value}px`;
      activeBox.style.height = `${sizeHInput.value}px`;
    });
  });
}

/**
 * 更新標籤表單
 * @param {string} labelName - 標籤名稱
 */
function updateLabelForm(labelName) {
  // 找到對應的標籤項目
  const labelItems = document.querySelectorAll('.label-item');
  labelItems.forEach(item => {
    if (item.querySelector('.label-name').textContent === labelName) {
      // 移除所有項目的active類
      labelItems.forEach(li => li.classList.remove('active'));
      
      // 添加當前項目的active類
      item.classList.add('active');
      
      // 更新表單
      document.getElementById('label-name-input').value = labelName;
      const labelColor = item.querySelector('.label-color').style.backgroundColor;
      document.getElementById('label-color-input').value = rgbToHex(labelColor);
      
      // 更新活動標籤
      activeLabel = labelName;
    }
  });
}

/**
 * 設置移動設備側邊欄切換
 */
function setupMobileSidebar() {
  const toggleBtn = document.getElementById('toggle-project-sidebar');
  const projectSidebar = document.querySelector('.project-sidebar');
  
  if (toggleBtn && projectSidebar) {
    toggleBtn.addEventListener('click', () => {
      projectSidebar.classList.toggle('show');
    });
  }
}

/**
 * 設置彈窗功能
 */
function setupModals() {
  // 設置關閉按鈕
  document.querySelectorAll('.close-modal-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      const modal = this.closest('.modal');
      modal.classList.remove('active');
    });
  });
  
  // 點擊模態對話框外部關閉
  document.querySelectorAll('.modal').forEach(modal => {
    modal.addEventListener('click', function(e) {
      if (e.target === this) {
        this.classList.remove('active');
      }
    });
  });
  
  // 信心閾值滑動條
  const confidenceSlider = document.getElementById('ai-confidence');
  if (confidenceSlider) {
    const confidenceValue = document.getElementById('confidence-value');
    confidenceSlider.addEventListener('input', function() {
      confidenceValue.textContent = `${this.value}%`;
    });
  }
  
  // 取消AI標註按鈕
  document.getElementById('cancel-ai-label-btn').addEventListener('click', function() {
    document.getElementById('ai-label-modal').classList.remove('active');
  });
  
  // 確認AI標註按鈕
  document.getElementById('confirm-ai-label-btn').addEventListener('click', function() {
    document.getElementById('ai-label-modal').classList.remove('active');
    
    // 顯示加載中訊息
    if (typeof showComingSoonMessage === 'function') {
      showComingSoonMessage();
    } else {
      alert("AI標註功能開發中，敬請期待！");
    }
  });
  
  // 取消添加標籤按鈕
  document.getElementById('cancel-add-label-btn').addEventListener('click', function() {
    document.getElementById('add-label-modal').classList.remove('active');
  });
}

/**
 * 設置圖片選擇事件
 */
function setupImageSelection() {
  const imageItems = document.querySelectorAll('.image-item');
  
  imageItems.forEach(item => {
    item.addEventListener('click', function() {
      // 移除所有項目的active類
      imageItems.forEach(i => i.classList.remove('active'));
      
      // 添加當前項目的active類
      this.classList.add('active');
      
      // 更新主圖片
      const imageSrc = this.querySelector('img').src;
      document.getElementById('editor-image').src = imageSrc;
      
      // 重置編輯器狀態
      resetEditor();
    });
  });
}

/**
 * 重置編輯器狀態
 */
function resetEditor() {
  // 清除所有標註框
  const canvasContainer = document.querySelector('.canvas-container');
  const annotationBoxes = canvasContainer.querySelectorAll('.annotation-box');
  
  annotationBoxes.forEach(box => {
    if (!box.classList.contains('original-box')) {
      box.remove();
    }
  });
  
  // 重置活動框
  activeBox = null;
  
  // 重置坐標輸入
  updateCoordinateInputs(null);
}

/**
 * 設置標籤添加和確認事件
 */
function setupLabelAddition() {
  // 添加標籤按鈕
  document.getElementById('add-label-btn').addEventListener('click', function() {
    document.getElementById('add-label-modal').classList.add('active');
  });
  
  // 確認添加標籤按鈕
  document.getElementById('confirm-add-label-btn').addEventListener('click', function() {
    const newLabelName = document.getElementById('new-label-name').value.trim();
    const newLabelColor = document.getElementById('new-label-color').value;
    
    if (newLabelName === '') {
      alert('請輸入標籤名稱！');
      return;
    }
    
    // 檢查是否已存在
    const labelItems = document.querySelectorAll('.label-item');
    let isExist = false;
    
    labelItems.forEach(item => {
      if (item.querySelector('.label-name').textContent === newLabelName) {
        isExist = true;
      }
    });
    
    if (isExist) {
      alert('標籤名稱已存在！');
      return;
    }
    
    // 創建新標籤項目
    const labelList = document.querySelector('.label-list');
    const newLabelItem = document.createElement('div');
    newLabelItem.className = 'label-item';
    newLabelItem.innerHTML = `
      <div class="label-color" style="background-color: ${newLabelColor};"></div>
      <div class="label-name">${newLabelName}</div>
      <div class="label-count">0</div>
    `;
    
    labelList.appendChild(newLabelItem);
    
    // 綁定點擊事件
    newLabelItem.addEventListener('click', function() {
      // 移除所有項目的active類
      document.querySelectorAll('.label-item').forEach(li => li.classList.remove('active'));
      
      // 添加當前項目的active類
      this.classList.add('active');
      
      // 更新活動標籤
      activeLabel = this.querySelector('.label-name').textContent;
      
      // 更新表單
      document.getElementById('label-name-input').value = activeLabel;
      const labelColor = this.querySelector('.label-color').style.backgroundColor;
      document.getElementById('label-color-input').value = rgbToHex(labelColor);
      
      // 如果有活動的標註框，更新其標籤
      if (activeBox) {
        activeBox.querySelector('.annotation-label').textContent = activeLabel;
      }
    });
    
    // 清空輸入並關閉彈窗
    document.getElementById('new-label-name').value = '';
    document.getElementById('add-label-modal').classList.remove('active');
  });
}

/**
 * 設置圖片過濾器事件
 */
function setupImageFilter() {
  const filterSelect = document.getElementById('image-filter-select');
  
  filterSelect.addEventListener('change', function() {
    const filter = this.value;
    const imageItems = document.querySelectorAll('.image-item');
    
    imageItems.forEach(item => {
      const isLabeled = item.querySelector('.status-badge').classList.contains('labeled');
      
      if (filter === 'all') {
        item.style.display = '';
      } else if (filter === 'labeled' && isLabeled) {
        item.style.display = '';
      } else if (filter === 'unlabeled' && !isLabeled) {
        item.style.display = '';
      } else {
        item.style.display = 'none';
      }
    });
  });
}

/**
 * 顯示AI標註彈窗
 */
function showAILabelModal() {
  document.getElementById('ai-label-modal').classList.add('active');
}

/**
 * 顯示視覺化
 */
function showVisualization() {
  if (typeof showComingSoonMessage === 'function') {
    showComingSoonMessage();
  } else {
    alert("視覺化功能開發中，敬請期待！");
  }
}

/**
 * 保存標註
 */
function saveLabels() {
  // 收集所有標註框的資料
  const annotationBoxes = document.querySelectorAll('.annotation-box');
  const annotations = [];
  
  annotationBoxes.forEach(box => {
    annotations.push({
      label: box.querySelector('.annotation-label').textContent,
      x: parseInt(box.style.left) || 0,
      y: parseInt(box.style.top) || 0,
      width: parseInt(box.style.width) || box.offsetWidth,
      height: parseInt(box.style.height) || box.offsetHeight
    });
  });
  
  console.log('保存標註：', annotations);
  
  // 顯示成功訊息
  alert('標註已保存！');
}

/**
 * 將RGB顏色轉換為十六進制顏色
 * @param {string} rgb - RGB顏色字符串
 * @returns {string} 十六進制顏色字符串
 */
function rgbToHex(rgb) {
  // 默認顏色
  if (!rgb) return '#3b82f6';
  
  // 檢查是否已經是十六進制格式
  if (rgb.startsWith('#')) return rgb;
  
  // 解析RGB值
  const match = rgb.match(/^rgb\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)$/i);
  if (!match) return '#3b82f6';
  
  const r = parseInt(match[1], 10).toString(16).padStart(2, '0');
  const g = parseInt(match[2], 10).toString(16).padStart(2, '0');
  const b = parseInt(match[3], 10).toString(16).padStart(2, '0');
  
  return `#${r}${g}${b}`;
}