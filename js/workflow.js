// js/workflow.js - AI訓練工作流功能模組

/**
 * AI訓練工作流頁面功能處理
 */

// 訓練類型配置
const TRAINING_TYPES = {
  'object-detection': {
    name: '物件偵測',
    description: '訓練AI識別和定位圖像中的多個物體',
    minImages: 20,
    estimatedTime: 15,
    difficulty: 'intermediate',
    frameworks: ['YOLO v8', 'YOLO v9'],
    features: ['實時偵測', '邊界框', '多物體'],
    nextPage: 'train-object-detection.html'
  },
  'image-classification': {
    name: '影像分類',
    description: '訓練AI將圖像分類到不同類別',
    minImages: 10,
    estimatedTime: 8,
    difficulty: 'beginner',
    frameworks: ['ResNet', 'EfficientNet'],
    features: ['多類別', '高準確率', '輕量模型'],
    nextPage: 'train-classification.html'
  },
  'segmentation': {
    name: '語義分割',
    description: '像素級物體分割，精確識別每個像素所屬的物體類別',
    minImages: 30,
    estimatedTime: 25,
    difficulty: 'advanced',
    frameworks: ['U-Net', 'DeepLab'],
    features: ['像素精度', '醫療應用', '精確分割'],
    nextPage: 'train-segmentation.html'
  },
  'anomaly-detection': {
    name: '異常偵測',
    description: '只需正常樣本即可訓練，自動偵測異常情況',
    minImages: 50,
    estimatedTime: 20,
    difficulty: 'advanced',
    frameworks: ['AutoEncoder', '一類SVM'],
    features: ['無監督', '品質檢測', '工業應用'],
    nextPage: 'train-anomaly.html'
  }
};

// 模擬的最近項目數據
const RECENT_PROJECTS = [
  {
    id: 'parts-detection',
    name: '零件品檢模型',
    type: 'object-detection',
    status: 'training',
    progress: 85,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000) // 2小時前
  },
  {
    id: 'fruit-classifier',
    name: '水果分類器',
    type: 'image-classification',
    status: 'completed',
    progress: 100,
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000) // 1天前
  },
  {
    id: 'medical-seg',
    name: '醫療影像分割',
    type: 'segmentation',
    status: 'error',
    progress: 0,
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) // 3天前
  }
];

// 初始化
document.addEventListener('DOMContentLoaded', function() {
  initWorkflowPage();
  setupSearchFunctionality();
  setupTrainingCards();
  updateRecentProjects();
});

/**
 * 初始化工作流頁面
 */
function initWorkflowPage() {
  console.log('AI訓練工作流頁面已載入');
  
  // 設置搜索功能
  setupSearchFunctionality();
  
  // 添加卡片動畫效果
  setupCardAnimations();
  
  // 設置鍵盤快捷鍵
  setupKeyboardShortcuts();
  
  // 檢查是否有進行中的訓練
  checkActiveTraining();
}

/**
 * 設置搜索功能
 */
function setupSearchFunctionality() {
  const searchBar = document.querySelector('.search-bar');
  if (!searchBar) return;
  
  const searchHandler = Utils?.debounce ? 
    Utils.debounce(performSearch, 300) : 
    performSearch;
  
  searchBar.addEventListener('input', searchHandler);
  searchBar.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      searchBar.value = '';
      performSearch();
    }
  });
}

/**
 * 執行搜索
 */
