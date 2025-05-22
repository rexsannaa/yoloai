// workflow-studio.js - 工作流工作室腳本

/**
 * 工作流工作室功能模組
 * 處理步驟切換、進度追蹤和交互功能
 */

document.addEventListener('DOMContentLoaded', function() {
  // 檢查登入狀態
  if (typeof checkLoginStatus === 'function') {
    checkLoginStatus();
  }
  
  // 初始化工作室
  initWorkflowStudio();
  
  // 設置移動設備側邊欄切換
  setupMobileSidebar();
});

// 全局變量
let currentStep = 'overview';
let projectData = {
  name: '物件偵測工作流',
  type: 'object-detection',
  progress: 0,
  status: 'ready',
  data: {
    samples: 0,
    labeled: 0,
    classes: 0
  },
  training: {
    accuracy: null,
    time: null
  }
};

/**
 * 初始化工作流工作室
 */
function initWorkflowStudio() {
  // 設置側邊欄菜單點擊事件
  setupSidebarMenuEvents();
  
  // 設置步驟卡片點擊事件
  setupStepCardEvents();
  
  // 設置返回按鈕事件
  setupBackButtonEvents();
  
  // 設置快速開始按鈕
  setupQuickStartButtons();
  
  // 設置主要操作按鈕
  setupMainActionButtons();
  
  // 載入專案資訊
  loadProjectInfo();
  
  // 初始化顯示概述步驟
  showStep('overview');
}

/**
 * 設置側邊欄菜單事件
 */
function setupSidebarMenuEvents() {
  const menuItems = document.querySelectorAll('.project-menu a[data-step]');
  
  menuItems.forEach(item => {
    item.addEventListener('click', function(e) {
      e.preventDefault();
      
      const step = this.getAttribute('data-step');
      if (step) {
        showStep(step);
        updateActiveMenuItem(step);
      }
    });
  });
}

/**
 * 設置步驟卡片點擊事件
 */
function setupStepCardEvents() {
  const stepCards = document.querySelectorAll('.step-card[data-step]');
  
  stepCards.forEach(card => {
    card.addEventListener('click', function() {
      const step = this.getAttribute('data-step');
      if (step) {
        showStep(step);
        updateActiveMenuItem(step);
      }
    });
  });
}

/**
 * 設置返回按鈕事件
 */
function setupBackButtonEvents() {
  const backButtons = [
    'back-to-overview-btn',
    'back-from-impulse-btn',
    'back-from-feature-btn',
    'back-from-classifier-btn',
    'back-from-testing-btn',
    'back-from-deployment-btn'
  ];
  
  backButtons.forEach(buttonId => {
    const button = document.getElementById(buttonId);
    if (button) {
      button.addEventListener('click', function() {
        showStep('overview');
        updateActiveMenuItem('overview');
      });
    }
  });
}

/**
 * 設置快速開始按鈕
 */
function setupQuickStartButtons() {
  const quickStartButtons = document.querySelectorAll('.guide-step button[data-step]');
  
  quickStartButtons.forEach(button => {
    if (!button.disabled) {
      button.addEventListener('click', function() {
        const step = this.getAttribute('data-step');
        if (step) {
          showStep(step);
          updateActiveMenuItem(step);
        }
      });
    }
  });
}

/**
 * 設置主要操作按鈕
 */
function setupMainActionButtons() {
  // 開始工作流按鈕
  const startWorkflowBtn = document.getElementById('start-workflow-btn');
  if (startWorkflowBtn) {
    startWorkflowBtn.addEventListener('click', function() {
      showStep('data-acquisition');
      updateActiveMenuItem('data-acquisition');
    });
  }
  
  // 複製專案按鈕
  const cloneProjectBtn = document.getElementById('clone-project-btn');
  if (cloneProjectBtn) {
    cloneProjectBtn.addEventListener('click', function() {
      showComingSoonMessage('專案複製功能');
    });
  }
}

/**
 * 顯示指定步驟
 * @param {string} stepName - 步驟名稱
 */
