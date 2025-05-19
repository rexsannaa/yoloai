// tutorial.js - 教學平台共用腳本

/**
 * 南臺科技大學AI視覺訓練平台 - 教學模組共用腳本
 * 提供教學相關的通用功能
 */

document.addEventListener('DOMContentLoaded', function() {
  // 初始化教學模組
  initTutorials();
});

/**
 * 初始化教學模組
 */
function initTutorials() {
  // 檢查用戶是否已登入
  checkLoginStatus();
  
  // 設置教學卡片事件
  setupTutorialCards();
  
  // 如果目前在工作流頁面，初始化工作流教學功能
  if (document.querySelector('.workflow-grid')) {
    setupWorkflowTutorials();
  }
  
  // 設置導航回主平台功能
  setupNavigationEvents();
}

/**
 * 檢查登入狀態
 */
function checkLoginStatus() {
  const isLoginPage = window.location.pathname.includes('login.html');
  const hasUserInfo = localStorage.getItem("username");
  
  if (!isLoginPage && !hasUserInfo) {
    window.location.href = "login.html";
  }
}

/**
 * 設置教學卡片事件
 */
function setupTutorialCards() {
  const tutorialCards = document.querySelectorAll('.tutorial-card');
  
  tutorialCards.forEach(card => {
    card.addEventListener('click', function() {
      // 獲取卡片標題作為教學名稱
      const tutorialTitle = this.querySelector('.tutorial-card-title').innerText;
      startTutorial(tutorialTitle);
    });
  });
}

/**
 * 啟動教學
 * @param {string} tutorialName - 教學名稱
 */
function startTutorial(tutorialName) {
  console.log(`開始教學: ${tutorialName}`);
  showComingSoonMessage();
}

/**
 * 設置工作流教學功能
 */
function setupWorkflowTutorials() {
  const tutorialOptions = document.querySelectorAll('.tutorial-option');
  
  tutorialOptions.forEach(option => {
    option.addEventListener('click', function() {
      // 獲取教學標籤作為教學名稱
      const tutorialLabel = this.querySelector('.tutorial-label').innerText;
      startTutorial(tutorialLabel);
    });
  });
}

/**
 * 設置導航事件
 */
function setupNavigationEvents() {
  // 返回主平台按鈕
  const backToMainLinks = document.querySelectorAll('.back-to-main');
  
  backToMainLinks.forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      navigateTo('index.html');
    });
  });
}

/**
 * 頁面導航
 * @param {string} page - 目標頁面
 */
function navigateTo(page) {
  window.location.href = page;
}

/**
 * 標記完成教學
 * @param {string} tutorialId - 教學ID
 */
function markTutorialComplete(tutorialId) {
  // 將完成狀態保存到本地存儲
  const completedTutorials = JSON.parse(localStorage.getItem('completedTutorials') || '[]');
  
  if (!completedTutorials.includes(tutorialId)) {
    completedTutorials.push(tutorialId);
    localStorage.setItem('completedTutorials', JSON.stringify(completedTutorials));
  }
  
  // 更新UI顯示
  updateTutorialCompletionUI();
}

/**
 * 更新教學完成狀態UI顯示
 */
function updateTutorialCompletionUI() {
  const completedTutorials = JSON.parse(localStorage.getItem('completedTutorials') || '[]');
  
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
        card.querySelector('.tutorial-card-header').appendChild(badge);
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
  const progressElement = document.querySelector('.tutorial-progress');
  if (!progressElement) return;
  
  const totalTutorials = document.querySelectorAll('[data-tutorial-id]').length;
  if (totalTutorials === 0) return;
  
  const completedTutorials = JSON.parse(localStorage.getItem('completedTutorials') || '[]');
  const completedCount = completedTutorials.length;
  
  // 計算完成百分比
  const percentage = Math.round((completedCount / totalTutorials) * 100);
  
  // 更新進度條
  const progressBar = progressElement.querySelector('.progress-bar');
  if (progressBar) {
    progressBar.style.width = `${percentage}%`;
    progressBar.textContent = `${percentage}%`;
  }
}

/**
 * 獲取教學難度圖標
 * @param {string} level - 難度級別
 * @returns {string} 對應的圖標HTML
 */
function getDifficultyIcon(level) {
  const levels = {
    'beginner': '<i class="fas fa-star"></i><i class="far fa-star"></i><i class="far fa-star"></i>',
    'intermediate': '<i class="fas fa-star"></i><i class="fas fa-star"></i><i class="far fa-star"></i>',
    'advanced': '<i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i>'
  };
  
  return levels[level.toLowerCase()] || levels.beginner;
}

/**
 * 切換教學分類顯示
 * @param {string} category - 類別名稱
 */
function filterTutorialsByCategory(category) {
  const tutorialCards = document.querySelectorAll('.tutorial-card');
  
  tutorialCards.forEach(card => {
    const cardCategory = card.getAttribute('data-category');
    
    if (!category || category === 'all' || cardCategory === category) {
      card.style.display = 'block';
    } else {
      card.style.display = 'none';
    }
  });
}

/**
 * 在本地存儲教學進度
 * @param {string} tutorialId - 教學ID
 * @param {number} progress - 進度百分比 (0-100)
 */
function saveTutorialProgress(tutorialId, progress) {
  // 取得之前的進度資料
  const progressData = JSON.parse(localStorage.getItem('tutorialProgress') || '{}');
  
  // 更新進度
  progressData[tutorialId] = progress;
  
  // 儲存回本地存儲
  localStorage.setItem('tutorialProgress', JSON.stringify(progressData));
  
  // 如果進度達到100%，標記為已完成
  if (progress >= 100) {
    markTutorialComplete(tutorialId);
  }
}

/**
 * 顯示功能尚未開放訊息
 */
function showTutorialComingSoonMessage() {
  alert("🚧 教學功能尚未開放\n此教學功能目前仍在開發中，敬請期待！\n若您認同本平台推廣 AI 教育的理念，歡迎小額贊助支持我們持續優化系統功能。❤️");
}