function performSearch() {
  const searchTerm = document.querySelector('.search-bar')?.value?.toLowerCase() || '';
  const trainingCards = document.querySelectorAll('.training-card');
  
  let visibleCount = 0;
  
  trainingCards.forEach(card => {
    const title = card.querySelector('h3')?.textContent?.toLowerCase() || '';
    const description = card.querySelector('.training-description p')?.textContent?.toLowerCase() || '';
    const features = Array.from(card.querySelectorAll('.feature-tag'))
      .map(el => el.textContent.toLowerCase()).join(' ');
    
    const isMatch = !searchTerm || 
                   title.includes(searchTerm) || 
                   description.includes(searchTerm) || 
                   features.includes(searchTerm);
    
    card.style.display = isMatch ? '' : 'none';
    
    if (isMatch) {
      visibleCount++;
      // 添加搜索高亮
      if (searchTerm) {
        highlightSearchTerm(card, searchTerm);
      } else {
        removeHighlight(card);
      }
    }
  });
  
  // 顯示搜索結果統計
  updateSearchResults(searchTerm, visibleCount, trainingCards.length);
}

/**
 * 高亮搜索詞
 */
function highlightSearchTerm(card, term) {
  if (!term) return;
  
  const textElements = card.querySelectorAll('h3, .training-description p, .feature-tag');
  textElements.forEach(el => {
    const text = el.textContent;
    const regex = new RegExp(`(${escapeRegExp(term)})`, 'gi');
    const highlightedText = text.replace(regex, '<mark style="background: #fef08a; padding: 1px 2px; border-radius: 2px;">$1</mark>');
    
    if (highlightedText !== text) {
      el.innerHTML = highlightedText;
    }
  });
}

/**
 * 移除高亮
 */
function removeHighlight(card) {
  const highlightedElements = card.querySelectorAll('mark');
  highlightedElements.forEach(el => {
    el.outerHTML = el.textContent;
  });
}

/**
 * 轉義正則表達式特殊字符
 */
function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * 更新搜索結果
 */
function updateSearchResults(searchTerm, visibleCount, totalCount) {
  console.log(`搜索 "${searchTerm}": ${visibleCount}/${totalCount} 個結果`);
  
  // 可以在這裡添加搜索結果統計的UI顯示
  if (searchTerm && visibleCount === 0) {
    showNoResultsMessage();
  } else {
    hideNoResultsMessage();
  }
}

/**
 * 顯示無搜索結果訊息
 */
function showNoResultsMessage() {
  let noResultsDiv = document.querySelector('.no-results-message');
  if (!noResultsDiv) {
    noResultsDiv = document.createElement('div');
    noResultsDiv.className = 'no-results-message';
    noResultsDiv.innerHTML = `
      <div style="text-align: center; padding: 40px; color: var(--text-medium);">
        <i class="fas fa-search" style="font-size: 3em; margin-bottom: 16px; opacity: 0.5;"></i>
        <h3>找不到匹配的訓練模板</h3>
        <p>試試其他關鍵字，或者<a href="#" onclick="clearSearch()">清空搜索</a></p>
      </div>
    `;
    document.querySelector('.workflow-grid').appendChild(noResultsDiv);
  }
  noResultsDiv.style.display = 'block';
}

/**
 * 隱藏無搜索結果訊息
 */
function hideNoResultsMessage() {
  const noResultsDiv = document.querySelector('.no-results-message');
  if (noResultsDiv) {
    noResultsDiv.style.display = 'none';
  }
}

/**
 * 清空搜索
 */
function clearSearch() {
  const searchBar = document.querySelector('.search-bar');
  if (searchBar) {
    searchBar.value = '';
    performSearch();
    searchBar.focus();
  }
}

/**
 * 設置訓練卡片功能
 */
function setupTrainingCards() {
  const trainingCards = document.querySelectorAll('.training-card:not(.show-coming-soon)');
  
  trainingCards.forEach(card => {
    // 添加懸停效果
    card.addEventListener('mouseenter', () => {
      if (!card.classList.contains('show-coming-soon')) {
        card.style.transform = 'translateY(-6px)';
        card.style.boxShadow = '0 12px 30px rgba(0,0,0,0.15)';
      }
    });
    
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
      card.style.boxShadow = '';
    });
  });
}

/**
 * 設置卡片動畫
 */
