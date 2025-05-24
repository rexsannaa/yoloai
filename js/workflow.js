// js/workflow.js - 工作流功能模組

/**
 * 工作流頁面功能處理
 */

// 初始化
document.addEventListener('DOMContentLoaded', function() {
  initWorkflowPage();
  setupSearchFunctionality();
});

/**
 * 初始化工作流頁面
 */
function initWorkflowPage() {
  console.log('工作流頁面已載入');
  
  // 設置搜索功能
  setupSearchFunctionality();
  
  // 添加卡片懸停效果
  setupCardHoverEffects();
  
  // 設置鍵盤快捷鍵
  setupKeyboardShortcuts();
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
  const workflowCards = document.querySelectorAll('.workflow-card');
  
  workflowCards.forEach(card => {
    const title = card.querySelector('h3')?.textContent?.toLowerCase() || '';
    const description = card.querySelector('p')?.textContent?.toLowerCase() || '';
    const tutorialTitles = Array.from(card.querySelectorAll('.tutorial-title'))
      .map(el => el.textContent.toLowerCase()).join(' ');
    
    const isMatch = title.includes(searchTerm) || 
                   description.includes(searchTerm) || 
                   tutorialTitles.includes(searchTerm);
    
    card.style.display = isMatch ? '' : 'none';
    
    // 添加搜索高亮
    if (searchTerm && isMatch) {
      highlightSearchTerm(card, searchTerm);
    } else {
      removeHighlight(card);
    }
  });
  
  // 顯示搜索結果統計
  updateSearchResults(searchTerm);
}

/**
 * 高亮搜索詞
 */
function highlightSearchTerm(card, term) {
  if (!term) return;
  
  const textElements = card.querySelectorAll('h3, p, .tutorial-title');
  textElements.forEach(el => {
    const text = el.textContent;
    const regex = new RegExp(`(${term})`, 'gi');
    const highlightedText = text.replace(regex, '<mark>$1</mark>');
    
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
 * 更新搜索結果
 */
function updateSearchResults(searchTerm) {
  const visibleCards = document.querySelectorAll('.workflow-card:not([style*="display: none"])');
  const totalCards = document.querySelectorAll('.workflow-card').length;
  
  // 可以在這裡添加搜索結果統計的顯示
  console.log(`搜索 "${searchTerm}": ${visibleCards.length}/${totalCards} 個結果`);
}

/**
 * 設置卡片懸停效果
 */
function setupCardHoverEffects() {
  const workflowCards = document.querySelectorAll('.workflow-card');
  
  workflowCards.forEach(card => {
    card.addEventListener('mouseenter', () => {
      card.style.transform = 'translateY(-4px)';
    });
    
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });
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
    
    // Escape 清空搜索
    if (e.key === 'Escape') {
      const searchBar = document.querySelector('.search-bar');
      if (searchBar && document.activeElement === searchBar) {
        searchBar.value = '';
        performSearch();
        searchBar.blur();
      }
    }
  });
}

/**
 * 導航到工作流工作室
 * @param {string} workflowType - 工作流類型
 */
function navigateToWorkflow(workflowType) {
  if (!workflowType) {
    console.error('工作流類型不能為空');
    return;
  }
  
  const validTypes = ['custom', 'gesture-recognition', 'object-detection', 'audio-classification'];
  
  if (!validTypes.includes(workflowType)) {
    console.error('不支援的工作流類型:', workflowType);
    showComingSoonMessage();
    return;
  }
  
  // 特殊處理：物件偵測跳轉到教學頁面
  if (workflowType === 'object-detection') {
    window.location.href = 'tutorial.html';
    return;
  }
  
  // 其他類型顯示開發中訊息
  showComingSoonMessage();
}

/**
 * 獲取工作流統計資訊
 */
function getWorkflowStats() {
  const totalWorkflows = document.querySelectorAll('.workflow-card').length;
  const tutorialWorkflows = document.querySelectorAll('.tutorial-card').length;
  const customWorkflows = totalWorkflows - tutorialWorkflows;
  
  return {
    total: totalWorkflows,
    tutorials: tutorialWorkflows,
    custom: customWorkflows
  };
}

/**
 * 添加新的工作流卡片（動態添加）
 */
function addWorkflowCard(config) {
  const workflowGrid = document.querySelector('.workflow-grid');
  if (!workflowGrid) return;
  
  const cardHTML = `
    <div class="workflow-card" onclick="navigateToWorkflow('${config.type}')">
      <div class="workflow-card-header">
        <h3>${config.title}</h3>
        <i class="fas fa-ellipsis-h show-coming-soon"></i>
      </div>
      <div class="workflow-card-image-placeholder">
        ${config.image ? `<img src="${config.image}" alt="${config.title}">` : '<i class="fas fa-cogs"></i>'}
      </div>
      <p>${config.description}</p>
    </div>
  `;
  
  workflowGrid.insertAdjacentHTML('beforeend', cardHTML);
  
  // 重新設置事件處理程序
  setupComingSoonHandlers();
}

/**
 * 工作流卡片動畫
 */
function animateWorkflowCards() {
  const cards = document.querySelectorAll('.workflow-card');
  
  cards.forEach((card, index) => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(20px)';
    
    setTimeout(() => {
      card.style.transition = 'all 0.4s ease';
      card.style.opacity = '1';
      card.style.transform = 'translateY(0)';
    }, index * 100);
  });
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
    } else {
      workflowGrid.style.gridTemplateColumns = 'repeat(auto-fit, minmax(320px, 1fr))';
    }
  }
  
  adjustLayout();
  window.addEventListener('resize', Utils?.debounce ? Utils.debounce(adjustLayout, 250) : adjustLayout);
}

// 暴露到全域
window.navigateToWorkflow = navigateToWorkflow;

// 頁面載入完成後執行動畫
window.addEventListener('load', () => {
  animateWorkflowCards();
  handleResponsive();
});