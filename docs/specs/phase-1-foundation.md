# 阶段 1：项目初始化和基础配置

**阶段编号：** phase-1
**创建日期：** 2026-03-07
**状态：** 已完成
**依赖阶段：** 无

---

## 阶段目标

搭建 Next.js 项目基础架构，配置开发环境，创建项目目录结构，安装核心依赖包。

---

## 功能需求

### 需求 1：初始化 Next.js 项目

**描述：**
使用 Next.js 14 App Router 创建项目，配置 TypeScript 和 TailwindCSS，清理默认模板内容。

**涉及文件：**
- `package.json`
- `tsconfig.json`
- `tailwind.config.ts`
- `next.config.js`
- `app/page.tsx`
- `app/layout.tsx`
- `app/globals.css`

**验收标准：**
- [x] Next.js 项目成功创建
- [x] TypeScript 配置正确
- [x] TailwindCSS 正常工作
- [x] 开发服务器可以启动（`npm run dev`）
- [x] 默认内容已清理

---

### 需求 2：创建项目目录结构

**描述：**
创建博客系统所需的目录结构，包括内容存储、图片存储、脚本、组件和工具库目录。

**涉及文件：**
- `content/posts/.gitkeep`
- `public/images/.gitkeep`
- `scripts/.gitkeep`
- `src/components/.gitkeep`
- `src/lib/.gitkeep`
- `src/types/.gitkeep`
- `sync-state.json`
- `.gitignore`

**验收标准：**
- [x] 所有目录创建成功
- [x] `.gitkeep` 文件已添加
- [x] `sync-state.json` 初始化完成
- [x] `.gitignore` 配置正确

---

### 需求 3：安装核心依赖

**描述：**
安装 Markdown 渲染、飞书 SDK、搜索功能等核心依赖包。

**涉及文件：**
- `package.json`
- `package-lock.json`

**验收标准：**
- [x] Markdown 相关依赖安装成功（react-markdown, remark-gfm, rehype-highlight, rehype-raw, gray-matter）
- [x] 搜索和工具库安装成功（flexsearch, date-fns）
- [x] 飞书 SDK 安装成功（@larksuiteoapi/node-sdk, axios）
- [x] 所有依赖无冲突，`npm list` 无错误

---

## 技术要求

### 技术栈
- Next.js 14+：使用 App Router
- TypeScript 5：类型安全
- TailwindCSS 4：样式方案
- React 19：UI 框架

### 技术约束
- 必须使用 App Router（不使用 Pages Router）
- 必须使用 TypeScript（不使用 JavaScript）
- 路径别名使用 `@/*` 指向根目录
- 不使用 `src/` 目录（App Router 直接放在根目录）

### 性能要求
- 开发服务器启动时间 < 5 秒
- 依赖安装时间 < 2 分钟

---

## 实施注意事项

1. 使用 `npx create-next-app@latest` 创建项目，确保版本是 14+
2. 选择正确的配置选项：TypeScript、ESLint、TailwindCSS、App Router
3. 清理默认内容时保留必要的配置文件
4. `.gitignore` 需要添加同步临时文件、环境变量、构建输出等
5. `sync-state.json` 初始化为空对象结构

---

## 风险点

| 风险 | 影响 | 应对方案 |
|------|------|----------|
| Next.js 版本不兼容 | 高 | 明确指定版本号，使用 `@latest` 标签 |
| 依赖安装失败 | 中 | 检查网络连接，使用国内镜像源 |
| 路径别名配置错误 | 中 | 验证 `tsconfig.json` 中的 paths 配置 |

---

## 验收标准

### 功能验收
- [x] 项目成功创建，目录结构完整
- [x] 开发服务器可以正常启动
- [x] 所有依赖安装成功，无错误
- [x] 可以访问 http://localhost:3000

### 代码质量
- [x] 无 TypeScript 类型错误
- [x] 无 ESLint 警告
- [x] 代码符合项目规范

### 文档完整性
- [x] `.gitignore` 配置完整
- [x] `sync-state.json` 格式正确

---

## 参考资料

- [Next.js 文档](https://nextjs.org/docs)
- [TailwindCSS 文档](https://tailwindcss.com/docs)
- [TypeScript 文档](https://www.typescriptlang.org/docs)
