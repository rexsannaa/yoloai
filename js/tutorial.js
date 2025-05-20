// tutorial.js - 教學功能相關邏輯

/**
 * EasyYOLO - 視覺化機器學習教學平台 
 * 教學功能模組
 */

let completedTutorials = [];
let tutorialProgress = {};

document.addEventListener('DOMContentLoaded', function() {
  // 初始化教學模組
  initTutorials();
});

/**
 * 初始化教學模組
 */
function initTutorials() {
  // 檢查用戶是否已登入
  if (typeof checkLoginStatus === 'function') {
    checkLoginStatus();
  }
  
  // 從本地存儲加載進度
  loadTutorialProgress();
  
  // 設置教學卡片事件
  setupTutorialCards();
  
  // 設置教學分類過濾功能
  setupTutorialFilters();
  
  // 設置教學步驟導航功能
  setupTutorialSteps();
  
  // 更新教學完成狀態UI
  updateTutorialCompletionUI();
  
  // 檢查如果在工作流頁面，初始化工作流教學功能
  const workflowGrid = document.querySelector('.workflow-grid');
  if (workflowGrid) {
    setupWorkflowTutorials();
  }
}

/**
 * 從本地存儲加載教學進度
 */
function loadTutorialProgress() {
  completedTutorials = JSON.parse(localStorage.getItem('completedTutorials') || '[]');
  tutorialProgress = JSON.parse(localStorage.getItem('tutorialProgress') || '{}');
}

/**
 * 設置教學卡片事件
 */
function setupTutorialCards() {
  const tutorialCards = document.querySelectorAll('.tutorial-card');
  
  tutorialCards.forEach(card => {
    // 對於沒有自訂操作按鈕的卡片添加點擊事件
    if (!card.querySelector('.tutorial-actions')) {
      card.addEventListener('click', function() {
        // 獲取卡片標題作為教學名稱
        const tutorialTitle = this.querySelector('.tutorial-card-title')?.innerText;
        if (tutorialTitle) {
          startTutorial(tutorialTitle);
        }
      });
    } else {
      // 為操作按鈕添加事件
      const actionBtn = card.querySelector('.tutorial-btn');
      if (actionBtn) {
        actionBtn.addEventListener('click', function(e) {
          e.stopPropagation();
          const tutorialTitle = card.querySelector('.tutorial-card-title')?.innerText;
          if (tutorialTitle) {
            startTutorial(tutorialTitle);
          }
        });
      }
    }
  });
}

/**
 * 設置工作流教學功能
 */
function setupWorkflowTutorials() {
  const tutorialOptions = document.querySelectorAll('.tutorial-option');
  
  tutorialOptions.forEach(option => {
    // 跳過已經有show-coming-soon類的項目
    if (option.classList.contains('show-coming-soon')) return;
    
    option.addEventListener('click', function() {
      // 獲取教學標籤作為教學名稱
      const tutorialLabel = this.querySelector('.tutorial-label')?.innerText;
      if (tutorialLabel) {
        startTutorial(tutorialLabel);
      }
    });
  });
}

/**
 * 設置教學分類過濾功能
 */
function setupTutorialFilters() {
  const filterButtons = document.querySelectorAll('.tutorial-filter-btn');
  
  filterButtons.forEach(button => {
    button.addEventListener('click', function() {
      // 移除所有按鈕的active類
      filterButtons.forEach(btn => btn.classList.remove('active'));
      
      // 添加當前按鈕的active類
      this.classList.add('active');
      
      // 獲取分類名稱
      const category = this.getAttribute('data-category') || this.textContent.toLowerCase().trim();
      
      // 過濾卡片
      filterTutorialsByCategory(category);
    });
  });
}

/**
 * 設置教學步驟導航功能
 */
function setupTutorialSteps() {
  const tutorialSteps = document.querySelectorAll('.tutorial-step');
  
  tutorialSteps.forEach(step => {
    // 只為未完成且非當前活動的步驟添加點擊事件
    if (!step.classList.contains('completed') && !step.classList.contains('active')) {
      step.addEventListener('click', function() {
        // 顯示功能尚未開放
        showTutorialComingSoonMessage();
      });
    }
  });
}

/**
 * 啟動教學
 * @param {string} tutorialName - 教學名稱
 */
function startTutorial(tutorialName) {
  console.log(`開始教學: ${tutorialName}`);
  
  // 確認教學ID
  const tutorialId = getTutorialId(tutorialName);
  
  // 根據教學ID導航
  if (tutorialId === 'object-detection-basic') {
    navigateTo('pages/tutorial-detail.html');
  } else {
    // 其他教學顯示提示
    showTutorialComingSoonMessage();
  }
}

