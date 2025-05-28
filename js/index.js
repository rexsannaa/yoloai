// js/index.js - 主頁面功能

/**
 * 主頁面功能處理
 */

/**
 * 開始教學流程 - 修改為跳轉到 data-upload.html
 */
function startTutorial(type) {
  // 儲存訓練類型到 localStorage
  localStorage.setItem('trainingType', type);
  
  // 顯示跳轉通知
  const titles = {
    motion: 'Motion: 手勢識別',
    images: 'Images: 物件偵測', 
    audio: 'Audio: 音頻分類'
  };
  
  showNotification('開始教學', `正在跳轉到 ${titles[type]} 訓練頁面`, 'info');
  
  // 延遲跳轉到資料管理頁面
  setTimeout(() => {
    window.location.href = 'data-upload.html';
  }, 1000);
}

/**
 * 開始資料收集
 */
function startDataCollection(type) {
  const messages = {
    existing: '上傳現有資料功能',
    new: '收集新資料功能'
  };
  
  showNotification('功能開發中', `${messages[type]}正在開發中，敬請期待！`, 'info');
}

/**
 * 上傳模型
 */
function uploadModel() {
  showNotification('功能開發中', '模型上傳功能正在開發中，敬請期待！', 'info');
}

/**
 * 返回到AI訓練工作流頁面
 */
function backToWorkflows() {
  switchView('workflows');
}

/**
 * 切換視圖 - 更新以支援新的訓練詳細頁面
 */
function switchView(viewName) {
  if (currentView === viewName) return;
  
  // 更新選單項目狀態
  elements.menuItems.forEach(item => {
    item.classList.remove('active');
    if (item.getAttribute('data-view') === viewName || 
        (viewName === 'training-detail' && item.getAttribute('data-view') === 'workflows')) {
      item.classList.add('active');
    }
  });
  
  // 更新頁面標題
  const titles = {
    dashboard: '儀表板',
    projects: '專案',
    workflows: 'AI訓練',
    models: '模型庫',
    deploy: '部署',
    monitor: '監控',
    'training-detail': 'AI訓練'
  };
  
  if (elements.pageTitle) {
    elements.pageTitle.textContent = titles[viewName] || '南臺科技大學AI視覺訓練平台';
  }
  
  // 切換視圖內容
  elements.viewContents.forEach(view => {
    view.classList.add('hidden');
    if (view.id === `${viewName}-view`) {
      view.classList.remove('hidden');
    }
  });
  
  currentView = viewName;
  
  // 在手機版上切換視圖後關閉側邊欄
  if (window.innerWidth <= 768) {
    closeSidebar();
  }
}

/**
 * 設置事件監聽器 - 增加新的互動功能
 */
function setupEventListeners() {
  // 側邊欄切換
  if (elements.sidebarToggle) {
    elements.sidebarToggle.addEventListener('click', toggleSidebar);
  }
  
  // 選單項目點擊
  elements.menuItems.forEach(item => {
    item.addEventListener('click', (e) => {
      const viewName = item.getAttribute('data-view');
      if (viewName) {
        switchView(viewName);
      }
    });
  });
  
  // 用戶選單切換
  if (elements.userInfo) {
    elements.userInfo.addEventListener('click', toggleUserMenu);
  }
  
  // 點擊外部關閉用戶選單
  document.addEventListener('click', (e) => {
    if (elements.userMenu && elements.userInfo) {
      if (!elements.userInfo.contains(e.target) && !elements.userMenu.contains(e.target)) {
        closeUserMenu();
      }
    }
  });
  
  // 響應式處理
  window.addEventListener('resize', handleResize);
  
  // 鍵盤快捷鍵
  document.addEventListener('keydown', handleKeyDown);
  
  // Getting Started 展開/收合
  const toggleBtn = document.getElementById('getting-started-toggle');
  const content = document.getElementById('getting-started-content');
  
  if (toggleBtn && content) {
    toggleBtn.addEventListener('click', () => {
      const isExpanded = !content.style.display || content.style.display !== 'none';
      
      if (isExpanded) {
        content.style.display = 'none';
        toggleBtn.innerHTML = '<i class="fas fa-chevron-down"></i>';
      } else {
        content.style.display = 'grid';
        toggleBtn.innerHTML = '<i class="fas fa-chevron-up"></i>';
      }
    });
  }
}

// 全域變數 - 增加訓練類型追蹤
let currentView = 'dashboard';
let sidebarOpen = false;
let currentTrainingType = null;

// DOM 元素
const elements = {
  sidebar: null,
  sidebarToggle: null,
  pageTitle: null,
  menuItems: null,
  userInfo: null,
  userMenu: null,
  viewContents: null,
  welcomeName: null
};

