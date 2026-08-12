# 修改日志

## 2026-08-12 — 邮箱登录、购物车、收货地址、结算功能

### hnyzu-buy-server（新建 Cloudflare Worker 后端）

- 初始化 Cloudflare Worker 项目（Hono + D1 + TypeScript）
- 添加 `wrangler.toml`、`package.json`、D1 数据库迁移 `migrations/0001_init.sql`
- 实现 API：
  - **认证**：`POST /api/auth/send-code`（发送邮箱验证码）、`POST /api/auth/verify`（验证并登录/注册）、`GET /api/auth/me`、`PATCH /api/auth/profile`
  - **商品**：`GET /api/products`
  - **购物车**：`GET/POST/PATCH/DELETE /api/cart`
  - **收货地址**：`GET/POST/PATCH/DELETE /api/addresses`、`POST /api/addresses/:id/default`
  - **订单**：`POST /api/orders/checkout`、`GET /api/orders`
- 开发模式（`DEV_MODE=true`）下验证码会在 API 响应中返回 `devCode`，便于本地测试
- 支付方式支持：银行转账（`bank_transfer`）
- 预置 4 个商品数据（与首页产品对应）

### hnyzu-buy（前端电商功能）

- 新增 `js/api.js` — API 客户端、认证、购物车角标、Toast 提示
- 新增 `css/shop.css` — 购物相关样式
- 新增页面：
  - `account.html` — 邮箱登录/注册、收货地址管理、订单列表、个人资料
  - `cart.html` — 购物车（修改数量、删除、去结算）
  - `checkout.html` — 选择收货地址、支付方式、提交订单
- 更新 `index.html`：
  - 导航栏增加登录按钮和购物车图标
  - 产品卡片增加价格显示、「加入购物车」「立即购买」按钮
  - 集成 API 加载商品价格

### 本地开发

```bash
# 后端
cd hnyzu-buy-server
npm install
npm run db:migrate:local
npm run dev
# API: http://localhost:8787

# 前端：用 Live Server 或任意静态服务器打开 hnyzu-buy 目录
# 确保 index.html 中 meta api-base 指向 http://localhost:8787
```

### 部署说明

1. 创建 Cloudflare D1 数据库并更新 `wrangler.toml` 中的 `database_id`
2. 设置 secrets：`wrangler secret put JWT_SECRET`、`wrangler secret put RESEND_API_KEY`（可选）
3. 生产环境将 `DEV_MODE` 设为 `false`，配置 `ALLOWED_ORIGINS` 包含 `https://eraworks.vn`
4. 前端生产环境将 `meta name="api-base"` 改为 Worker 域名（如 `https://api.eraworks.vn`）

## 2026-08-12 — Resend 邮件 + 部署配置

### hnyzu-buy-server

- 新增 `.dev.vars`（本地 Resend + JWT，已加入 `.gitignore`）
- 新增 `.dev.vars.example` 模板
- 新增 `DEPLOY.md` 完整部署步骤文档
- `wrangler.toml` 增加 `[env.production]` 生产环境配置
- `npm run deploy` 改为部署 production 环境

### 说明

- 本地 `npm run dev` 会自动读取 `.dev.vars` 中的 `RESEND_API_KEY` 发送真实邮件
- 生产环境通过 `wrangler secret put RESEND_API_KEY --env production` 配置，不写入代码仓库

## 2026-08-12 — 更新 Resend API Key

### hnyzu-buy-server

- 更新 `.dev.vars` 中的 `RESEND_API_KEY`（本地开发）
- 若已部署生产，需手动执行：`npx wrangler secret put RESEND_API_KEY --env production`

## 2026-08-12 — 产品卡片购买数量角标

### hnyzu-buy

- `index.html`：「立即购买」按钮右上角增加红色数量角标（显示该商品在购物车中的数量）
- `js/api.js`：新增 `updateProductQtyBadges()`，加购/页面加载时同步更新各产品角标

## 2026-08-12 — 加入购物车数量选择弹窗

### hnyzu-buy

- `index.html`：点击「加入购物车」时弹出数量选择框（± 调整、1–99），确认后再加入购物车
- 支持越/中/英三语弹窗文案；Esc 关闭，Enter 确认

## 2026-08-12 — 购物车/结算页「继续购买」按钮

### hnyzu-buy

- `cart.html`：结算区域增加「继续购买」按钮，返回首页产品区
- `checkout.html`：提交订单按钮下方增加「继续购买」按钮

## 2026-08-12 — 统一购物/结算页顶部导航

### hnyzu-buy

- 新增 `css/site-header.css`、`js/site-header.js` 共用顶部导航（与 index.html 一致：Logo、导航链接、登录、购物车、语言切换、移动端菜单）
- `cart.html`、`checkout.html` 改用共用 header

## 2026-08-12 — 修复切换语言后用户名被覆盖

### hnyzu-buy

- `js/api.js`：统一 `updateUserBtn()`，已登录时始终显示用户名
- `index.html`：`setLang` 跳过 `#userBtn`，切换语言后调用 `updateUserBtn` 恢复
- `js/site-header.js`：移除 `#userBtn` 的 `data-i18n`，避免被 i18n 覆盖

## 2026-08-12 — 移除货到付款（COD）

### hnyzu-buy

- `checkout.html`：结算页仅保留银行转账方式
- `account.html`：订单列表支付方式显示为银行转账

### hnyzu-buy-server

- `src/routes/orders.ts`：仅接受 `bank_transfer` 支付方式

## 2026-08-12 — 结算页收款账户信息

### hnyzu-buy

- `checkout.html`：支付方式下方展示 Vietcombank 收款账户（公司名、账号 1069683613）
- 下单成功页同步显示账户信息及订单号转账提示

## 2026-08-12 — 数量弹窗支持减至 0

### hnyzu-buy

- `index.html`：数量选择弹窗允许减到 0（最小值 0）；打开时预填购物车已有数量；确认 0 时若购物车已有该商品则移除

## 2026-08-12 — 修复未登录时切换语言登录按钮不变

### hnyzu-buy

- `index.html`：`setLang` 内直接更新登录按钮文案，不依赖模块加载顺序
- `js/api.js`：`updateUserBtn(lang)` 支持传入当前语言
- `js/site-header.js`：切换语言时传入 `lang` 参数

## 2026-08-12 — 顶部 Logo 按语言切换

### hnyzu-buy

- 新增 `img/logo-zh.png`（新纪元科技）、`img/logo-en.png`、`img/logo-vi.png`（英/越暂用 biglogo，可替换）
- 顶部导航文字 Logo 改为图片，切换语言时自动换图
- `js/api.js` 新增 `updateHeaderLogo(lang)`
- 首页、购物车、结算、账户页统一使用语言 Logo

## 2026-08-12 — 购物车/结算页切换语言即时翻译

### hnyzu-buy

- `js/site-header.js`：`initSiteHeader({ onLangChange })` 支持页面语言回调
- `cart.html`：切换语言后立即重渲染购物车（不等待 API）
- `checkout.html`：切换语言后立即重渲染结算表单与商品名

## 2026-08-12 — 修复结算页报错 & 首页价格 fallback

### hnyzu-buy

- `checkout.html`：修复 `t is not a function`（翻译函数改为 `getText()`）
- `index.html`：API 加载失败时使用本地 fallback 价格，避免显示「—」

