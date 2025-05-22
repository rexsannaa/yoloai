// js/app.js - 核心應用邏輯

/**
 * 南臺科技大學AI視覺訓練平台 - 核心功能模組
 * 提供統一的側邊欄、用戶資訊和彈出視窗功能
 */

let isMessageShowing = false;

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
  
  // 檢查主內容區域
  const mainContentArea = document.getElementById('mainContentArea');
  if (!mainContentArea) return;
  
  if (viewTemplates[viewName]) {
    mainContentArea.innerHTML = viewTemplates[viewName];
    
    const newContent = mainContentArea.querySelector('.animated');
    if (newContent) {
      setTimeout(() => newContent.classList.add('fadeSlideUp'), 0);
    }

    setupComingSoonHandlers();
  }
}

// 顯示即將推出訊息
function showComingSoonMessage() {
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
  
  const selectedType = document.querySelector('.project-type-option.selected');
  if (!selectedType) {
    alert('請選擇專案類型！');
    return;
  }
  
  const projectType = selectedType.getAttribute('data-type');
  
  if (projectType === 'object-detection') {
    const projectInfo = {
      name: projectName,
      annotationGroup: annotationGroup,
      license: license,
      type: projectType,
      createdAt: new Date().toISOString()
    };
    
    localStorage.setItem('currentProject', JSON.stringify(projectInfo));
    navigateTo('upload.html');
  } else {
    showComingSoonMessage();
  }
}
  if (mainContentArea) {
    const urlParams = new URLSearchParams(window.location.search);
    const viewParam = urlParams.get('view');
    
    if (viewParam === 'workflows') {
      window.location.href = 'workflow.html';
    } else {
      showView('projects', document.getElementById('projects-link'));
    }
  } else {
    markCurrentPage();
  }

  document.addEventListener('click', closePopups);
}

// 設置即將推出功能的處理程序
function setupComingSoonHandlers() {
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

// 檢查登入狀態
function checkLoginStatus() {
  const isLoginPage = window.location.pathname.includes('login.html');
  const hasUserInfo = localStorage.getItem("username");
  
  if (!isLoginPage && !hasUserInfo) {
    window.location.href = "login.html";
  }
}

// 載入用戶信息
function loadUserInfo() {
  const name = localStorage.getItem("username") || "測試帳戶";
  const email = localStorage.getItem("email") || "test@demo.com";
  
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
  
  const firstChar = name.charAt(0) || "測";
  userAvatarElements.forEach(el => {
    el.textContent = firstChar;
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
      
      if (viewName === 'workflows') {
        window.location.href = 'workflow.html';
        return;
      }
      
      if (viewName === 'projects') {
        const currentPath = window.location.pathname;
        
        if (currentPath.includes('index.html') || currentPath.endsWith('/')) {
          showView('projects', li);
        } else {
          window.location.href = 'index.html';
        }
        return;
      }
      
      if (viewName) {
        navigateTo(`${viewName}.html`);
      }
    });
  });
}

// 設置顯示當前頁面
function markCurrentPage() {
  const currentPath = window.location.pathname;
  
  document.querySelectorAll('.sidebar-menu li').forEach(li => {
    li.classList.remove('active');
  });
  
  if (currentPath.includes('create-project.html') || currentPath.includes('upload.html')) {
    const projectsLink = document.getElementById('projects-link');
    if (projectsLink) projectsLink.classList.add('active');
  } else if (currentPath.includes('tutorial.html') || currentPath.includes('workflow.html')) {
    const workflowsLink = document.getElementById('workflows-link');
    if (workflowsLink) workflowsLink.classList.add('active');
  } else if (currentPath.includes('index.html') || currentPath.endsWith('/')) {
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

// 設置活動連結
function setActiveLink(element) {
  document.querySelectorAll('.sidebar-menu li').forEach(li => li.classList.remove('active'));
  if (element) element.classList.add('active');
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
    const left = 260 + 10;
    
    popup.style.top = `${top}px`;
    popup.style.left = `${left}px`;
    popup.style.maxHeight = `${screenHeight - 40}px`;
    popup.style.overflowY = 'auto';
    popup.style.visibility = 'visible';
    
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

// 視圖模板
const viewTemplates = {
  projects: `
    <section class="workspace-container card animated fade-slide">
      <img src="./icon/01.png" alt="沒有專案">
      <h2>此工作區中沒有專案。</h2>
      <p>建立專案並上傳圖像以開始標註、訓練和部署您的電腦視覺模型。</p>
      <div>
        <a href="create-project.html" class="btn btn-primary"><i class="fas fa-plus-circle"></i> 新增專案</a>
        <a href="tutorial.html" class="btn btn-secondary"><i class="fas fa-book-open"></i> 檢視教學</a>
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
  
  if (viewName === 'workflows') {
    window.location.href = 'workflow.html';
    return;
  }
  
  const mainContentArea = document.getElementById('mainContentArea');