function setupCardAnimations() {
  const cards = document.querySelectorAll('.workflow-card');
  
  // 使用 Intersection Observer 實現滾動動畫
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    });
    
    cards.forEach((card, index) => {
      card.style.opacity = '0';
      card.style.transform = 'translateY(30px)';
      card.style.transition = `all 0.6s ease ${index * 0.1}s`;
      observer.observe(card);
    });
  }
}

/**
 * 設置鍵盤快捷鍵
 */
function setupKeyboardShortcuts() {
  document.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + K 聚焦搜索框
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault();
      const searchBar = document.querySelector('.search-bar');
      if (searchBar) {
        searchBar.focus();
        searchBar.select();
      }
    }
    
    // Ctrl/Cmd + N 新增訓練專案
    if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
      e.preventDefault();
      createNewProject();
    }
    
    // 數字鍵 1-4 快速選擇訓練類型
    if (e.key >= '1' && e.key <= '4' && !e.ctrlKey && !e.altKey) {
      const trainingTypes = ['object-detection', 'image-classification', 'segmentation', 'anomaly-detection'];
      const selectedType = trainingTypes[parseInt(e.key) - 1];
      if (selectedType) {
        startTraining(selectedType);
      }
    }
    
    // Escape 清空搜索
    if (e.key === 'Escape') {
      clearSearch();
    }
  });
}

/**
 * 開始訓練
 * @param {string} trainingType - 訓練類型
 */
function startTraining(trainingType) {
  if (!trainingType || !TRAINING_TYPES[trainingType]) {
    console.error('無效的訓練類型:', trainingType);
    showComingSoonMessage();
    return;
  }
  
  const config = TRAINING_TYPES[trainingType];
  
  // 顯示訓練確認對話框
  showTrainingConfirmDialog(trainingType, config);
}

/**
 * 顯示訓練確認對話框
 */
function showTrainingConfirmDialog(trainingType, config) {
  const dialog = document.createElement('div');
  dialog.className = 'training-confirm-dialog';
  dialog.innerHTML = `
    <div class="dialog-overlay"></div>
    <div class="dialog-content">
      <div class="dialog-header">
        <h3><i class="fas fa-brain"></i> 開始 ${config.name} 訓練</h3>
        <button class="dialog-close" onclick="closeTrainingDialog()">&times;</button>
      </div>
      <div class="dialog-body">
        <div class="training-info">
          <div class="info-item">
            <i class="fas fa-images"></i>
            <span>最少需要 ${config.minImages} 張圖片</span>
          </div>
          <div class="info-item">
            <i class="fas fa-clock"></i>
            <span>預計訓練時間 ${config.estimatedTime} 分鐘</span>
          </div>
          <div class="info-item">
            <i class="fas fa-layer-group"></i>
            <span>使用框架: ${config.frameworks.join(', ')}</span>
          </div>
        </div>
        <div class="training-features-preview">
          <p>功能特色:</p>
          <div class="features-list">
            ${config.features.map(feature => 
              `<span class="feature-preview-tag">${feature}</span>`
            ).join('')}
          </div>
        </div>
      </div>
      <div class="dialog-footer">
        <button class="btn btn-outline" onclick="closeTrainingDialog()">取消</button>
        <button class="btn btn-primary" onclick="confirmStartTraining('${trainingType}')">
          <i class="fas fa-play"></i> 開始訓練
        </button>
      </div>
    </div>
  `;
  
  document.body.appendChild(dialog);
  
  // 添加樣式
  const style = document.createElement('style');
  style.textContent = `
    .training-confirm-dialog {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      z-index: 1000;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .dialog-overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      backdrop-filter: blur(4px);
    }
    .dialog-content {
      background: white;
      border-radius: 12px;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
      max-width: 500px;
      width: 90%;
      max-height: 80vh;
      overflow-y: auto;
      position: relative;
      animation: dialogSlideIn 0.3s ease-out;
    }
    @keyframes dialogSlideIn {
      from { opacity: 0; transform: translateY(-20px) scale(0.95); }
      to { opacity: 1; transform: translateY(0) scale(1); }
    }
    .dialog-header {
      padding: 20px 20px 0;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .dialog-header h3 {
      margin: 0;
      color: var(--text-dark);
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .dialog-close {
      background: none;
      border: none;
      font-size: 24px;
      color: var(--text-light);
      cursor: pointer;
      padding: 4px;
      line-height: 1;
    }
    .dialog-close:hover {
      color: var(--text-dark);
    }
    .dialog-body {
      padding: 20px;
    }
    .training-info {
      margin-bottom: 20px;
    }
    .info-item {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 12px;
      padding: 8px;
      background: #f8fafc;
      border-radius: 6px;
    }
    .info-item i {
      color: var(--primary);
      width: 16px;
    }
    .training-features-preview p {
      margin-bottom: 8px;
      font-weight: 500;
      color: var(--text-dark);
    }
    .features-list {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
    }
    .feature-preview-tag {
      background: var(--primary-light);
      color: var(--primary-dark);
      font-size: 0.8em;
      padding: 4px 8px;
      border-radius: 12px;
      font-weight: 500;
    }
    .dialog-footer {
      padding: 0 20px 20px;
      display: flex;
      gap: 12px;
      justify-content: flex-end;
    }
  `;
  document.head.appendChild(style);
  
  // 點擊背景關閉
  dialog.querySelector('.dialog-overlay').addEventListener('click', closeTrainingDialog);
}

