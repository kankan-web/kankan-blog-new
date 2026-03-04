# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

---

# 阿娟蛋个人博客系统

这是一个基于 Next.js 的个人博客系统，使用飞书文档作为写作平台，通过 GitHub Actions 手动同步内容。

## 项目概述

**核心理念：** 使用飞书文档进行在线写作，通过自动化脚本同步到 GitHub 仓库，使用 Next.js 静态生成博客页面，部署到 Vercel。

**技术栈：**
- Next.js 16 (App Router)
- React 19
- TypeScript 5
- TailwindCSS 4
- 飞书开放平台 API
- GitHub Actions (CI/CD)
- Vercel (部署平台)

## 常用命令

### 开发命令
```bash
# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 启动生产服务器
npm run start

# 代码检查
npm run lint
```

### 同步命令
```bash
# 增量同步飞书文档（仅同步有更新的文档）
npm run sync

# 全量同步（删除同步状态，重新同步所有文档）
npm run sync:all
```

## 项目架构

### 核心工作流

```
飞书文档（写作） → GitHub Actions（同步） → Git 仓库（存储） → Vercel（部署） → 用户访问
```

### 目录结构

```
egg-blog/
├── app/                          # Next.js App Router 页面
│   ├── page.tsx                  # 首页 - 文章列表
│   ├── layout.tsx                # 全局布局
│   ├── posts/[slug]/page.tsx     # 文章详情页（动态路由）
│   ├── categories/               # 分类相关页面
│   │   ├── page.tsx              # 分类列表
│   │   └── [category]/page.tsx   # 某分类下的文章列表
│   └── tags/                     # 标签相关页面
│       ├── page.tsx              # 标签云
│       └── [tag]/page.tsx        # 某标签下的文章列表
├── content/
│   └── posts/                    # 文章 Markdown 文件（按分类组织）
│       ├── 技术/
│       └── 生活/
├── public/
│   └── images/                   # 文章图片（按年月组织）
│       └── YYYY/MM/
├── scripts/                      # 同步脚本
│   ├── sync-feishu.ts            # 主同步逻辑
│   ├── feishu-client.ts          # 飞书 API 客户端
│   └── image-processor.ts        # 图片处理工具
├── src/
│   ├── components/               # React 组件
│   │   ├── ArticleCard.tsx       # 文章卡片
│   │   ├── ArticleContent.tsx    # Markdown 渲染
│   │   ├── Header.tsx            # 导航栏
│   │   └── Footer.tsx            # 页脚
│   ├── lib/                      # 工具库
│   │   └── posts.ts              # 文章读取工具函数
│   └── types/                    # TypeScript 类型定义
│       ├── post.ts               # 文章相关类型
│       └── feishu.ts             # 飞书相关类型
├── docs/                         # 项目文档
│   ├── plans/                    # 设计和实施计划
│   └── checklist.md              # 配置清单
├── .github/
│   └── workflows/
│       └── sync-feishu.yml       # 飞书同步工作流
├── sync-state.json               # 同步状态记录
└── package.json
```

### 关键架构设计

**1. 内容同步机制**
- 飞书文档按文件夹组织，文件夹名称即为分类
- 每篇文档开头使用 YAML Front Matter 定义元信息（标题、日期、标签等）
- 同步脚本通过飞书 API 获取文档列表，对比 `sync-state.json` 识别更新
- 自动下载飞书图片，上传到 `public/images/`，替换为 jsDelivr CDN 链接
- 文章保存到 `content/posts/{分类}/{slug}.md`

**2. 静态生成策略**
- 所有页面在构建时静态生成（SSG）
- 使用 `generateStaticParams` 预生成所有文章、分类、标签页面
- 文章内容通过 `fs` 模块在构建时读取
- 无需数据库，所有数据来自文件系统

**3. 图片处理流程**
- 识别 Markdown 中的飞书图片链接
- 下载图片并按 MD5 哈希命名（避免重复）
- 按年月组织到 `public/images/YYYY/MM/`
- 生成 jsDelivr CDN 链接：`https://cdn.jsdelivr.net/gh/{owner}/{repo}/public/images/{path}`

## 重要配置

### 环境变量

**GitHub Secrets（用于 Actions）：**
- `FEISHU_APP_ID` - 飞书应用 ID
- `FEISHU_APP_SECRET` - 飞书应用密钥
- `FEISHU_FOLDER_TOKEN` - 飞书知识库根文件夹 Token

