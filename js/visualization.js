// visualization.js - 視覺化功能

/**
 * EasyYOLO - 視覺化機器學習教學平台 
 * 視覺化功能模組
 */

// 全局變量
let currentVizType = 'feature-maps';
let currentLayer = '卷積層 1 - 卷積 (3x3)';
let currentFeature = 1;
let zoomLevel = 100;
let channelCount = 16;
let currentPage = 1;
let totalPages = 4;
let selectedImage = './icon/sample1.jpg';

document.addEventListener('DOMContentLoaded', function() {
  // 檢查登入狀態
  if (typeof checkLoginStatus === 'function') {
    checkLoginStatus();
  }
  
  // 初始化視覺化
  initVisualization();
  
  // 設置移動設備側邊欄切換
  setupMobileSidebar();
  
  // 設置彈窗功能
  setupVisModalFunctions();
});

/**
 * 初始化視覺化功能
 */
function initVisualization() {
  // 設置視覺化類型選擇器
  setupVizTypeSelector();
  
  // 設置層級選擇功能
  setupLayerSelection();
  
  // 設置運行視覺化按鈕
  const runBtn = document.getElementById('run-viz-btn');
  if (runBtn) {
    runBtn.addEventListener('click', runVisualization);
  }
  
  // 設置特徵圖點擊事件
  setupFeatureMapClick();
  
  // 設置分頁控制
  setupPagination();
  
  // 設置縮放和通道數設定
  setupSettingsControls();
  
  // 設置顏色映射選擇
  setupColormapSelector();
  
  // 設置更換圖像按鈕
  const changeImgBtn = document.getElementById('change-image-btn');
  if (changeImgBtn) {
    changeImgBtn.addEventListener('click', function() {
      const modal = document.getElementById('image-select-modal');
      if (modal) modal.classList.add('active');
    });
  }
}

/**
 * 設置視覺化類型選擇器
 */
function setupVizTypeSelector() {
  const vizTypeSelector = document.getElementById('viz-type-selector');
  if (!vizTypeSelector) return;
  
  vizTypeSelector.addEventListener('change', function() {
    currentVizType = this.value;
    
    // 更新視覺化顯示
    updateVisualization();
  });
}

/**
 * 設置層級選擇功能
 */
function setupLayerSelection() {
  const layerItems = document.querySelectorAll('.layer-item');
  
  layerItems.forEach(item => {
    const header = item.querySelector('.layer-header');
    const caretIcon = header?.querySelector('i');
    
    // 展開/折疊層級
    if (caretIcon) {
      header.addEventListener('click', function(e) {
        e.stopPropagation();
        item.classList.toggle('expanded');
        
        if (item.classList.contains('expanded')) {
          caretIcon.classList.remove('fa-caret-right');
          caretIcon.classList.add('fa-caret-down');
        } else {
          caretIcon.classList.remove('fa-caret-down');
          caretIcon.classList.add('fa-caret-right');
        }
      });
    } else {
      // 選擇層級
      header.addEventListener('click', function() {
        // 移除所有層級的active類
        document.querySelectorAll('.layer-item').forEach(li => {
          if (!li.contains(item)) {
            li.classList.remove('active');
          }
        });
        
        // 添加當前層級的active類
        item.classList.add('active');
        
        // 獲取層級名稱
        const layerName = item.querySelector('.layer-name').textContent;
        // 獲取父層級名稱
        const parentItem = item.closest('.layer-children')?.closest('.layer-item');
        const parentName = parentItem ? parentItem.querySelector('.layer-name').textContent : '';
        
        // 更新當前層級
        if (parentName) {
          currentLayer = `${parentName} - ${layerName}`;
        } else {
          currentLayer = layerName;
        }
        
        // 更新視覺化顯示
        updateVisualization();
      });
    }
  });
}

/**
 * 設置特徵圖點擊事件
 */
function setupFeatureMapClick() {
  const featureMaps = document.querySelectorAll('.feature-map');
  
  featureMaps.forEach((map, index) => {
    map.addEventListener('click', function() {
      // 更新當前特徵
      currentFeature = index + 1;
      
      // 更新詳情面板
      updateFeatureDetails();
    });
  });
}

/**
 * 更新特徵詳情
 */
function updateFeatureDetails() {
  // 更新詳情標題
  const detailHeader = document.querySelector('.feature-detail-header h4');
  const detailSubtitle = document.querySelector('.detail-subtitle');
  
  if (detailHeader) detailHeader.textContent = `特徵 ${currentFeature}`;
  if (detailSubtitle) detailSubtitle.textContent = currentLayer;
  
  // 更新詳情圖片
  const detailImage = document.querySelector('.detail-image');
  const featureMapImage = document.querySelector(`.feature-map:nth-child(${currentFeature}) img`);
  
  if (detailImage && featureMapImage) {
    detailImage.src = featureMapImage.src;
  }
  
  // 更新統計數據（模擬數據）
  const statValues = document.querySelectorAll('.stat-value');
  if (statValues.length >= 4) {
    // 模擬不同特徵的不同統計值
    const seed = currentFeature * 0.1;
    statValues[0].textContent = (-0.2 - seed).toFixed(4);
    statValues[1].textContent = (0.8 + seed).toFixed(4);
    statValues[2].textContent = (0.3 + seed * 0.5).toFixed(4);
    statValues[3].textContent = (0.1 + seed * 0.2).toFixed(4);
  }
}

