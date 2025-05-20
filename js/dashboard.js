// dashboard.js - 儀表板頁面腳本

/**
 * 儀表板頁面功能模組
 * 處理區塊展開/收合和搜尋功能
 */

document.addEventListener('DOMContentLoaded', function() {
  // 檢查登入狀態
  if (typeof checkLoginStatus === 'function') {
    checkLoginStatus();
  }
  
  // 設置折疊區塊功能
  setupCollapsibleSections();
  
  // 設置專案搜索功能
  setupProjectSearch();
});

/**
 * 設置可折疊區塊功能
 */
function setupCollapsibleSections() {
  const collapsibleHeaders = document.querySelectorAll('.collapsible');
  
  collapsibleHeaders.forEach(header => {
    const toggleIcon = header.querySelector('.fa-chevron-up');
    
    if (toggleIcon) {
      toggleIcon.addEventListener('click', () => {
        header.classList.toggle('collapsed');
      });
    }
  });
}

/**
 * 設置專案搜索功能
 */
function setupProjectSearch() {
  const searchInput = document.querySelector('.search-input');
  
  if (searchInput) {
    searchInput.addEventListener('input', filterProjects);
  }
}

/**
 * 根據搜尋詞過濾專案
 */
function filterProjects() {
  const searchTerm = document.querySelector('.search-input').value.toLowerCase();
  const projectCards = document.querySelectorAll('.project-card:not(.add-project)');
  
  projectCards.forEach(card => {
    const projectTitle = card.querySelector('h3').textContent.toLowerCase();
    const projectDesc = card.querySelector('p').textContent.toLowerCase();
    
    if (projectTitle.includes(searchTerm) || projectDesc.includes(searchTerm)) {
      card.style.display = 'flex';
    } else {
      card.style.display = 'none';
    }
  });
}