**Vercel 环境变量（用于评论系统）：**
- `NEXT_PUBLIC_GISCUS_REPO` - GitHub 仓库名称
- `NEXT_PUBLIC_GISCUS_REPO_ID` - Giscus 仓库 ID
- `NEXT_PUBLIC_GISCUS_CATEGORY` - Giscus 分类名称
- `NEXT_PUBLIC_GISCUS_CATEGORY_ID` - Giscus 分类 ID

### TypeScript 路径别名

使用 `@/*` 作为根目录别名：
```typescript
import { getAllPosts } from '@/lib/posts';
import { ArticleCard } from '@/components/ArticleCard';
```

### 文章 Front Matter 格式

每篇文章必须包含以下元信息：
```yaml
---
title: 文章标题
date: 2026-03-03
category: 技术
tags: [React, TypeScript, Next.js]
description: 文章简介
cover: 封面图片URL（可选）
---
```

## Git 工作流

### 分支策略
- `main` - 主分支，保持可部署状态
- `feature/*` - 功能分支，每个功能一个分支

### 提交规范
使用 Conventional Commits 格式：
- `feat:` - 新功能
- `fix:` - 修复问题
- `docs:` - 文档更新
- `style:` - 样式调整
- `refactor:` - 重构代码
- `chore:` - 构建/工具配置

### 同步工作流
1. 在飞书文档中完成写作
2. 在 GitHub Actions 页面手动触发 "同步飞书文档" workflow
3. 脚本自动同步文档和图片，提交到 Git
4. Vercel 检测到更新，自动重新构建和部署

## 开发注意事项

### 添加新页面
1. 在 `app/` 目录下创建路由文件夹
2. 如果是动态路由，实现 `generateStaticParams` 函数
3. 使用 `@/lib/posts` 中的工具函数获取数据

### 修改文章读取逻辑
核心函数在 `src/lib/posts.ts`：
- `getAllPosts()` - 获取所有文章（按日期倒序）
- `getPostBySlug(slug, category)` - 获取单篇文章
- `getPostsByCategory(category)` - 按分类筛选
- `getPostsByTag(tag)` - 按标签筛选
- `getAllCategories()` - 获取所有分类
- `getAllTags()` - 获取所有标签

### 修改同步脚本
同步逻辑在 `scripts/sync-feishu.ts`：
1. `FeishuClient` - 处理飞书 API 调用和认证
2. `ImageProcessor` - 处理图片下载和 CDN 链接生成
3. 主函数遍历文件夹，检查更新，下载内容，保存文章

### Markdown 渲染
使用 `react-markdown` 渲染，配置在 `src/components/ArticleContent.tsx`：
- `remark-gfm` - 支持 GitHub 风格 Markdown
- `rehype-highlight` - 代码高亮
- `rehype-raw` - 支持 HTML 标签

## 部署流程

### Vercel 自动部署
1. 连接 GitHub 仓库到 Vercel
2. 每次 push 到 `main` 分支自动触发部署
3. 构建命令：`npm run build`
4. 输出目录：`.next`

### 手动部署
```bash
npm run build
npm run start
```

## 故障排查

### 同步失败
1. 检查 GitHub Actions 日志
2. 验证飞书 API 凭证是否正确
3. 确认飞书应用权限是否足够
4. 检查文档 Front Matter 格式是否正确

### 构建失败
1. 检查 Vercel 构建日志
2. 确认所有文章的 Front Matter 格式正确
3. 验证图片链接是否有效
4. 本地运行 `npm run build` 复现问题

### 图片显示问题
1. 检查图片是否已上传到 `public/images/`
2. 验证 jsDelivr CDN 链接格式
3. 确认 GitHub 仓库是公开的
4. 等待 CDN 缓存刷新（可能需要几分钟）

## 项目信息

**博客名称：** 阿娟蛋
**作者：** 阿娟蛋
**联系邮箱：** 2728360489@qq.com
**GitHub 仓库：** kankan-web/kankan-blog-new
**技术主题：** Web 开发、AI 技术、编程实践

## 参考文档
- 设计方案：`docs/plans/2026-03-02-blog-design.md`
- 实施计划：`docs/plans/2026-03-03-blog-implementation.md`
- 配置清单：`docs/checklist.md`
- Next.js 文档：https://nextjs.org/docs
- 飞书开放平台：https://open.feishu.cn/document