/**
 * 設置分頁控制
 */
function setupPagination() {
  const prevPageBtn = document.getElementById('prev-page-btn');
  const nextPageBtn = document.getElementById('next-page-btn');
  const pageIndicator = document.querySelector('.page-indicator');
  
  if (!prevPageBtn || !nextPageBtn || !pageIndicator) return;
  
  prevPageBtn.addEventListener('click', function() {
    if (currentPage > 1) {
      currentPage--;
      updatePagination();
    }
  });
  
  nextPageBtn.addEventListener('click', function() {
    if (currentPage < totalPages) {
      currentPage++;
      updatePagination();
    }
  });
  
  function updatePagination() {
    pageIndicator.textContent = `第 ${currentPage} 頁，共 ${totalPages} 頁`;
    
    // 更新按鈕狀態
    prevPageBtn.disabled = currentPage === 1;
    nextPageBtn.disabled = currentPage === totalPages;
    
    // 更新視覺化顯示
    updateVisualization();
  }
  
  // 初始化分頁
  updatePagination();
}

/**
 * 設置縮放和通道數設定
 */
function setupSettingsControls() {
  const zoomSlider = document.getElementById('viz-zoom');
  const zoomValue = document.getElementById('zoom-value');
  const channelsSlider = document.getElementById('viz-channels');
  const channelsValue = document.getElementById('channels-value');
  
  if (zoomSlider && zoomValue) {
    zoomSlider.addEventListener('input', function() {
      zoomLevel = this.value;
      zoomValue.textContent = `${zoomLevel}%`;
      
      // 應用縮放效果
      document.querySelectorAll('.feature-map img').forEach(img => {
        img.style.transform = `scale(${zoomLevel / 100})`;
      });
      
      const detailImage = document.querySelector('.detail-image');
      if (detailImage) {
        detailImage.style.transform = `scale(${zoomLevel / 100})`;
      }
    });
  }
  
  if (channelsSlider && channelsValue) {
    channelsSlider.addEventListener('input', function() {
      channelCount = this.value;
      channelsValue.textContent = channelCount;
      
      // 更新特徵圖顯示數量
      updateVisualization();
    });
  }
  
  // 設置標準化和網格複選框
  const normalizeCheckbox = document.getElementById('normalize-checkbox');
  const gridCheckbox = document.getElementById('grid-checkbox');
  
  if (normalizeCheckbox) {
    normalizeCheckbox.addEventListener('change', function() {
      // 更新視覺化顯示
      updateVisualization();
    });
  }
  
  if (gridCheckbox) {
    gridCheckbox.addEventListener('change', function() {
      const featureMapGrid = document.querySelector('.feature-map-grid');
      if (featureMapGrid) {
        if (this.checked) {
          featureMapGrid.style.gap = '15px';
        } else {
          featureMapGrid.style.gap = '0';
        }
      }
    });
  }
}

/**
 * 設置顏色映射選擇
 */
function setupColormapSelector() {
  const colormapSelector = document.getElementById('viz-colormap');
  if (!colormapSelector) return;
  
  colormapSelector.addEventListener('change', function() {
    // 更新視覺化顯示
    updateVisualization();
  });
}

/**
 * 運行視覺化
 */
function runVisualization() {
  // 顯示加載中
  const vizDisplayArea = document.querySelector('.viz-display-area');
  if (!vizDisplayArea) return;
  
  vizDisplayArea.innerHTML = '<div class="loading-indicator"><i class="fas fa-spinner fa-spin"></i><p>正在處理視覺化...</p></div>';
  
  // 模擬加載延遲
  setTimeout(() => {
    // 更新視覺化顯示
    updateVisualization();
    
    // 更新信息欄
    updateInfoBar();
  }, 1500);
}

/**
 * 更新視覺化顯示
 */
