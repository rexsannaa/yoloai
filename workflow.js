// workflow.js - 工作流頁面專用腳本

/**
 * 工作流頁面功能模組
 * 負責工作流列表的顯示和互動功能
 */

document.addEventListener('DOMContentLoaded', function() {
  // 初始化工作流頁面
  initWorkflowPage();
});

/**
 * 初始化工作流頁面
 */
function initWorkflowPage() {
  // 設置搜尋功能
  setupSearchFunction();
  
  // 設置工作流卡片點擊事件
  setupWorkflowCardEvents();
}

/**
 * 設置搜尋功能
 */
function setupSearchFunction() {
  const searchBar = document.querySelector('.search-bar');
  if (!searchBar) return;
  
  searchBar.addEventListener('input', function() {
    const searchTerm = this.value.toLowerCase().trim();
    filterWorkflows(searchTerm);
  });
}

/**
 * 根據搜尋詞過濾工作流
 * @param {string} searchTerm - 搜尋關鍵詞
 */
function filterWorkflows(searchTerm) {
  const workflowCards = document.querySelectorAll('.workflow-card');
  
  workflowCards.forEach(card => {
    const cardTitle = card.querySelector('h3').textContent.toLowerCase();
    const cardDesc = card.querySelector('p')?.textContent.toLowerCase() || '';
    
    // 檢查標題或描述是否包含搜尋詞
    const isMatch = cardTitle.includes(searchTerm) || cardDesc.includes(searchTerm);
    
    // 顯示或隱藏卡片
    card.style.display = isMatch || searchTerm === '' ? 'block' : 'none';
  });
}

/**
 * 設置工作流卡片點擊事件
 */
function setupWorkflowCardEvents() {
  const workflowCards = document.querySelectorAll('.workflow-card');
  
  workflowCards.forEach(card => {
    // 排除教學卡片，因為它包含自己的可點擊元素
    if (!card.classList.contains('tutorial-card')) {
      card.addEventListener('click', function() {
        showComingSoonMessage();
      });
    }
  });
}

/**
 * 添加新的工作流程
 * 此功能尚未實現，提供未來擴展用
 */
function addNewWorkflow() {
  showComingSoonMessage();
}

/**
 * 探索工作流模板
 * 此功能尚未實現，提供未來擴展用
 */
function exploreTemplates() {
  showComingSoonMessage();
}