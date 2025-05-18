// common.js - 統一功能模組

/**
 * 南臺科技大學AI視覺訓練平台 - 共用功能模組
 * 提供統一的側邊欄、用戶資訊和彈出視窗功能
 */

// 視圖模板 - 各頁面內容顯示
const viewTemplates = {
  projects: `
    <section class="workspace-container card animated fade-slide">
      <img src="./icon/01.png" alt="沒有專案">
      <h2>此工作區中沒有專案。</h2>
      <p>建立專案並上傳圖像以開始標註、訓練和部署您的電腦視覺模型。</p>
      <div>
        <a href="create-project.html" class="btn btn-primary"><i class="fas fa-plus-circle"></i> 新增專案</a>
        <a href="#" class="btn btn-secondary" data-view="coming-soon"><i class="fas fa-book-open"></i> 檢視教學</a>
      </div>
    </section>
  `,
  workflows: `
    <div class="workflow-page-container animated fade-slide">
      <div class="workflow-header">
        <h2><i class="fas fa-cogs" style="margin-right: 10px;"></i>Workflows 工作流程</h2>
        <div class="workflow-actions">
          <input type="text" class="search-bar" placeholder="&#xF002; Search workflows...">
          <a href="#" class="btn btn-outline" style="margin-right: 10px;" data-view="coming-soon"><i class="fas fa-layer-group"></i> Explore templates</a>
          <a href="#" class="btn btn-primary" data-view="coming-soon"><i class="fas fa-plus"></i> Create Workflow</a>
        </div>
      </div>
      <div class="workflow-content">
        <div class="workflow-grid">
          <div class="workflow-card">
            <div class="workflow-card-header">
              <h3>Custom Workflow 自訂工作流程</h3>
              <i class="fas fa-ellipsis-h" data-view="coming-soon"></i>
            </div>
            <div class="workflow-card-image-placeholder" style="padding: 10px;">
              <img src="./icon/02.png" alt="Custom Workflow Icon" style="max-width: 100%; max-height: 100%; object-fit: contain;">
            </div>
            <p>點擊以編輯或查看此自訂工作流程的詳細資訊。</p>
          </div>
        </div>
      </div>
    </div>
  `
};

// 初始化應用程式
function initApp() {
  // 檢查登入狀態
  checkLoginStatus();
  
  // 載入用戶信息
  loadUserInfo();
  
  // 設置側邊欄選單事件
  setupSidebarMenu();
  
  // 設置彈出窗口事件
  setupPopups();
  
  // 設置來自URL參數的視圖顯示
  const urlParams = new URLSearchParams(window.location.search);
  const viewParam = urlParams.get('view');
  
  // 檢查是否有主內容區域
  const mainContentArea = document.getElementById('mainContentArea');
  if (mainContentArea) {
    // 根據URL參數顯示視圖
    if (viewParam === 'workflows') {
      showView('workflows', document.getElementById('workflows-link'));
    } else {
      // 默認顯示專案視圖
      showView('projects', document.getElementById('projects-link'));
    }
  } else {
    // 在非主頁設置當前頁面標記
    markCurrentPage();
  }

  // 設置 coming-soon 視圖觸發器
  document.querySelectorAll('[data-view="coming-soon"]').forEach(el => {
    el.addEventListener('click', (e) => {
      // 防止事件冒泡，避免多次觸發
      e.preventDefault();
      e.stopPropagation();
      showComingSoonMessage();
    });
  });

  // 點擊文檔關閉彈出窗口
  document.addEventListener('click', closePopups);
}

// 檢查登入狀態
function checkLoginStatus() {
  // 如果不是登入頁面，且沒有用戶信息，則重定向到登入頁面
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
  
  // 設置用戶頭像
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
        // 防止事件冒泡，避免多次觸發
        event.stopPropagation();
        showComingSoonMessage();
        return;
      }
      
      // 工作流和專案的特殊處理
      if (viewName === 'workflows') {
        // 檢查當前頁面
        const currentPath = window.location.pathname;
        
        if (currentPath.includes('index.html') || currentPath.endsWith('/')) {
          // 如果已經在index.html，則只顯示視圖
          showView('workflows', li);
        } else {
          // 導航到index.html並添加參數指定要顯示的視圖
          window.location.href = 'index.html?view=workflows';
        }
        return;
      }
      
      if (viewName === 'projects') {
        // 檢查當前頁面
        const currentPath = window.location.pathname;
        
        if (currentPath.includes('index.html') || currentPath.endsWith('/')) {
          // 如果已經在index.html，則只顯示視圖
          showView('projects', li);
        } else {
          // 導航到index.html
          window.location.href = 'index.html';
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

// 設置顯示當前頁面
function markCurrentPage() {
  // 獲取當前頁面路徑
  const currentPath = window.location.pathname;
  
  // 移除所有活動標記
  document.querySelectorAll('.sidebar-menu li').forEach(li => {
    li.classList.remove('active');
  });
  
  // 根據當前頁面設置活動標記
  if (currentPath.includes('create-project.html')) {
    const projectsLink = document.getElementById('projects-link');
    if (projectsLink) projectsLink.classList.add('active');
  } else if (currentPath.includes('index.html') || currentPath.endsWith('/')) {
    // 檢查URL參數，確定要顯示的視圖
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

// 顯示視圖
function showView(viewName, element) {
  setActiveLink(element);
  
  if (viewName === 'coming-soon') {
    showComingSoonMessage();
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
    mainContentArea.querySelectorAll('[data-view="coming-soon"]').forEach(el => {
      el.addEventListener('click', (e) => {
        e.preventDefault();
        showComingSoonMessage();
      });
    });
  }
}

// 顯示即將推出訊息
function showComingSoonMessage() {
  // 檢查是否已經顯示彈窗 (使用一個標誌變量避免重複彈窗)
  if (window.isShowingAlert) return;
  
  window.isShowingAlert = true;
  alert("🚧 功能尚未開放\n這個功能目前仍在開發中，敬請期待！\n若您認同本平台推廣 AI 教育的理念，歡迎小額贊助支持我們持續優化系統功能。❤️\n\n🔗 點我捐款支持");
  window.isShowingAlert = false;
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
  navigateTo('upload.html');
}

// 在頁面加載時初始化應用
document.addEventListener('DOMContentLoaded', initApp);