/**
 * 關閉訓練對話框
 */
function closeTrainingDialog() {
  const dialog = document.querySelector('.training-confirm-dialog');
  if (dialog) {
    dialog.remove();
  }
}

/**
 * 確認開始訓練
 */
function confirmStartTraining(trainingType) {  
  closeTrainingDialog();
  
  const config = TRAINING_TYPES[trainingType];
  
  // 僅物件偵測實際跳轉，其他顯示開發中
  if (trainingType === 'object-detection') {
    // 儲存訓練配置
    localStorage.setItem('selectedTrainingType', trainingType);
    localStorage.setItem('trainingConfig', JSON.stringify(config));
    
    // 跳轉到訓練頁面
    window.location.href = config.nextPage || 'tutorial.html';
  } else {
    showComingSoonMessage();
  }
}

/**
 * 新增訓練專案
 */
function createNewProject() {
  // 顯示選擇訓練類型的快速選單
  showTrainingTypeMenu();
}

/**
 * 顯示訓練類型選單
 */
function showTrainingTypeMenu() {
  const menu = document.createElement('div');
  menu.className = 'training-type-menu';
  menu.innerHTML = `
    <div class="menu-overlay"></div>
    <div class="menu-content">
      <h3><i class="fas fa-plus-circle"></i> 選擇訓練類型</h3>
      <div class="training-type-list">
        ${Object.entries(TRAINING_TYPES).map(([type, config]) => `
          <div class="training-type-item ${type === 'object-detection' ? '' : 'disabled'}" 
               onclick="${type === 'object-detection' ? `selectTrainingType('${type}')` : 'showComingSoonMessage()'}">
            <div class="type-icon">
              <i class="fas fa-${getTrainingIcon(type)}"></i>
            </div>
            <div class="type-info">
              <div class="type-name">${config.name}</div>
              <div class="type-desc">${config.description}</div>
            </div>
            <div class="type-badge">${type === 'object-detection' ? '可用' : '開發中'}</div>
          </div>
        `).join('')}
      </div>
      <div class="menu-footer">
        <button class="btn btn-outline" onclick="closeTrainingTypeMenu()">取消</button>
      </div>
    </div>
  `;
  
  document.body.appendChild(menu);
  
  // 添加樣式
  const style = document.createElement('style');
  style.textContent = `
    .training-type-menu {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      z-index: 1000;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .menu-overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      backdrop-filter: blur(4px);
    }
    .menu-content {
      background: white;
      border-radius: 12px;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
      max-width: 600px;
      width: 90%;
      max-height: 80vh;
      overflow-y: auto;
      position: relative;
      animation: dialogSlideIn 0.3s ease-out;
    }
    .menu-content h3 {
      padding: 20px;
      margin: 0;
      border-bottom: 1px solid #e5e7eb;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .training-type-list {
      padding: 20px;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    .training-type-item {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 16px;
      border: 2px solid #e5e7eb;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.3s ease;
    }
    .training-type-item:not(.disabled):hover {
      border-color: var(--primary);
      background: var(--primary-light);
    }
    .training-type-item.disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
    .type-icon {
      width: 48px;
      height: 48px;
      background: var(--primary);
      color: white;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.2em;
    }
    .type-info {
      flex: 1;
    }
    .type-name {
      font-weight: 600;
      color: var(--text-dark);
      margin-bottom: 4px;
    }
    .type-desc {
      font-size: 0.85em;
      color: var(--text-medium);
      line-height: 1.4;
    }
    .type-badge {
      background: var(--success);
      color: white;
      padding: 4px 8px;
      border-radius: 12px;
      font-size: 0.75em;
      font-weight: 500;
    }
    .training-type-item.disabled .type-badge {
      background: var(--text-light);
    }
    .menu-footer {
      padding: 0 20px 20px;
      text-align: center;
    }
  `;
  document.head.appendChild(style);
  
  // 點擊背景關閉
  menu.querySelector('.menu-overlay').addEventListener('click', closeTrainingTypeMenu);
}