// 初始化
document.addEventListener('DOMContentLoaded', function() {
  checkLoginStatus();
  initElements();
  loadUserInfo();
  setupEventListeners();
  initializeView();
});

/**
 * 檢查登入狀態
 */
function checkLoginStatus() {
  const username = localStorage.getItem('username');
  if (!username) {
    window.location.href = 'login.html';
    return;
  }
}

/**
 * 初始化 DOM 元素
 */
function initElements() {
  elements.sidebar = document.getElementById('main-sidebar');
  elements.sidebarToggle = document.getElementById('sidebar-toggle');
  elements.pageTitle = document.getElementById('page-title');
  elements.menuItems = document.querySelectorAll('.menu-item');
  elements.userInfo = document.getElementById('user-info');
  elements.userMenu = document.getElementById('user-menu');
  elements.viewContents = document.querySelectorAll('.view-content');
  elements.welcomeName = document.getElementById('welcome-name');
}

/**
 * 載入用戶資訊
 */
function loadUserInfo() {
  const username = localStorage.getItem('username') || '測試帳戶';
  const email = localStorage.getItem('email') || 'test@demo.com';
  
  // 更新用戶顯示
  const userNameEl = document.getElementById('user-name');
  const userEmailEl = document.getElementById('user-email');
  const userAvatarEl = document.getElementById('user-avatar');
  const welcomeNameEl = document.getElementById('welcome-name');
  
  if (userNameEl) userNameEl.textContent = username;
  if (userEmailEl) userEmailEl.textContent = email;
  if (welcomeNameEl) welcomeNameEl.textContent = username;
  
  // 設置用戶頭像
  const firstChar = username.charAt(0) || '測';
  if (userAvatarEl) userAvatarEl.textContent = firstChar;
}

/**
 * 初始化視圖
 */
function initializeView() {
  switchView('dashboard');
}

/**
 * 切換側邊欄
 */
function toggleSidebar() {
  if (sidebarOpen) {
    closeSidebar();
  } else {
    openSidebar();
  }
}

/**
 * 開啟側邊欄
 */
function openSidebar() {
  if (elements.sidebar) {
    elements.sidebar.classList.add('open');
    sidebarOpen = true;
  }
}

/**
 * 關閉側邊欄
 */
function closeSidebar() {
  if (elements.sidebar) {
    elements.sidebar.classList.remove('open');
    sidebarOpen = false;
  }
}

/**
 * 切換用戶選單
 */
function toggleUserMenu() {
  if (elements.userMenu) {
    if (elements.userMenu.classList.contains('show')) {
      closeUserMenu();
    } else {
      openUserMenu();
    }
  }
}

/**
 * 開啟用戶選單
 */
function openUserMenu() {
  if (elements.userMenu) {
    elements.userMenu.classList.add('show');
  }
}

/**
 * 關閉用戶選單
 */
function closeUserMenu() {
  if (elements.userMenu) {
    elements.userMenu.classList.remove('show');
  }
}

/**
 * 響應式處理
 */
function handleResize() {
  if (window.innerWidth > 768) {
    // 桌面版：確保側邊欄顯示
    if (elements.sidebar) {
      elements.sidebar.classList.remove('open');
    }
    sidebarOpen = false;
  }
}

/**
 * 鍵盤快捷鍵處理
 */
function handleKeyDown(e) {
  // ESC 鍵關閉選單
  if (e.key === 'Escape') {
    closeUserMenu();
    if (window.innerWidth <= 768) {
      closeSidebar();
    }
  }
  
  // Ctrl/Cmd + K 聚焦搜尋框
  if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
    e.preventDefault();
    const searchInput = document.querySelector('.search-box input');
    if (searchInput) {
      searchInput.focus();
    }
  }
  
  // 數字鍵快速切換視圖
  if (e.key >= '1' && e.key <= '6' && !e.ctrlKey && !e.altKey && !e.metaKey) {
    const views = ['dashboard', 'projects', 'workflows', 'models', 'deploy', 'monitor'];
    const viewIndex = parseInt(e.key) - 1;
    if (views[viewIndex]) {
      switchView(views[viewIndex]);
    }
  }
}

/**
 * 顯示即將推出訊息
 */
function showComingSoon() {
  // 創建更美觀的通知
  showNotification('🚧 功能開發中', '這個功能正在努力開發中，敬請期待！', 'info');
}

/**
 * 顯示通知
 */
function showNotification(title, message, type = 'info') {
  // 移除現有通知
  const existingNotification = document.querySelector('.notification');
  if (existingNotification) {
    existingNotification.remove();
  }
  
  // 創建通知元素
  const notification = document.createElement('div');
  notification.className = `notification notification-${type}`;
  notification.innerHTML = `
    <div class="notification-content">
      <div class="notification-header">
        <strong>${title}</strong>
        <button class="notification-close" onclick="closeNotification()">&times;</button>
      </div>
      <div class="notification-message">${message}</div>
    </div>
  `;
  
  // 添加樣式
  addNotificationStyles();
  
  // 添加到頁面
  document.body.appendChild(notification);
  
  // 動畫顯示
  setTimeout(() => {
    notification.classList.add('show');
  }, 10);
  
  // 自動關閉
  setTimeout(() => {
    closeNotification();
  }, 4000);
}