function showStep(stepName) {
  // 隱藏所有步驟
  const allSteps = document.querySelectorAll('.studio-step');
  allSteps.forEach(step => {
    step.classList.remove('active');
  });
  
  // 顯示指定步驟
  let stepElement;
  if (stepName === 'overview') {
    stepElement = document.getElementById('overview-step');
  } else {
    stepElement = document.getElementById(`${stepName}-step`);
  }
  
  if (stepElement) {
    stepElement.classList.add('active');
    currentStep = stepName;
    
    // 更新頁面標題
    updatePageTitle(stepName);
    
    // 添加動畫效果
    stepElement.classList.add('animated', 'fadeSlideUp');
    
    // 如果是功能尚未開發的步驟，顯示對應訊息
    if (stepName !== 'overview' && stepName !== 'data-acquisition') {
      // 這些步驟目前顯示"開發中"佔位符
    }
  }
}

/**
 * 更新活動菜單項目
 * @param {string} stepName - 步驟名稱
 */
function updateActiveMenuItem(stepName) {
  // 移除所有菜單項目的active類
  const menuItems = document.querySelectorAll('.project-menu li');
  menuItems.forEach(item => {
    item.classList.remove('active');
  });
  
  // 添加對應菜單項目的active類
  let targetMenuItem;
  if (stepName === 'overview') {
    targetMenuItem = document.querySelector('.project-menu li:first-child');
  } else {
    targetMenuItem = document.querySelector(`[data-step="${stepName}"]`)?.closest('li');
  }
  
  if (targetMenuItem) {
    targetMenuItem.classList.add('active');
  }
}

/**
 * 更新頁面標題
 * @param {string} stepName - 步驟名稱
 */
function updatePageTitle(stepName) {
  const stepTitles = {
    'overview': '專案概述',
    'data-acquisition': '資料蒐集',
    'impulse-design': '衝動設計',
    'feature-generation': '特徵生成',
    'classifier': '分類器',
    'model-testing': '模型測試',
    'deployment': '部署'
  };
  
  const title = stepTitles[stepName] || '專案概述';
  document.title = `${title} - ${projectData.name} - 南臺科技大學AI視覺訓練平台`;
}

/**
 * 載入專案資訊
 */
function loadProjectInfo() {
  // 從本地存儲或URL參數載入專案資訊
  const urlParams = new URLSearchParams(window.location.search);
  const projectType = urlParams.get('type') || 'object-detection';
  
  // 根據專案類型設置不同的配置
  switch (projectType) {
    case 'object-detection':
      projectData.name = '物件偵測工作流';
      break;
    case 'classification':
      projectData.name = '圖像分類工作流';
      break;
    case 'segmentation':
      projectData.name = '實例分割工作流';
      break;
    default:
      projectData.name = 'AI工作流';
  }
  
  // 更新頁面顯示
  updateProjectDisplay();
  updateProjectProgress();
}

/**
 * 更新專案顯示
 */
function updateProjectDisplay() {
  const projectNameDisplay = document.getElementById('project-name-display');
  if (projectNameDisplay) {
    projectNameDisplay.textContent = projectData.name;
  }
  
  // 更新狀態統計
  updateStatusStats();
}

/**
 * 更新狀態統計
 */
function updateStatusStats() {
  const statElements = document.querySelectorAll('.stat-value');
  
  if (statElements.length >= 3) {
    statElements[0].textContent = `${projectData.data.samples} 個樣本`;
    statElements[1].textContent = projectData.training.time || '未開始';
    statElements[2].textContent = projectData.training.accuracy ? 
      `${projectData.training.accuracy}%` : 'N/A';
  }
  
  // 更新摘要統計
  const summaryStats = document.querySelectorAll('.summary-stat .stat-number');
  if (summaryStats.length >= 3) {
    summaryStats[0].textContent = projectData.data.samples;
    summaryStats[1].textContent = projectData.data.labeled;
    summaryStats[2].textContent = projectData.data.classes;
  }
}

/**
 * 更新專案進度
 */
function updateProjectProgress() {
  const progressFill = document.querySelector('.progress-fill');
  const progressText = document.querySelector('.progress-text');
  
  if (progressFill && progressText) {
    progressFill.style.width = `${projectData.progress}%`;
    progressText.textContent = `${projectData.progress}% 完成`;
  }
  
  // 更新步驟狀態
  updateStepStatuses();
}

/**
 * 更新步驟狀態
 */