/**
 * 獲取訓練類型圖標
 */
function getTrainingIcon(type) {
  const icons = {
    'object-detection': 'vector-square',
    'image-classification': 'layer-group',
    'segmentation': 'puzzle-piece',
    'anomaly-detection': 'exclamation-triangle'
  };
  return icons[type] || 'brain';
}

/**
 * 選擇訓練類型
 */
function selectTrainingType(type) {
  closeTrainingTypeMenu();
  startTraining(type);
}

/**
 * 關閉訓練類型選單
 */
function closeTrainingTypeMenu() {
  const menu = document.querySelector('.training-type-menu');
  if (menu) {
    menu.remove();
  }
}

/**
 * 顯示模型庫
 */
function showModelZoo() {
  showComingSoonMessage();
}

/**
 * 顯示教學
 */
function showTutorial() {
  window.location.href = 'tutorial.html';
}

/**
 * 開始快速體驗
 */
function startQuickDemo() {
  // 直接進入物件偵測訓練
  startTraining('object-detection');
}

/**
 * 更新最近項目
 */
function updateRecentProjects() {
  const recentList = document.querySelector('.recent-list');
  if (!recentList) return;
  
  // 從 localStorage 獲取真實項目或使用模擬數據
  const projects = getRecentProjects();
  
  recentList.innerHTML = projects.map(project => `
    <div class="recent-item">
      <div class="project-icon ${project.type}-icon">
        <i class="fas fa-${getTrainingIcon(project.type)}"></i>
      </div>
      <div class="project-info">
        <div class="project-name">${project.name}</div>
        <div class="project-status ${project.status}">
          ${getStatusIcon(project.status)} ${getStatusText(project.status, project.progress)}
        </div>
      </div>
      <div class="project-actions">
        ${getProjectActions(project)}
      </div>
    </div>
  `).join('');
}

/**
 * 獲取最近項目
 */
function getRecentProjects() {
  // 嘗試從 localStorage 獲取真實項目
  const savedProjects = localStorage.getItem('recentTrainingProjects');
  if (savedProjects) {
    try {
      return JSON.parse(savedProjects);
    } catch (e) {
      console.warn('無法解析保存的項目數據');
    }
  }
  
  // 返回模擬數據
  return RECENT_PROJECTS;
}

/**
 * 獲取狀態圖標
 */