/**
 * 根據教學名稱獲取教學ID
 * @param {string} tutorialName - 教學名稱
 * @returns {string} 教學ID
 */
function getTutorialId(tutorialName) {
  // 簡單的映射表
  const nameToIdMap = {
    '物件偵測基礎': 'object-detection-basic',
    '圖像分類基礎': 'classification-basic',
    '實例分割基礎': 'segmentation-basic',
    '關鍵點偵測基礎': 'keypoint-basic',
    '進階物件偵測技術': 'object-detection-advanced',
    '多模態AI基礎': 'multimodal-basic',
    // 英文版本
    'Object detection': 'object-detection-basic',
    'Images: Object detection': 'object-detection-basic',
    'Motion: Gesture recognition': 'gesture-recognition-basic',
    'Audio: Audio classification': 'audio-classification-basic'
  };
  
  return nameToIdMap[tutorialName] || tutorialName.toLowerCase().replace(/\s+/g, '-');
}

/**
 * 根據搜尋詞過濾教學卡片
 * @param {string} category - 類別名稱
 */
function filterTutorialsByCategory(category) {
  const tutorialCards = document.querySelectorAll('.tutorial-card');
  
  tutorialCards.forEach(card => {
    const cardCategory = card.getAttribute('data-category');
    
    if (!category || category === 'all' || category === '全部' || cardCategory === category) {
      card.style.display = 'block';
    } else {
      card.style.display = 'none';
    }
  });
}

/**
 * 更新教學完成狀態UI顯示
 */
function updateTutorialCompletionUI() {
  // 更新卡片狀態
  document.querySelectorAll('.tutorial-card').forEach(card => {
    // 使用自定義屬性 data-tutorial-id 來標識每個教學
    const tutorialId = card.getAttribute('data-tutorial-id');
    
    if (tutorialId && completedTutorials.includes(tutorialId)) {
      card.classList.add('completed');
      
      // 添加完成標記
      if (!card.querySelector('.completion-badge')) {
        const badge = document.createElement('div');
        badge.className = 'completion-badge';
        badge.innerHTML = '<i class="fas fa-check-circle"></i> 已完成';
        card.appendChild(badge);
      }
    }
  });
  
  // 更新進度顯示（如果存在）
  updateTutorialProgress();
}

/**
 * 更新教學進度
 */
function updateTutorialProgress() {
  const progressElement = document.querySelector('.tutorial-progress-fill');
  const progressInfoElement = document.querySelector('.tutorial-progress-info');
  
  if (!progressElement) return;
  
  const totalTutorials = document.querySelectorAll('[data-tutorial-id]').length;
  if (totalTutorials === 0) return;
  
  const completedCount = completedTutorials.length;
  
  // 計算完成百分比
  const percentage = Math.round((completedCount / totalTutorials) * 100);
  
  // 更新進度條
  progressElement.style.width = `${percentage}%`;
  
  // 更新進度文字
  if (progressInfoElement) {
    progressInfoElement.textContent = `已完成 ${completedCount}/${totalTutorials} 教學`;
  }
}

/**
 * 標記完成教學
 * @param {string} tutorialId - 教學ID
 */
function markTutorialComplete(tutorialId) {
  // 將完成狀態保存到本地存儲
  if (!completedTutorials.includes(tutorialId)) {
    completedTutorials.push(tutorialId);
    localStorage.setItem('completedTutorials', JSON.stringify(completedTutorials));
  }
  
  // 更新UI顯示
  updateTutorialCompletionUI();
}

/**
 * 在本地存儲教學進度
 * @param {string} tutorialId - 教學ID
 * @param {number} progress - 進度百分比 (0-100)
 */
function saveTutorialProgress(tutorialId, progress) {
  // 更新進度
  tutorialProgress[tutorialId] = progress;
  
  // 儲存回本地存儲
  localStorage.setItem('tutorialProgress', JSON.stringify(tutorialProgress));
  
  // 如果進度達到100%，標記為已完成
  if (progress >= 100) {
    markTutorialComplete(tutorialId);
  }
}

/**
 * 顯示功能尚未開放訊息
 */
function showTutorialComingSoonMessage() {
  if (typeof showComingSoonMessage === 'function') {
    showComingSoonMessage();
  } else {
    alert("🚧 教學功能尚未開放\n此教學功能目前仍在開發中，敬請期待！\n若您認同本平台推廣 AI 教育的理念，歡迎小額贊助支持我們持續優化系統功能。❤️");
  }
}

// 導出公共函數
window.startTutorial = startTutorial;
window.markTutorialComplete = markTutorialComplete;
window.saveTutorialProgress = saveTutorialProgress;
window.showTutorialComingSoonMessage = showTutorialComingSoonMessage;