// js/login.js - 登入功能模組

/**
 * 登入頁面功能處理
 */

// DOM 元素
const elements = {
  form: null,
  username: null,
  password: null,
  loginBtn: null,
  spinner: null,
  errorMessage: null
};

// 初始化
document.addEventListener('DOMContentLoaded', function() {
  initElements();
  setupEventListeners();
  setupComingSoonHandlers();
});

/**
 * 初始化 DOM 元素
 */
function initElements() {
  elements.form = document.getElementById('login-form');
  elements.username = document.getElementById('username');
  elements.password = document.getElementById('password');
  elements.loginBtn = document.getElementById('login-btn');
  elements.spinner = document.getElementById('spinner');
  elements.errorMessage = document.getElementById('error-message');
}

/**
 * 設置事件監聽器
 */
function setupEventListeners() {
  // 表單提交事件
  if (elements.form) {
    elements.form.addEventListener('submit', handleFormSubmit);
  }
  
  // Enter 鍵登入
  [elements.username, elements.password].forEach(input => {
    if (input) {
      input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          handleLogin();
        }
      });
    }
  });
  
  // 登入按鈕點擊
  if (elements.loginBtn) {
    elements.loginBtn.addEventListener('click', (e) => {
      e.preventDefault();
      handleLogin();
    });
  }
  
  // 輸入時隱藏錯誤訊息
  [elements.username, elements.password].forEach(input => {
    if (input) {
      input.addEventListener('input', hideErrorMessage);
    }
  });
}

/**
 * 處理表單提交
 */
function handleFormSubmit(e) {
  e.preventDefault();
  handleLogin();
}

/**
 * 處理登入
 */
function handleLogin() {
  const username = elements.username?.value?.trim() || '';
  const password = elements.password?.value?.trim() || '';
  
  // 基本驗證
  if (!username && !password) {
    // 允許空帳號密碼快速登入（測試用）
    performLogin('測試帳戶');
    return;
  }
  
  // 隱藏錯誤訊息並顯示載入動畫
  hideErrorMessage();
  showLoading();
  
  // 模擬登入延遲
  setTimeout(() => {
    if (isValidLogin(username, password)) {
      const displayName = username || '測試帳戶';
      performLogin(displayName);
    } else {
      showError();
      hideLoading();
    }
  }, 800);
}

/**
 * 驗證登入資訊
 */
function isValidLogin(username, password) {
  // 允許空登入或正確的帳號密碼
  return !username || (username === 'admin' && password === 'stustai');
}

/**
 * 執行登入
 */
function performLogin(username) {
  // 儲存用戶資訊
  const email = username === '測試帳戶' ? 'test@demo.com' : `${username}@demo.com`;
  
  localStorage.setItem('username', username);
  localStorage.setItem('email', email);
  localStorage.setItem('loginTime', new Date().toISOString());
  
  // 顯示成功狀態
  showSuccess();
  
  // 延遲跳轉
  setTimeout(() => {
    window.location.href = 'index.html';
  }, 1000);
}

/**
 * 顯示載入動畫
 */
function showLoading() {
  if (elements.loginBtn && elements.spinner) {
    elements.loginBtn.disabled = true;
    elements.spinner.classList.add('show');
    
    const btnText = elements.loginBtn.querySelector('.btn-text');
    if (btnText) {
      btnText.textContent = '登入中...';
    }
  }
}

/**
 * 隱藏載入動畫
 */
function hideLoading() {
  if (elements.loginBtn && elements.spinner) {
    elements.loginBtn.disabled = false;
    elements.spinner.classList.remove('show');
    
    const btnText = elements.loginBtn.querySelector('.btn-text');
    if (btnText) {
      btnText.textContent = '登入';
    }
  }
}

/**
 * 顯示成功狀態
 */
function showSuccess() {
  if (elements.loginBtn) {
    elements.loginBtn.style.background = 'var(--success-color)';
    
    const btnText = elements.loginBtn.querySelector('.btn-text');
    if (btnText) {
      btnText.textContent = '登入成功';
    }
    
    if (elements.spinner) {
      elements.spinner.innerHTML = '<i class="fas fa-check"></i>';
    }
  }
}

/**
 * 顯示錯誤訊息
 */
function showError() {
  if (elements.errorMessage) {
    elements.errorMessage.classList.add('show');
    
    // 自動隱藏錯誤訊息
    setTimeout(hideErrorMessage, 3000);
  }
  
  // 添加輸入框錯誤樣式
  [elements.username, elements.password].forEach(input => {
    if (input) {
      input.style.borderColor = 'var(--error-color)';
      input.addEventListener('focus', () => {
        input.style.borderColor = '';
      }, { once: true });
    }
  });
}

/**
 * 隱藏錯誤訊息
 */
function hideErrorMessage() {
  if (elements.errorMessage) {
    elements.errorMessage.classList.remove('show');
  }
}

/**
 * 設置即將推出功能處理程序
 */
function setupComingSoonHandlers() {
  document.querySelectorAll('.show-coming-soon').forEach(el => {
    el.addEventListener('click', function(e) {
      e.preventDefault();
      showComingSoonMessage();
    });
  });
}

/**
 * 顯示即將推出訊息
 */
function showComingSoonMessage() {
  alert("🚧 功能尚未開放\n這個功能目前仍在開發中，敬請期待！");
}