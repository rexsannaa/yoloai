// edge_impulse.js - Edge Impulse教學模組整合檔案

/**
 * Edge Impulse教學頁面功能模組
 * 提供教學專案的顯示和互動功能
 */

document.addEventListener('DOMContentLoaded', function() {
  // 初始化教學頁面
  initTutorialPage();
});

/**
 * 初始化教學頁面
 */
function initTutorialPage() {
  // 設置選項卡切換功能
  setupTabSwitching();
  
  // 設置統計卡片動畫
  setupStatsAnimation();
  
  // 設置側邊欄互動
  setupSidebarInteraction();
}

/**
 * 設置選項卡切換功能
 */
function setupTabSwitching() {
  const tabButtons = document.querySelectorAll('.tab-button');
  if (!tabButtons.length) return;
  
  tabButtons.forEach(button => {
    button.addEventListener('click', function() {
      // 移除所有選項卡的active類
      tabButtons.forEach(btn => btn.classList.remove('active'));
      
      // 添加當前選項卡的active類
      this.classList.add('active');
      
      // 這裡可以添加切換選項卡內容的代碼
      // 目前只是示例，所以顯示功能尚未開放訊息
      showComingSoonMessage();
    });
  });
}

/**
 * 設置統計卡片動畫
 */
function setupStatsAnimation() {
  const statNumbers = document.querySelectorAll('.stat-number');
  if (!statNumbers.length) return;
  
  // 為統計數字添加動畫效果
  statNumbers.forEach(stat => {
    const finalValue = parseInt(stat.textContent);
    let currentValue = 0;
    
    // 簡單的數字增長動畫
    const interval = setInterval(() => {
      if (currentValue >= finalValue) {
        clearInterval(interval);
        return;
      }
      
      // 計算每次增加的值（較大的數字增長更快）
      const increment = Math.max(1, Math.floor(finalValue / 20));
      currentValue = Math.min(currentValue + increment, finalValue);
      stat.textContent = currentValue;
    }, 30);
  });
}

/**
 * 設置側邊欄互動
 */
function setupSidebarInteraction() {
  const sidebarItems = document.querySelectorAll('.sidebar nav ul li a');
  if (!sidebarItems.length) return;
  
  sidebarItems.forEach(item => {
    item.addEventListener('click', function(e) {
      // 移除所有項目的active類
      sidebarItems.forEach(i => i.classList.remove('active'));
      
      // 添加當前項目的active類
      this.classList.add('active');
      
      // 如果不是已實現功能，則顯示功能尚未開放訊息
      if (!this.classList.contains('implemented')) {
        e.preventDefault();
        showComingSoonMessage();
      }
    });
  });
}

/**
 * 設置任務詳情顯示
 * 此功能尚未實現，提供未來擴展用
 */
function showTaskDetails(taskId) {
  // 模擬獲取任務詳情
  const taskDetails = {
    id: taskId,
    name: "示例任務",
    progress: 60,
    description: "這是一個示例任務，用於展示詳情功能。"
  };
  
  // 更新詳情區域
  const detailsSection = document.querySelector('.task-details-section');
  if (detailsSection) {
    detailsSection.innerHTML = `
      <h4>任務詳情</h4>
      <strong>${taskDetails.name}</strong>
      <p>${taskDetails.description}</p>
      <div class="progress-bar-container">
        <div class="progress-bar" style="width: ${taskDetails.progress}%;">${taskDetails.progress}%</div>
      </div>
    `;
  }
}

/**
 * 顯示功能尚未開放訊息
 */
function showTutorialComingSoonMessage() {
  alert("🚧 教學功能尚未開放\n此教學功能目前仍在開發中，敬請期待！\n若您認同本平台推廣 AI 教育的理念，歡迎小額贊助支持我們持續優化系統功能。❤️");
}