function getStatusIcon(status) {
  const icons = {
    'training': '<i class="fas fa-spinner fa-spin"></i>',
    'completed': '<i class="fas fa-check-circle"></i>',
    'error': '<i class="fas fa-exclamation-circle"></i>',
    'paused': '<i class="fas fa-pause-circle"></i>'
  };
  return icons[status] || '<i class="fas fa-circle"></i>';
}

/**
 * 獲取狀態文字
 */
function getStatusText(status, progress = 0) {
  const texts = {
    'training': `訓練中 (${progress}%)`,
    'completed': '已完成',
    'error': '訓練失敗',
    'paused': '已暫停'
  };
  return texts[status] || '未知狀態';
}

/**
 * 獲取項目操作按鈕
 */
function getProjectActions(project) {
  switch (project.status) {
    case 'training':
      return `
        <button class="btn-icon" onclick="viewProject('${project.id}')" title="查看詳情">
          <i class="fas fa-eye"></i>
        </button>
        <button class="btn-icon" onclick="pauseTraining('${project.id}')" title="暫停訓練">
          <i class="fas fa-pause"></i>
        </button>
      `;
    case 'completed':
      return `
        <button class="btn-icon" onclick="viewProject('${project.id}')" title="查看詳情">
          <i class="fas fa-eye"></i>
        </button>
        <button class="btn-icon" onclick="deployModel('${project.id}')" title="部署模型">
          <i class="fas fa-rocket"></i>
        </button>
      `;
    case 'error':
      return `
        <button class="btn-icon" onclick="viewProject('${project.id}')" title="查看詳情">
          <i class="fas fa-eye"></i>
        </button>
        <button class="btn-icon" onclick="retryTraining('${project.id}')" title="重新訓練">
          <i class="fas fa-redo"></i>
        </button>
      `;
    default:
      return `
        <button class="btn-icon" onclick="viewProject('${project.id}')" title="查看詳情">
          <i class="fas fa-eye"></i>
        </button>
      `;
  }
}

/**
 * 查看項目詳情
 */
function viewProject(projectId) {
  console.log('查看項目:', projectId);
  showComingSoonMessage();
}

/**
 * 暫停訓練
 */
function pauseTraining(projectId) {
  console.log('暫停訓練:', projectId);
  showComingSoonMessage();
}

/**
 * 部署模型
 */
function deployModel(projectId) {
  console.log('部署模型:', projectId);
  showComingSoonMessage();
}

/**
 * 重新訓練
 */
function retryTraining(projectId) {
  console.log('重新訓練:', projectId);
  
  // 找到對應的項目
  const projects = getRecentProjects();
  const project = projects.find(p => p.id === projectId);
  
  if (project && project.type) {
    startTraining(project.type);
  } else {
    showComingSoonMessage();
  }
}

/**
 * 檢查活動訓練
 */
function checkActiveTraining() {
  const activeTraining = localStorage.getItem('activeTraining');
  if (activeTraining) {
    try {
      const training = JSON.parse(activeTraining);
      showActiveTrainingBanner(training);
    } catch (e) {
      console.warn('無法解析活動訓練數據');
      localStorage.removeItem('activeTraining');
    }
  }
}

/**
 * 顯示活動訓練橫幅
 */