/**
 * 關閉通知
 */
function closeNotification() {
  const notification = document.querySelector('.notification');
  if (notification) {
    notification.classList.add('hide');
    setTimeout(() => {
      notification.remove();
    }, 300);
  }
}

/**
 * 添加通知樣式
 */
function addNotificationStyles() {
  if (document.querySelector('#notification-styles')) return;
  
  const style = document.createElement('style');
  style.id = 'notification-styles';
  style.textContent = `
    .notification {
      position: fixed;
      top: 20px;
      right: 20px;
      min-width: 320px;
      max-width: 400px;
      background: white;
      border-radius: 8px;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
      z-index: 1000;
      opacity: 0;
      transform: translateX(100%);
      transition: all 0.3s ease;
    }
    
    .notification.show {
      opacity: 1;
      transform: translateX(0);
    }
    
    .notification.hide {
      opacity: 0;
      transform: translateX(100%);
    }
    
    .notification-info {
      border-left: 4px solid #06b6d4;
    }
    
    .notification-success {
      border-left: 4px solid #10b981;
    }
    
    .notification-warning {
      border-left: 4px solid #f59e0b;
    }
    
    .notification-error {
      border-left: 4px solid #ef4444;
    }
    
    .notification-content {
      padding: 16px;
    }
    
    .notification-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
    }
    
    .notification-header strong {
      font-size: 0.9rem;
      color: #1e293b;
    }
    
    .notification-close {
      background: none;
      border: none;
      font-size: 18px;
      color: #94a3b8;
      cursor: pointer;
      padding: 0;
      width: 20px;
      height: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    .notification-close:hover {
      color: #64748b;
    }
    
    .notification-message {
      font-size: 0.85rem;
      color: #64748b;
      line-height: 1.4;
    }
    
    @media (max-width: 768px) {
      .notification {
        top: 10px;
        right: 10px;
        left: 10px;
        min-width: auto;
        max-width: none;
      }
    }
  `;
  document.head.appendChild(style);
}

/**
 * 登出功能
 */
function logout() {
  // 顯示確認對話框
  if (confirm('確定要登出嗎？')) {
    // 清除本地儲存
    localStorage.removeItem('username');
    localStorage.removeItem('email');
    localStorage.removeItem('loginTime');
    
    // 顯示登出通知
    showNotification('登出成功', '感謝使用，再見！', 'success');
    
    // 延遲跳轉到登入頁面
    setTimeout(() => {
      window.location.href = 'login.html';
    }, 1000);
  }
}

/**
 * 工具函數 - 格式化時間
 */
function formatTime(date) {
  if (!date) return '-';
  const now = new Date();
  const target = new Date(date);
  const diff = now - target;
  
  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  
  if (minutes < 1) return '剛剛';
  if (minutes < 60) return `${minutes} 分鐘前`;
  if (hours < 24) return `${hours} 小時前`;
  if (days < 7) return `${days} 天前`;
  
  return target.toLocaleDateString('zh-TW');
}

/**
 * 工具函數 - 防抖
 */
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * 工具函數 - 節流
 */
function throttle(func, limit) {
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
}

/**
 * 監聽視窗焦點變化
 */
document.addEventListener('visibilitychange', function() {
  if (document.visibilityState === 'visible') {
    // 頁面重新獲得焦點時檢查登入狀態
    checkLoginStatus();
  }
});

/**
 * 處理頁面載入完成
 */
window.addEventListener('load', function() {
  // 頁面載入完成後的額外處理
  console.log('南臺科技大學AI視覺訓練平台已載入');
  
  // 檢查是否有歡迎訊息需要顯示
  const loginTime = localStorage.getItem('loginTime');
  if (loginTime) {
    const loginDate = new Date(loginTime);
    const now = new Date();
    const timeDiff = now - loginDate;
    
    // 如果是在5分鐘內登入的，顯示歡迎訊息
    if (timeDiff < 5 * 60 * 1000) {
      setTimeout(() => {
        showNotification('歡迎回來！', '開始您的AI視覺訓練之旅吧', 'success');
      }, 1000);
    }
  }
});

// 暴露全域函數
window.showComingSoon = showComingSoon;
window.logout = logout;
window.closeNotification = closeNotification;
window.startTutorial = startTutorial;
window.startDataCollection = startDataCollection;
window.uploadModel = uploadModel;
window.backToWorkflows = backToWorkflows;