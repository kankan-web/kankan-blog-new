# 博客系统架构文档

**创建日期：** 2026-03-28
**版本：** 2.0（飞书机器人推送方案）
**状态：** 已确认

---

## 1. 系统总览

```
┌──────────────┐     ┌──────────────────┐     ┌──────────────┐     ┌──────────┐
│   飞书客户端   │────▶│  飞书机器人后端    │────▶│  GitHub 仓库  │────▶│  Vercel  │
│  @机器人+链接  │◀────│  (Serverless)     │     │  (Git push)  │     │ (自动部署)│
│              │ 卡片 │                  │     │              │     │          │
└──────────────┘     └──────────────────┘     └──────────────┘     └──────────┘
     用户操作            解析+转换+提交           静态内容存储          构建+托管
```

## 2. 核心流程

### 2.1 文章发布流程

```
1. 用户在飞书对话框 @博客助手 + 发送文档链接
2. 机器人接收消息，解析文档链接
3. 机器人通过飞书 API 读取文档标题
4. 机器人回复交互卡片（分类、标签、摘要可编辑）
5. 用户确认卡片信息，点击「确认同步」
6. 机器人执行：
   a. 通过飞书文档 API 获取完整 Block 结构
   b. 递归转换 Block → Markdown
   c. 下载文档中的图片 → MD5 哈希命名
   d. 生成 front matter（标题、日期、分类、标签、摘要）
   e. 通过 GitHub API 提交文件（Markdown + 图片）
7. Vercel 检测到 push → 自动构建部署
8. 机器人回复部署结果
```

### 2.2 文章更新流程

```
1. 用户 @博客助手 + 发送已同步过的文档链接
2. 机器人识别为更新操作（通过 slug 或文档 ID 匹配）
3. 回复卡片，展示当前分类/标签，允许修改
4. 用户确认后，机器人覆盖更新对应的 Markdown 文件
5. 自动部署
```

## 3. 技术架构

### 3.1 前端（博客站点）

| 项目 | 选型 |
|------|------|
| 框架 | Next.js 16 (App Router) |
| UI | React 19 + TailwindCSS 4 |
| 语言 | TypeScript 5 |
| 内容 | 静态 Markdown 文件（`content/posts/`） |
| 搜索 | FlexSearch（客户端搜索） |
| 评论 | Giscus（GitHub Discussions） |
| 部署 | Vercel（SSG 静态生成） |

### 3.2 后端（飞书机器人服务）

| 项目 | 选型 |
|------|------|
| 运行环境 | Vercel Serverless Functions 或独立服务 |
| 语言 | TypeScript / Node.js |
| 飞书 SDK | `@larksuiteoapi/node-sdk` |
| GitHub API | `@octokit/rest` 或 GitHub REST API |
| 消息格式 | 飞书消息卡片（Interactive Card） |

### 3.3 关键依赖

```
飞书开放平台 API
  ├── im.message.receive_v1 — 接收用户消息
  ├── docx.document.get — 获取文档内容
  ├── drive.media.download — 下载图片
  └── im.message.create — 发送卡片/回复

GitHub API
  ├── repos.contents.createOrUpdate — 创建/更新文件
  └── repos.git.* — Git Data API（批量提交）

Vercel
  └── Git Integration — 自动检测 push 并部署
```

## 4. 目录结构（更新后）

```
egg-blog/
├── app/                        # Next.js 页面
│   ├── page.tsx                # 首页（个人介绍）
│   ├── posts/                  # 文章相关页面
│   │   ├── page.tsx            # 文章列表页
│   │   └── [category]/[slug]/
│   │       └── page.tsx        # 文章详情页
│   ├── about/
│   │   └── page.tsx            # 关于页面
│   └── layout.tsx              # 根布局
├── components/                 # React 组件
│   ├── layout/                 # 布局组件（侧边栏、Header等）
│   ├── posts/                  # 文章相关组件
│   └── ui/                     # 通用 UI 组件
├── content/posts/              # Markdown 文章（按分类组织）
│   ├── 技术/
│   └── 生活/
├── lib/                        # 工具函数
│   ├── posts.ts                # 文章读取/处理
│   └── search.ts               # 搜索索引
├── public/images/              # 文章图片（按年月组织）
├── scripts/                    # 辅助脚本
├── types/                      # TypeScript 类型定义
├── docs/                       # 项目文档
│   ├── references/             # 参考文档（设计规范、架构）
│   ├── specs/                  # Slice 规格说明
│   ├── plans/                  # 执行计划
│   └── summaries/              # 执行总结
└── bot/                        # 飞书机器人后端服务（待创建）
    ├── src/
    │   ├── handler.ts          # 消息处理入口
    │   ├── feishu/             # 飞书 API 封装
    │   │   ├── client.ts       # 飞书客户端
    │   │   ├── document.ts     # 文档解析
    │   │   └── card.ts         # 交互卡片构建
    │   ├── converter/          # 文档转换
    │   │   ├── block-to-md.ts  # Block → Markdown
    │   │   └── image.ts        # 图片下载处理
    │   └── github/             # GitHub API 封装
    │       └── commit.ts       # 文件提交
    └── package.json
```

## 5. 分阶段实施计划

| 阶段 | 内容 | 优先级 |
|------|------|--------|
| Phase 0 | 架构设计与文档更新 | ✅ 进行中 |
| Phase 1 | 博客前端（首页、文章列表、详情页、关于页、布局组件） | 高 |
| Phase 2 | 飞书机器人后端（消息接收、交互卡片、文档解析转换） | 高 |
| Phase 3 | GitHub 同步集成（图片处理、文件提交、部署通知） | 高 |
| Phase 4 | 部署上线（Vercel 配置、SEO、性能优化） | 中 |

## 6. 环境变量

### 6.1 飞书机器人服务
```env
FEISHU_APP_ID=xxx
FEISHU_APP_SECRET=xxx
FEISHU_VERIFICATION_TOKEN=xxx    # 事件订阅验证 Token
FEISHU_ENCRYPT_KEY=xxx           # 事件加密 Key（可选）
GITHUB_TOKEN=xxx                 # GitHub Personal Access Token
GITHUB_REPO=kankan-web/kankan-blog-new
```

### 6.2 博客站点（Vercel）
```env
NEXT_PUBLIC_GISCUS_REPO=kankan-web/kankan-blog-new
NEXT_PUBLIC_GISCUS_REPO_ID=R_kgDORbecnA
NEXT_PUBLIC_GISCUS_CATEGORY=Comments
NEXT_PUBLIC_GISCUS_CATEGORY_ID=DIC_kwDORbecnM4C3mlf
NEXT_PUBLIC_SITE_URL=https://your-domain.vercel.app
```

---

## 变更记录

- 2026-03-28：创建 v2.0 架构文档，采用飞书机器人推送方案