function showActiveTrainingBanner(training) {
  const banner = document.createElement('div');
  banner.className = 'active-training-banner';
  banner.innerHTML = `
    <div class="banner-content">
      <div class="banner-icon">
        <i class="fas fa-brain fa-pulse"></i>
      </div>
      <div class="banner-info">
        <div class="banner-title">正在訓練: ${training.name}</div>
        <div class="banner-progress">
          <div class="progress-bar">
            <div class="progress-fill" style="width: ${training.progress}%"></div>
          </div>
          <span class="progress-text">${training.progress}%</span>
        </div>
      </div>
      <div class="banner-actions">
        <button class="btn btn-outline btn-sm" onclick="viewActiveTraining()">查看詳情</button>
        <button class="btn-icon banner-close" onclick="closeBanner()" title="關閉">
          <i class="fas fa-times"></i>
        </button>
      </div>
    </div>
  `;
  
  // 添加樣式
  const style = document.createElement('style');
  style.textContent = `
    .active-training-banner {
      position: fixed;
      top: 20px;
      right: 20px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border-radius: 12px;
      box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
      z-index: 100;
      min-width: 320px;
      animation: slideInRight 0.5s ease-out;
    }
    @keyframes slideInRight {
      from {
        opacity: 0;
        transform: translateX(100%);
      }
      to {
        opacity: 1;
        transform: translateX(0);
      }
    }
    .banner-content {
      padding: 16px;
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .banner-icon {
      font-size: 1.5em;
      opacity: 0.9;
    }
    .banner-info {
      flex: 1;
    }
    .banner-title {
      font-weight: 600;
      margin-bottom: 8px;
      font-size: 0.9em;
    }
    .banner-progress {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .progress-bar {
      flex: 1;
      height: 6px;
      background: rgba(255, 255, 255, 0.2);
      border-radius: 3px;
      overflow: hidden;
    }
    .progress-fill {
      height: 100%;
      background: rgba(255, 255, 255, 0.9);
      border-radius: 3px;
      transition: width 0.3s ease;
    }
    .progress-text {
      font-size: 0.8em;
      font-weight: 500;
    }
    .banner-actions {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .btn-sm {
      padding: 6px 10px;
      font-size: 0.8em;
    }
    .banner-close {
      background: rgba(255, 255, 255, 0.1);
      color: white;
      border: none;
      width: 24px;
      height: 24px;
      font-size: 0.8em;
    }
    .banner-close:hover {
      background: rgba(255, 255, 255, 0.2);
    }
    @media (max-width: 768px) {
      .active-training-banner {
        top: 10px;
        right: 10px;
        left: 10px;
        min-width: auto;
      }
    }
  `;
  
  if (!document.querySelector('.active-training-banner-style')) {
    style.className = 'active-training-banner-style';
    document.head.appendChild(style);
  }
  
  document.body.appendChild(banner);
  
  // 模擬進度更新
  if (training.progress < 100) {
    setTimeout(() => {
      updateTrainingProgress(training.id);
    }, 5000);
  }
}

/**
 * 查看活動訓練
 */
function viewActiveTraining() {
  showComingSoonMessage();
}

/**
 * 關閉橫幅
 */
function closeBanner() {
  const banner = document.querySelector('.active-training-banner');
  if (banner) {
    banner.style.animation = 'slideOutRight 0.3s ease-in forwards';
    setTimeout(() => banner.remove(), 300);
  }
}

/**
 * 更新訓練進度
 */
function updateTrainingProgress(trainingId) {
  const activeTraining = localStorage.getItem('activeTraining');
  if (activeTraining) {
    try {
      const training = JSON.parse(activeTraining);
      if (training.id === trainingId && training.progress < 100) {
        // 模擬進度增加
        training.progress = Math.min(100, training.progress + Math.random() * 10);
        localStorage.setItem('activeTraining', JSON.stringify(training));
        
        // 更新UI
        const progressFill = document.querySelector('.progress-fill');
        const progressText = document.querySelector('.progress-text');
        if (progressFill && progressText) {
          progressFill.style.width = `${training.progress}%`;
          progressText.textContent = `${Math.round(training.progress)}%`;
        }
        
        // 繼續更新直到完成
        if (training.progress < 100) {
          setTimeout(() => updateTrainingProgress(trainingId), 3000);
        } else {
          // 訓練完成
          setTimeout(() => {
            showTrainingCompleteNotification(training.name);
            localStorage.removeItem('activeTraining');
            closeBanner();
          }, 1000);
        }
      }
    } catch (e) {
      console.warn('更新訓練進度時出錯');
    }
  }
}

/**
 * 顯示訓練完成通知
 */