function updateVisualization() {
  // 獲取視覺化顯示區域
  const vizDisplayArea = document.querySelector('.viz-display-area');
  if (!vizDisplayArea) return;
  
  // 根據視覺化類型顯示不同的內容
  if (currentVizType === 'feature-maps') {
    // 計算每頁顯示的特徵數量
    const featuresPerPage = parseInt(channelCount);
    const startIndex = (currentPage - 1) * featuresPerPage + 1;
    const endIndex = Math.min(startIndex + featuresPerPage - 1, 64); // 假設最多64個特徵
    
    // 創建特徵圖網格
    let gridHTML = '<div class="feature-map-grid">';
    
    for (let i = startIndex; i <= endIndex; i++) {
      gridHTML += `
        <div class="feature-map" data-feature="${i}">
          <div class="feature-map-info">特徵 ${i}</div>
          <img src="./icon/feature_map${((i - 1) % 9) + 1}.png" alt="特徵圖 ${i}">
        </div>
      `;
    }
    
    gridHTML += '</div>';
    
    // 更新顯示區域
    vizDisplayArea.innerHTML = gridHTML;
    
    // 重新設置特徵圖點擊事件
    setupFeatureMapClick();
    
    // 應用縮放
    document.querySelectorAll('.feature-map img').forEach(img => {
      img.style.transform = `scale(${zoomLevel / 100})`;
    });
    
    // 更新總頁數
    totalPages = Math.ceil(64 / featuresPerPage);
    const pageIndicator = document.querySelector('.page-indicator');
    if (pageIndicator) {
      pageIndicator.textContent = `第 ${currentPage} 頁，共 ${totalPages} 頁`;
    }
    
  } else if (currentVizType === 'activation') {
    // 激活函數視覺化（簡單示例）
    vizDisplayArea.innerHTML = `
      <div class="activation-visualization">
        <img src="./icon/activation.png" alt="激活函數視覺化" style="width: 100%; max-width: 600px; margin: 0 auto; display: block;">
      </div>
    `;
  } else if (currentVizType === 'attention') {
    // 注意力機制視覺化（簡單示例）
    vizDisplayArea.innerHTML = `
      <div class="attention-visualization">
        <img src="./icon/attention.png" alt="注意力機制視覺化" style="width: 100%; max-width: 600px; margin: 0 auto; display: block;">
      </div>
    `;
  } else if (currentVizType === 'network-architecture') {
    // 網路架構視覺化（簡單示例）
    vizDisplayArea.innerHTML = `
      <div class="network-architecture-visualization">
        <img src="./icon/network.png" alt="網路架構視覺化" style="width: 100%; max-width: 800px; margin: 0 auto; display: block;">
      </div>
    `;
  }
  
  // 更新特徵詳情
  updateFeatureDetails();
}

/**
 * 更新信息欄
 */
function updateInfoBar() {
  const infoValues = document.querySelectorAll('.viz-info-item .info-value');
  if (infoValues.length < 3) return;
  
  infoValues[0].textContent = currentLayer;
  
  // 根據層級設置特徵數量和圖像尺寸
  if (currentLayer.includes('卷積層 1')) {
    infoValues[1].textContent = '64';
    infoValues[2].textContent = '112 × 112 px';
  } else if (currentLayer.includes('卷積層 2')) {
    infoValues[1].textContent = '128';
    infoValues[2].textContent = '56 × 56 px';
  } else if (currentLayer.includes('全連接層')) {
    infoValues[1].textContent = '1024';
    infoValues[2].textContent = '1 × 1024';
  } else if (currentLayer.includes('輸出層')) {
    infoValues[1].textContent = '10';
    infoValues[2].textContent = '1 × 10';
  } else {
    infoValues[1].textContent = '3';
    infoValues[2].textContent = '224 × 224 px';
  }
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
 * 設置視覺化彈窗功能
 */
function setupVisModalFunctions() {
  // 設置關閉按鈕
  document.querySelectorAll('.close-modal-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      const modal = this.closest('.modal');
      if (modal) modal.classList.remove('active');
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
  
  // 設置圖像選擇
  const imageItems = document.querySelectorAll('.image-select-item');
  
  imageItems.forEach(item => {
    item.addEventListener('click', function() {
      // 移除所有項目的active類
      imageItems.forEach(i => i.classList.remove('active'));
      
      // 添加當前項目的active類
      this.classList.add('active');
      
      // 選擇的圖像
      const imgEl = this.querySelector('img');
      if (imgEl) {
        selectedImage = imgEl.src;
      }
    });
  });
  
  // 設置確認圖像選擇按鈕
  const confirmBtn = document.getElementById('confirm-image-select-btn');
  if (confirmBtn) {
    confirmBtn.addEventListener('click', function() {
      // 更新輸入圖像
      const inputImage = document.getElementById('input-image');
      if (inputImage) inputImage.src = selectedImage;
      
      // 關閉彈窗
      const modal = document.getElementById('image-select-modal');
      if (modal) modal.classList.remove('active');
      
      // 更新視覺化
      runVisualization();
    });
  }
  
  // 設置取消圖像選擇按鈕
  const cancelBtn = document.getElementById('cancel-image-select-btn');
  if (cancelBtn) {
    cancelBtn.addEventListener('click', function() {
      // 關閉彈窗
      const modal = document.getElementById('image-select-modal');
      if (modal) modal.classList.remove('active');
    });
  }
}