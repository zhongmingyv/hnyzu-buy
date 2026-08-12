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
- 支付方式支持：银行转账（`bank_transfer`）、货到付款（`cod`）
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