function showTrainingCompleteNotification(trainingName) {
  const notification = document.createElement('div');
  notification.className = 'training-complete-notification';
  notification.innerHTML = `
    <div class="notification-content">
      <div class="notification-icon">
        <i class="fas fa-check-circle"></i>
      </div>
      <div class="notification-text">
        <div class="notification-title">訓練完成！</div>
        <div class="notification-desc">${trainingName} 已成功完成訓練</div>
      </div>
      <button class="btn btn-primary btn-sm" onclick="viewCompletedModel()">查看結果</button>
    </div>
  `;
  
  const style = document.createElement('style');
  style.textContent = `
    .training-complete-notification {
      position: fixed;
      top: 20px;
      right: 20px;
      background: linear-gradient(135deg, #10b981, #059669);
      color: white;
      border-radius: 12px;
      box-shadow: 0 8px 25px rgba(16, 185, 129, 0.3);
      z-index: 101;
      animation: slideInRight 0.5s ease-out;
    }
    .notification-content {
      padding: 16px;
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .notification-icon {
      font-size: 1.5em;
    }
    .notification-text {
      flex: 1;
    }
    .notification-title {
      font-weight: 600;
      margin-bottom: 4px;
    }
    .notification-desc {
      font-size: 0.85em;
      opacity: 0.9;
    }
  `;
  document.head.appendChild(style);
  document.body.appendChild(notification);
  
  // 自動關閉
  setTimeout(() => {
    notification.style.animation = 'slideOutRight 0.3s ease-in forwards';
    setTimeout(() => notification.remove(), 300);
  }, 5000);
}

/**
 * 查看完成的模型
 */
function viewCompletedModel() {
  const notification = document.querySelector('.training-complete-notification');
  if (notification) notification.remove();
  showComingSoonMessage();
}

/**
 * 響應式處理
 */
function handleResponsive() {
  const workflowGrid = document.querySelector('.workflow-grid');
  if (!workflowGrid) return;
  
  function adjustLayout() {
    const width = window.innerWidth;
    
    if (width <= 768) {
      workflowGrid.style.gridTemplateColumns = '1fr';
    } else if (width <= 1024) {
      workflowGrid.style.gridTemplateColumns = 'repeat(2, 1fr)';
    } else if (width <= 1400) {
      workflowGrid.style.gridTemplateColumns = 'repeat(3, 1fr)';
    } else {
      workflowGrid.style.gridTemplateColumns = 'repeat(auto-fit, minmax(350px, 1fr))';
    }
  }
  
  adjustLayout();
  const debouncedAdjust = Utils?.debounce ? Utils.debounce(adjustLayout, 250) : adjustLayout;
  window.addEventListener('resize', debouncedAdjust);
}

/**
 * 暴露到全域
 */
window.startTraining = startTraining;
window.createNewProject = createNewProject;
window.showModelZoo = showModelZoo;
window.showTutorial = showTutorial;
window.startQuickDemo = startQuickDemo;
window.viewProject = viewProject;
window.pauseTraining = pauseTraining;
window.deployModel = deployModel;
window.retryTraining = retryTraining;
window.closeTrainingDialog = closeTrainingDialog;
window.confirmStartTraining = confirmStartTraining;
window.closeTrainingTypeMenu = closeTrainingTypeMenu;
window.selectTrainingType = selectTrainingType;
window.clearSearch = clearSearch;
window.viewActiveTraining = viewActiveTraining;
window.closeBanner = closeBanner;
window.viewCompletedModel = viewCompletedModel;

// 頁面載入完成後執行
window.addEventListener('load', () => {
  setupCardAnimations();
  handleResponsive();
  
  // 檢查是否有URL參數指示要開始特定訓練
  const urlParams = new URLSearchParams(window.location.search);
  const autoStart = urlParams.get('start');
  if (autoStart && TRAINING_TYPES[autoStart]) {
    setTimeout(() => startTraining(autoStart), 1000);
  }
});