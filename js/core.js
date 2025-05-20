// core.js - 核心功能集合

/**
 * EasyYOLO - 視覺化機器學習教學平台 
 * 核心功能模組
 */

// 全域變數和狀態
let isMessageShowing = false;
let currentUser = {
  name: "",
  email: "",
  avatar: ""
};

// 當DOM載入後初始化應用
document.addEventListener('DOMContentLoaded', function() {
  initApp();
});

// 初始化應用程式
function initApp() {
  checkLoginStatus();
  loadUserInfo();
  setupSidebarMenu();
  setupPopups();
  setupComingSoonHandlers();
  
  // 檢查是否在主頁面
  const mainContentArea = document.getElementById('mainContentArea');
  if (mainContentArea) {
    // 檢查URL參數
    const urlParams = new URLSearchParams(window.location.search);
    const viewParam = urlParams.get('view');
    
    if (viewParam === 'workflows') {
      window.location.href = 'pages/workflow.html';
    } else {
      showView('projects', document.getElementById('projects-link'));
    }
  } else {
    markCurrentPage();
  }

  // 監聽文檔點擊關閉彈出窗口
  document.addEventListener('click', closePopups);
}

// 檢查登入狀態
function checkLoginStatus() {
  const isLoginPage = window.location.pathname.includes('login.html');
  const hasUserInfo = localStorage.getItem("username");
  
  if (!isLoginPage && !hasUserInfo) {
    window.location.href = "login.html";
    return false;
  }
  return true;
}

// 載入用戶信息
function loadUserInfo() {
  currentUser.name = localStorage.getItem("username") || "測試帳戶";
  currentUser.email = localStorage.getItem("email") || "test@demo.com";
  currentUser.avatar = currentUser.name.charAt(0) || "測";
  
  document.querySelectorAll("#user-name, #menu-username").forEach(el => {
    if (el.id === "user-name") {
      el.innerHTML = `<strong>${currentUser.name}</strong>`;
    } else {
      el.textContent = currentUser.name;
    }
  });
  
  document.querySelectorAll("#user-email, #menu-email").forEach(el => {
    el.textContent = currentUser.email;
  });
  
  document.querySelectorAll("#user-avatar").forEach(el => {
    el.textContent = currentUser.avatar;
  });
}

// 設置側邊欄選單事件
function setupSidebarMenu() {
  document.querySelectorAll('.sidebar-menu li').forEach(li => {
    li.addEventListener('click', (event) => {
      const viewName = li.getAttribute('data-view');
      
      if (viewName === 'coming-soon') {
        event.stopPropagation();
        showComingSoonMessage();
        return;
      }
      
      // 工作流和專案的特殊處理
      if (viewName === 'workflows') {
        navigateTo('pages/workflow.html');
        return;
      }
      
      if (viewName === 'projects') {
        const currentPath = window.location.pathname;
        
        if (currentPath.includes('index.html') || currentPath.endsWith('/')) {
          showView('projects', li);
        } else {
          navigateTo('index.html');
        }
        return;
      }
      
      // 其他導航
      if (viewName) {
        navigateTo(`${viewName}.html`);
      }
    });
  });
}

// 設置即將推出功能的處理程序
function setupComingSoonHandlers() {
  // 清除事件監聽器並重新綁定
  document.querySelectorAll('.show-coming-soon').forEach(el => {
    const clone = el.cloneNode(true);
    el.parentNode.replaceChild(clone, el);
  });
  
  document.querySelectorAll('[data-view="coming-soon"]').forEach(el => {
    el.classList.add('show-coming-soon');
    el.removeAttribute('data-view');
  });
  
  document.querySelectorAll('.show-coming-soon').forEach(el => {
    el.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      showComingSoonMessage();
    });
  });
}

// 設置彈出窗口事件
function setupPopups() {
  document.querySelectorAll('[data-popup]').forEach(el => {
    el.addEventListener('click', (e) => {
      const popupId = el.getAttribute('data-popup');
      togglePopup(popupId, el);
      e.stopPropagation();
    });
  });
}

// 切換彈出窗口
function togglePopup(id, anchor) {
  const popup = document.getElementById(id);
  if (!popup) return;
  
  const isVisible = popup.style.display === 'block';
  
  // 隱藏所有彈出窗口
  document.querySelectorAll('.settings-popup, #account-menu').forEach(p => p.style.display = 'none');
  
  if (!isVisible) {
    popup.style.visibility = 'hidden';
    popup.style.display = 'block';
    
    const rect = anchor.getBoundingClientRect();
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const popupWidth = popup.offsetWidth;
    const popupHeight = popup.offsetHeight;
    const screenHeight = window.innerHeight;
    
    const top = Math.max(10, Math.min(rect.top + rect.height / 2 - popupHeight / 2 + scrollTop, window.innerHeight - popupHeight - 10));
    const left = 260 + 10; // 側邊欄寬度 + 間距
    
    popup.style.top = `${top}px`;
    popup.style.left = `${left}px`;
    popup.style.maxHeight = `${screenHeight - 40}px`;
    popup.style.overflowY = 'auto';
    popup.style.visibility = 'visible';
    
    // 初始化彈窗中的即將推出功能處理程序
    setupComingSoonInPopup(popup);
  }
}

// 彈窗中設置即將推出功能處理程序
function setupComingSoonInPopup(popup) {
  const comingSoonItems = popup.querySelectorAll('[data-view="coming-soon"]');
  comingSoonItems.forEach(item => {
    item.classList.add('show-coming-soon');
    item.removeAttribute('data-view');
    item.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      showComingSoonMessage();
    });
  });
}

