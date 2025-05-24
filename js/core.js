// js/core.js - 核心功能模組

/**
 * 南臺科技大學AI視覺訓練平台 - 核心功能
 * 統一管理側邊欄、用戶資訊、彈出窗口等核心功能
 */

// 全域變數
let isMessageShowing = false;

// DOM 載入後初始化
document.addEventListener('DOMContentLoaded', function() {
  initApp();
});

/**
 * 初始化應用程式
 */
function initApp() {
  checkLoginStatus();
  loadUserInfo();
  setupSidebarMenu();
  setupPopups();
  setupComingSoonHandlers();
  setupDocumentEvents();
  
  // 初始化視圖
  const mainContentArea = document.getElementById('main-content-area');
  if (mainContentArea && !mainContentArea.innerHTML.trim()) {
    showView('projects');
  }
  
  markCurrentPage();
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
 * 載入用戶資訊
 */
function loadUserInfo() {
  const name = localStorage.getItem("username") || "測試帳戶";
  const email = localStorage.getItem("email") || "test@demo.com";
  
  // 更新顯示元素
  const userNameElements = document.querySelectorAll("#user-name, #menu-username");
  const userEmailElements = document.querySelectorAll("#user-email, #menu-email");
  const userAvatarElements = document.querySelectorAll("#user-avatar");
  
  userNameElements.forEach(el => {
    if (el.id === "user-name") {
      el.innerHTML = `<strong>${name}</strong>`;
    } else {
      el.textContent = name;
    }
  });
  
  userEmailElements.forEach(el => {
    el.textContent = email;
  });
  
  // 設置用戶頭像
  const firstChar = name.charAt(0) || "測";
  userAvatarElements.forEach(el => {
    el.textContent = firstChar;
  });
}

/**
 * 設置側邊欄選單事件
 */
function setupSidebarMenu() {
  document.querySelectorAll('.sidebar-menu li').forEach(li => {
    li.addEventListener('click', (event) => {
      const viewName = li.getAttribute('data-view');
      
      if (viewName === 'coming-soon') {
        event.stopPropagation();
        showComingSoonMessage();
        return;
      }
      
      // 工作流導航
      if (viewName === 'workflows') {
        if (!window.location.pathname.includes('workflow.html')) {
          window.location.href = 'workflow.html';
        }
        return;
      }
      
      // 專案導航
      if (viewName === 'projects') {
        const currentPath = window.location.pathname;
        if (currentPath.includes('index.html') || currentPath.endsWith('/')) {
          showView('projects', li);
        } else {
          window.location.href = 'index.html';
        }
        return;
      }
      
      // 其他導航
      if (viewName) {
        if (viewName === 'workspace') {
          showView('projects', li);
        } else {
          navigateTo(`${viewName}.html`);
        }
      }
    });
  });
}

/**
 * 設置彈出窗口事件
 */
function setupPopups() {
  document.querySelectorAll('[data-popup]').forEach(el => {
    el.addEventListener('click', (e) => {
      const popupId = el.getAttribute('data-popup');
      togglePopup(popupId, el);
      e.stopPropagation();
    });
  });
}

/**
 * 切換彈出窗口
 */
function togglePopup(id, anchor) {
  const popup = document.getElementById(id);
  if (!popup) return;
  
  const isVisible = popup.classList.contains('show');
  
  // 隱藏所有彈出窗口
  document.querySelectorAll('.popup-menu').forEach(p => {
    p.classList.remove('show');
  });
  
  if (!isVisible) {
    // 計算位置
    const rect = anchor.getBoundingClientRect();
    const popupWidth = 220;
    const popupHeight = popup.offsetHeight || 200;
    
    let top = rect.top + rect.height / 2 - popupHeight / 2;
    let left = rect.right + 10;
    
    // 確保不超出視窗範圍
    if (left + popupWidth > window.innerWidth) {
      left = rect.left - popupWidth - 10;
    }
    
    if (top < 10) top = 10;
    if (top + popupHeight > window.innerHeight - 10) {
      top = window.innerHeight - popupHeight - 10;
    }
    
    popup.style.top = `${top}px`;
    popup.style.left = `${left}px`;
    popup.classList.add('show');
  }
}

/**
 * 設置即將推出功能的處理程序
 */
function setupComingSoonHandlers() {
  document.querySelectorAll('[data-view="coming-soon"]').forEach(el => {
    el.classList.add('show-coming-soon');
    el.removeAttribute('data-view');
  });
  
  document.querySelectorAll('.show-coming-soon').forEach(el => {
    // 移除舊的事件監聽器
    const newEl = el.cloneNode(true);
    el.parentNode.replaceChild(newEl, el);
    
    newEl.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      showComingSoonMessage();
    });
  });
}

/**
 * 設置文檔事件
 */
function setupDocumentEvents() {
  document.addEventListener('click', (e) => {
    const accountMenu = document.getElementById('account-menu');
    const settingsPopup = document.getElementById('settings-popup');
    
    // 檢查是否點擊在彈出窗口外部
    if (accountMenu && !accountMenu.contains(e.target) && 
        !e.target.closest('[data-popup="account-menu"]')) {
      accountMenu.classList.remove('show');
    }
    
    if (settingsPopup && !settingsPopup.contains(e.target) && 
        !e.target.closest('[data-popup="settings-popup"]')) {
      settingsPopup.classList.remove('show');
    }
  });
}

/**
 * 設置活動連結
 */
function setActiveLink(element) {
  document.querySelectorAll('.sidebar-menu li').forEach(li => {
    li.classList.remove('active');
  });
  if (element) element.classList.add('active');
}