function updateStepStatuses() {
  const steps = [
    'data-acquisition',
    'impulse-design', 
    'feature-generation',
    'classifier',
    'model-testing',
    'deployment'
  ];
  
  steps.forEach((step, index) => {
    const stepCard = document.querySelector(`[data-step="${step}"]`);
    const menuBadge = document.querySelector(`[data-step="${step}"]`)?.parentElement?.querySelector('.menu-badge');
    
    if (stepCard && menuBadge) {
      const statusElement = stepCard.querySelector('.step-status');
      
      // 根據進度更新狀態
      if (projectData.progress > index * 16.67) {
        // 步驟已完成
        statusElement.textContent = '已完成';
        statusElement.className = 'step-status status-complete';
        menuBadge.textContent = '已完成';
        menuBadge.className = 'menu-badge status-complete';
      } else if (projectData.progress === index * 16.67) {
        // 步驟進行中
        statusElement.textContent = '進行中';
        statusElement.className = 'step-status status-progress';
        menuBadge.textContent = '進行中';
        menuBadge.className = 'menu-badge status-progress';
      } else {
        // 步驟待進行
        statusElement.textContent = '待進行';
        statusElement.className = 'step-status status-pending';
        menuBadge.textContent = '待進行';
        menuBadge.className = 'menu-badge status-pending';
      }
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
 * 顯示功能開發中訊息
 * @param {string} featureName - 功能名稱
 */
function showComingSoonMessage(featureName = '此功能') {
  if (typeof showComingSoonMessage === 'function') {
    showComingSoonMessage();
  } else {
    alert(`🚧 ${featureName}開發中\n${featureName}目前仍在開發中，敬請期待！\n若您認同本平台推廣 AI 教育的理念，歡迎小額贊助支持我們持續優化系統功能。❤️`);
  }
}

/**
 * 模擬數據更新（用於演示）
 */
function simulateDataUpdate() {
  // 模擬新增數據
  projectData.data.samples += 10;
  projectData.data.labeled += 5;
  projectData.data.classes = Math.max(projectData.data.classes, 2);
  
  // 更新進度
  if (projectData.data.samples > 0) {
    projectData.progress = Math.min(16.67, projectData.progress + 16.67);
  }
  
  // 更新顯示
  updateStatusStats();
  updateProjectProgress();
}

/**
 * 模擬訓練完成（用於演示）
 */
function simulateTrainingComplete() {
  projectData.progress = 100;
  projectData.training.accuracy = Math.floor(Math.random() * 15) + 85; // 85-100%
  projectData.training.time = `${Math.floor(Math.random() * 30) + 5} 分鐘`;
  
  updateStatusStats();
  updateProjectProgress();
}

/**
 * 導出專案配置
 */
function exportProjectConfig() {
  const config = {
    name: projectData.name,
    type: projectData.type,
    created: new Date().toISOString(),
    progress: projectData.progress,
    data: projectData.data,
    training: projectData.training
  };
  
  const blob = new Blob([JSON.stringify(config, null, 2)], { 
    type: 'application/json' 
  });
  
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${projectData.name.replace(/\s+/g, '_')}_config.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * 處理檔案上傳
 * @param {FileList} files - 上傳的檔案列表
 */
function handleFileUpload(files) {
  // 模擬檔案上傳處理
  console.log('上傳檔案:', files);
  
  // 模擬處理延遲
  setTimeout(() => {
    simulateDataUpdate();
    alert(`成功上傳 ${files.length} 個檔案！`);
  }, 1000);
}

/**
 * 初始化工作流範本
 * @param {string} templateType - 範本類型
 */
function initializeTemplate(templateType) {
  const templates = {
    'object-detection': {
      name: '物件偵測工作流',
      steps: ['data-acquisition', 'impulse-design', 'feature-generation', 'classifier', 'model-testing', 'deployment'],
      estimatedTime: '2-4 小時'
    },
    'classification': {
      name: '圖像分類工作流', 
      steps: ['data-acquisition', 'feature-generation', 'classifier', 'model-testing', 'deployment'],
      estimatedTime: '1-2 小時'
    },
    'audio-classification': {
      name: '音頻分類工作流',
      steps: ['data-acquisition', 'impulse-design', 'feature-generation', 'classifier', 'model-testing', 'deployment'],
      estimatedTime: '1-3 小時'
    }
  };
  
  const template = templates[templateType];
  if (template) {
    projectData.name = template.name;
    projectData.type = templateType;
    
    updateProjectDisplay();
    console.log(`初始化範本: ${template.name}，預估時間: ${template.estimatedTime}`);
  }
}