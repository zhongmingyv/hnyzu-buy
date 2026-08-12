import { getLang, refreshCartBadge, updateUserBtn } from './api.js';

const HEADER_I18N = {
  vi: {
    companyShort: '<span style="color:#061E36">TÂN KỶ NGUYÊN</span> <span style="color:#04A8A1">TECH</span>',
    navProducts: 'Sản phẩm',
    navSoftware: 'Phần mềm',
    navWhy: 'Vì sao chọn chúng tôi',
    navContact: 'Liên hệ',
    navPolicy: 'Chính sách',
  },
  zh: {
    companyShort: '<span style="color:#061E36">新纪元</span><span style="color:#04A8A1">科技</span>',
    navProducts: '产品',
    navSoftware: '软件',
    navWhy: '为什么选择我们',
    navContact: '联系我们',
    navPolicy: '政策条款',
  },
  en: {
    companyShort: '<span style="color:#061E36">ERA</span><span style="color:#04A8A1">WORKS</span>',
    navProducts: 'Products',
    navSoftware: 'Software',
    navWhy: 'Why Us',
    navContact: 'Contact',
    navPolicy: 'Policies',
  },
};

function setHeaderLang(lang) {
  const dict = HEADER_I18N[lang] || HEADER_I18N.vi;
  document.documentElement.lang = lang;
  document.querySelectorAll('#siteHeader [data-i18n]').forEach(el => {
    const k = el.getAttribute('data-i18n');
    if (dict[k]) el.textContent = dict[k];
  });
  document.querySelectorAll('#siteHeader [data-i18n-html]').forEach(el => {
    const k = el.getAttribute('data-i18n-html');
    if (dict[k]) el.innerHTML = dict[k];
  });
  document.querySelectorAll('#siteHeader .lang-switch button').forEach(b => {
    b.classList.toggle('active', b.dataset.lang === lang);
  });
  try { localStorage.setItem('site_lang', lang); } catch {}
  updateUserBtn();
}

export function initSiteHeader() {
  const header = document.getElementById('siteHeader');
  if (!header) return;

  header.innerHTML = `
    <div class="container nav">
      <a href="index.html" class="logo">
        <img src="img/logo.png" alt="ERAWORKS" class="mark-img">
        <span data-i18n-html="companyShort"><span style="color:#061E36">TÂN KỶ NGUYÊN</span> <span style="color:#04A8A1">TECH</span></span>
      </a>
      <nav class="nav-links" id="navLinks">
        <a href="index.html#products" data-i18n="navProducts">Sản phẩm</a>
        <a href="index.html#software" data-i18n="navSoftware">Phần mềm</a>
        <a href="index.html#why" data-i18n="navWhy">Vì sao chọn chúng tôi</a>
        <a href="index.html#contact" data-i18n="navContact">Liên hệ</a>
        <a href="policy.html" data-i18n="navPolicy">Chính sách</a>
      </nav>
      <div class="nav-right">
        <div class="shop-nav-actions">
          <a href="account.html" class="user-menu-btn" id="userBtn">Đăng nhập</a>
          <a href="cart.html" class="shop-icon-btn" title="Cart">🛒<span class="cart-badge"></span></a>
        </div>
        <div class="lang-switch">
          <button type="button" data-lang="vi" class="active">VI</button>
          <button type="button" data-lang="zh">中文</button>
          <button type="button" data-lang="en">EN</button>
        </div>
        <button type="button" class="menu-btn" id="menuBtn" aria-label="Menu">☰</button>
      </div>
    </div>`;

  document.querySelectorAll('#siteHeader .lang-switch button').forEach(b => {
    b.addEventListener('click', () => setHeaderLang(b.dataset.lang));
  });

  document.getElementById('menuBtn')?.addEventListener('click', () => {
    document.getElementById('navLinks')?.classList.toggle('open');
  });

  document.querySelectorAll('#siteHeader #navLinks a').forEach(a => {
    a.addEventListener('click', () => document.getElementById('navLinks')?.classList.remove('open'));
  });

  setHeaderLang(getLang());
  refreshCartBadge();
}

export { setHeaderLang, updateUserBtn };