// 關閉彈出窗口
function closePopups(e) {
  const accountMenu = document.getElementById('account-menu');
  const settingsPopup = document.getElementById('settings-popup');
  const userInfo = document.querySelector('.user-info');
  const settingsToggle = document.getElementById('settings-toggle');

  const isClickInsideAccount = accountMenu && (accountMenu.contains(e.target) || (userInfo && userInfo.contains(e.target)));
  const isClickInsideSettings = settingsPopup && (settingsPopup.contains(e.target) || (settingsToggle && settingsToggle.contains(e.target)));

  if (accountMenu && !isClickInsideAccount) accountMenu.style.display = 'none';
  if (settingsPopup && !isClickInsideSettings) settingsPopup.style.display = 'none';
}

// 設置顯示當前頁面
function markCurrentPage() {
  const currentPath = window.location.pathname;
  
  // 移除所有活動標記
  document.querySelectorAll('.sidebar-menu li').forEach(li => {
    li.classList.remove('active');
  });
  
  // 根據當前頁面設置活動標記
  const pathMap = {
    'create-project.html': 'projects-link',
    'upload.html': 'projects-link',
    'tutorial.html': 'workflows-link',
    'tutorial-detail.html': 'workflows-link',
    'workflow.html': 'workflows-link'
  };
  
  // 檢查當前路徑是否在映射表中
  for (const path in pathMap) {
    if (currentPath.includes(path)) {
      const linkId = pathMap[path];
      const element = document.getElementById(linkId);
      if (element) element.classList.add('active');
      return;
    }
  }
  
  // 如果是主頁
  if (currentPath.includes('index.html') || currentPath.endsWith('/')) {
    const urlParams = new URLSearchParams(window.location.search);
    const viewParam = urlParams.get('view');
    
    if (viewParam === 'workflows') {
      const workflowsLink = document.getElementById('workflows-link');
      if (workflowsLink) workflowsLink.classList.add('active');
    } else {
      const projectsLink = document.getElementById('projects-link');
      if (projectsLink) projectsLink.classList.add('active');
    }
  }
}

// 視圖模板
const viewTemplates = {
  projects: `
    <section class="workspace-container card animated fade-slide">
      <img src="./icon/01.png" alt="沒有專案">
      <h2>此工作區中沒有專案。</h2>
      <p>建立專案並上傳圖像以開始標註、訓練和部署您的電腦視覺模型。</p>
      <div>
        <a href="pages/create-project.html" class="btn btn-primary"><i class="fas fa-plus-circle"></i> 新增專案</a>
        <a href="#" class="btn btn-secondary show-coming-soon"><i class="fas fa-book-open"></i> 檢視教學</a>
      </div>
    </section>
  `
};

// 顯示視圖
function showView(viewName, element) {
  setActiveLink(element);
  
  if (viewName === 'coming-soon') {
    showComingSoonMessage();
    return;
  }
  
  // 如果是workflows視圖，導航到workflow.html
  if (viewName === 'workflows') {
    navigateTo('pages/workflow.html');
    return;
  }
  
  const mainContentArea = document.getElementById('mainContentArea');
  if (!mainContentArea) return;
  
  if (viewTemplates[viewName]) {
    mainContentArea.innerHTML = viewTemplates[viewName];
    
    // 添加動畫類
    const newContent = mainContentArea.querySelector('.animated');
    if (newContent) {
      setTimeout(() => newContent.classList.add('fadeSlideUp'), 0);
    }

    // 設置新視圖中的 coming-soon 元素事件
    setupComingSoonHandlers();
  }
}

// 設置活動連結
function setActiveLink(element) {
  document.querySelectorAll('.sidebar-menu li').forEach(li => li.classList.remove('active'));
  if (element) element.classList.add('active');
}

// 顯示即將推出訊息
function showComingSoonMessage() {
  // 檢查是否已經顯示彈窗
  if (isMessageShowing) return;
  
  isMessageShowing = true;
  alert("🚧 功能尚未開放\n這個功能目前仍在開發中，敬請期待！\n若您認同本平台推廣 AI 教育的理念，歡迎小額贊助支持我們持續優化系統功能。❤️\n\n🔗 點我捐款支持");
  isMessageShowing = false;
}

// 頁面導航
function navigateTo(page) {
  window.location.href = page;
}

// 登出
function logout() {
  localStorage.clear();
  navigateTo("login.html");
}

// 創建專案
function createProject() {
  const projectName = document.getElementById('project-name').value.trim();
  const annotationGroup = document.getElementById('annotation-group').value.trim();
  const license = document.getElementById('license').value;
  
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
    // 儲存專案資訊到本地存儲
    const projectInfo = {
      name: projectName,
      annotationGroup: annotationGroup,
      license: license,
      type: projectType,
      createdAt: new Date().toISOString()
    };
    
    localStorage.setItem('currentProject', JSON.stringify(projectInfo));
    
    // 跳轉到上傳頁面
    navigateTo('pages/upload.html');
  } else {
    // 對於其他專案類型，顯示彈窗
    showComingSoonMessage();
  }
}

// 導出公共函數
window.checkLoginStatus = checkLoginStatus;
window.loadUserInfo = loadUserInfo;
window.showComingSoonMessage = showComingSoonMessage;
window.navigateTo = navigateTo;
window.logout = logout;
window.createProject = createProject;