// js/tutorial.js - 教學功能相關邏輯

/**
 * 南臺科技大學AI視覺訓練平台 - 教學模組功能
 * 提供教學相關的通用功能
 */

document.addEventListener('DOMContentLoaded', function() {
  initTutorials();
});

/**
 * 初始化教學模組
 */
function initTutorials() {
  if (typeof checkLoginStatus === 'function') {
    checkLoginStatus();
  }
  
  setupTutorialCards();
  
  if (document.querySelector('.workflow-grid')) {
    setupWorkflowTutorials();
  }
  
  setupTutorialFilters();
  setupTutorialSteps();
  updateTutorialCompletionUI();
}

/**
 * 設置教學卡片事件
 */
function setupTutorialCards() {
  const tutorialCards = document.querySelectorAll('.tutorial-card');
  
  tutorialCards.forEach(card => {
    if (!card.querySelector('.tutorial-actions')) {
      card.addEventListener('click', function() {
        const tutorialTitle = this.querySelector('.tutorial-card-title')?.innerText;
        if (tutorialTitle) {
          startTutorial(tutorialTitle);
        }
      });
    }
  });
}

/**
 * 設置工作流教學功能
 */
function setupWorkflowTutorials() {
  const tutorialOptions = document.querySelectorAll('.tutorial-option');
  
  tutorialOptions.forEach(option => {
    option.addEventListener('click', function() {
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
      filterButtons.forEach(btn => btn.classList.remove('active'));
      this.classList.add('active');
      
      const category = this.getAttribute('data-category') || this.textContent.toLowerCase().trim();
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
    if (!step.classList.contains('completed') && !step.classList.contains('active')) {
      step.addEventListener('click', function() {
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
  
  const tutorialId = getTutorialId(tutorialName);
  
  if (tutorialId === 'object-detection-basic') {
    // 這裡可以導航到詳細教學頁面
    showTutorialComingSoonMessage();
  } else {
    showTutorialComingSoonMessage();
  }
}

/**
 * 根據教學名稱獲取教學ID
 * @param {string} tutorialName - 教學名稱
 * @returns {string} 教學ID
 */
function getTutorialId(tutorialName) {
  const nameToIdMap = {
    '物件偵測基礎': 'object-detection-basic',
    '圖像分類基礎': 'classification-basic',
    '實例分割基礎': 'segmentation-basic',
    '關鍵點偵測基礎': 'keypoint-basic',
    '進階物件偵測技術': 'object-detection-advanced',
    '多模態AI基礎': 'multimodal-basic',
    'Object detection': 'object-detection-basic',
    'Images: Object detection': 'object-detection-basic',
    'Motion: Gesture recognition': 'gesture-recognition-basic',
    'Audio: Audio classification': 'audio-classification-basic'
  };
  
  return nameToIdMap[tutorialName] || tutorialName.toLowerCase().replace(/\s+/g, '-');
}

/**
 * 根據搜尋詞過濾工作流
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
  const completedTutorials = JSON.parse(localStorage.getItem('completedTutorials') || '[]');
  
  document.querySelectorAll('.tutorial-card').forEach(card => {
    const tutorialId = card.getAttribute('data-tutorial-id');
    
    if (tutorialId && completedTutorials.includes(tutorialId)) {
      card.classList.add('completed');
      
      if (!card.querySelector('.completion-badge')) {
        const badge = document.createElement('div');
        badge.className = 'completion-badge';
        badge.innerHTML = '<i class="fas fa-check-circle"></i> 已完成';
        card.querySelector('.tutorial-card-header')?.appendChild(badge);
      }
    }
  });
  
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
  
  const completedTutorials = JSON.parse(localStorage.getItem('completedTutorials') || '[]');
  const completedCount = completedTutorials.length;
  
  const percentage = Math.round((completedCount / totalTutorials) * 100);
  
  progressElement.style.width = `${percentage}%`;
  
  if (progressInfoElement) {
    progressInfoElement.textContent = `已完成 ${completedCount}/${totalTutorials} 教學`;
  }
}

/**
 * 標記完成教學
 * @param {string} tutorialId - 教學ID
 */
function markTutorialComplete(tutorialId) {
  const completedTutorials = JSON.parse(localStorage.getItem('completedTutorials') || '[]');
  
  if (!completedTutorials.includes(tutorialId)) {
    completedTutorials.push(tutorialId);
    localStorage.setItem('completedTutorials', JSON.stringify(completedTutorials));
  }
  
  updateTutorialCompletionUI();
}

/**
 * 在本地存儲教學進度
 * @param {string} tutorialId - 教學ID
 * @param {number} progress - 進度百分比 (0-100)
 */
function saveTutorialProgress(tutorialId, progress) {
  const progressData = JSON.parse(localStorage.getItem('tutorialProgress') || '{}');
  
  progressData[tutorialId] = progress;
  
  localStorage.setItem('tutorialProgress', JSON.stringify(progressData));
  
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