/**
 * 標記當前頁面
 */
function markCurrentPage() {
  const currentPath = window.location.pathname;
  
  // 移除所有活動標記
  document.querySelectorAll('.sidebar-menu li').forEach(li => {
    li.classList.remove('active');
  });
  
  // 設置活動標記
  if (currentPath.includes('workflow.html')) {
    const workflowsLink = document.getElementById('workflows-link');
    if (workflowsLink) workflowsLink.classList.add('active');
  } else if (currentPath.includes('index.html') || currentPath.endsWith('/')) {
    const projectsLink = document.getElementById('projects-link');
    if (projectsLink) projectsLink.classList.add('active');
  }
}

/**
 * 視圖模板
 */
const viewTemplates = {
  projects: `
    <div class="workspace-container card animated fadeSlideUp">
      <img src="./icon/01.png" alt="沒有專案">
      <h2>此工作區中沒有專案</h2>
      <p>建立專案並上傳圖像以開始標註、訓練和部署您的電腦視覺模型</p>
      <div>
        <a href="create-project.html" class="btn btn-primary">
          <i class="fas fa-plus-circle"></i> 新增專案
        </a>
        <a href="tutorial.html" class="btn btn-secondary">
          <i class="fas fa-book-open"></i> 檢視教學
        </a>
      </div>
    </div>
  `
};

/**
 * 顯示視圖
 */
function showView(viewName, element) {
  setActiveLink(element);
  
  if (viewName === 'coming-soon') {
    showComingSoonMessage();
    return;
  }
  
  if (viewName === 'workflows') {
    window.location.href = 'workflow.html';
    return;
  }
  
  const mainContentArea = document.getElementById('main-content-area');
  if (!mainContentArea) return;
  
  if (viewTemplates[viewName]) {
    mainContentArea.innerHTML = viewTemplates[viewName];
    
    // 添加動畫
    const newContent = mainContentArea.querySelector('.animated');
    if (newContent) {
      setTimeout(() => newContent.classList.add('fadeSlideUp'), 50);
    }
    
    // 重新設置即將推出功能處理程序
    setupComingSoonHandlers();
  }
}

/**
 * 顯示即將推出訊息
 */
function showComingSoonMessage() {
  if (isMessageShowing) return;
  
  isMessageShowing = true;
  setTimeout(() => {
    alert("🚧 功能尚未開放\n這個功能目前仍在開發中，敬請期待！\n若您認同本平台推廣 AI 教育的理念，歡迎小額贊助支持我們持續優化系統功能。❤️");
    isMessageShowing = false;
  }, 100);
}

/**
 * 頁面導航
 */
function navigateTo(page) {
  window.location.href = page;
}

/**
 * 登出功能
 */
function logout() {
  localStorage.clear();
  navigateTo("login.html");
}

/**
 * 創建專案
 */
function createProject() {
  const projectName = document.getElementById('project-name')?.value?.trim();
  const annotationGroup = document.getElementById('annotation-group')?.value?.trim();
  const license = document.getElementById('license')?.value;
  
  if (!projectName) {
    alert('請輸入專案名稱！');
    return;
  }
  
  // 獲取選擇的專案類型
  const selectedType = document.querySelector('.project-type-option.selected');
  if (!selectedType) {
    alert('請選擇專案類型！');
    return;
  }
  
  const projectType = selectedType.getAttribute('data-type');
  
  // 僅當選擇「物件偵測」時繼續正常流程
  if (projectType === 'object-detection') {
    const projectInfo = {
      name: projectName,
      annotationGroup: annotationGroup || '物件',
      license: license || 'cc-by-4.0',
      type: projectType,
      createdAt: new Date().toISOString()
    };
    
    localStorage.setItem('currentProject', JSON.stringify(projectInfo));
    navigateTo('upload.html');
  } else {
    showComingSoonMessage();
  }
}

/**
 * 格式化檔案大小
 */
function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * 顯示載入狀態
 */
function showLoading(element, text = '載入中...') {
  if (!element) return;
  
  const originalContent = element.innerHTML;
  element.innerHTML = `
    <div class="loading">
      <div class="spinner"></div>
      <span>${text}</span>
    </div>
  `;
  
  return originalContent;
}

/**
 * 隱藏載入狀態
 */
function hideLoading(element, originalContent) {
  if (!element || !originalContent) return;
  element.innerHTML = originalContent;
}

/**
 * 簡單的事件總線
 */
const EventBus = {
  events: {},
  
  on(event, callback) {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(callback);
  },
  
  emit(event, data) {
    if (this.events[event]) {
      this.events[event].forEach(callback => callback(data));
    }
  },
  
  off(event, callback) {
    if (this.events[event]) {
      this.events[event] = this.events[event].filter(cb => cb !== callback);
    }
  }
};

/**
 * 工具函數
 */
const Utils = {
  // 防抖函數
  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  },
  
  // 節流函數
  throttle(func, limit) {
    let inThrottle;
    return function() {
      const args = arguments;
      const context = this;
      if (!inThrottle) {
        func.apply(context, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  },
  
  // 隨機ID生成
  generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  },
  
  // 深拷貝
  deepClone(obj) {
    return JSON.parse(JSON.stringify(obj));
  }
};

// 暴露到全域作用域
window.showComingSoonMessage = showComingSoonMessage;
window.navigateTo = navigateTo;
window.logout = logout;
window.createProject = createProject;
window.EventBus = EventBus;
window.Utils = Utils;