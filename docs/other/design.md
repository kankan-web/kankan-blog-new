# 个人博客系统设计方案

**日期：** 2026-03-02
**版本：** 1.0
**状态：** 已批准

## 项目概述

构建一个基于 Next.js 的个人博客系统，使用飞书文档作为写作平台，通过 GitHub Actions 手动同步内容，部署在 Vercel 上。博客采用静态生成方式，支持分类、标签、搜索和评论功能。

## 核心需求

1. **写作平台**：使用飞书文档进行在线写作
2. **内容同步**：手动触发同步，1-2 小时内更新可接受
3. **博客展示**：自定义样式，纯展示型（无后台管理）
4. **图床方案**：GitHub + jsDelivr CDN，自动转存飞书图片
5. **内容组织**：文件夹作为分类，文档内标记作为标签
6. **评论系统**：基于 GitHub 的 Giscus
7. **文章规模**：少量文章（<50 篇），偶尔更新

## 技术栈

- **前端框架**：Next.js 14+ (App Router)
- **开发语言**：TypeScript
- **样式方案**：TailwindCSS
- **Markdown 渲染**：react-markdown + remark/rehype 插件
- **代码高亮**：rehype-highlight
- **搜索功能**：FlexSearch（客户端搜索）
- **评论系统**：Giscus
- **部署平台**：Vercel
- **CI/CD**：GitHub Actions

## 整体架构

### 系统组成

```
飞书文档（写作平台）
    ↓
GitHub Actions（手动触发同步）
    ↓
GitHub 仓库（存储文章和图片）
    ↓
Vercel（构建和部署）
    ↓
用户访问博客
```

### 核心模块

#### 1. 同步服务（GitHub Actions）

**触发方式：**
- 手动触发：在 GitHub Actions 页面点击按钮
- 本地触发：运行 `npm run sync` 命令

**功能：**
- 调用飞书 API 获取文档列表
- 对比本地记录，识别新增/修改的文档
- 下载文档内容（Markdown 格式）
- 下载并处理文档中的图片
- 将图片上传到 GitHub 仓库
- 替换图片链接为 jsDelivr CDN 链接
- 保存文章到 `/content/posts/{分类}/{slug}.md`
- 提交到 Git 并触发 Vercel 重新构建

#### 2. 博客前端（Next.js）

**页面结构：**
```
/                          # 首页 - 最新文章列表
/posts/[slug]              # 文章详情页
/categories                # 分类列表页
/categories/[category]     # 某个分类下的文章列表
/tags                      # 标签云页面
/tags/[tag]                # 某个标签下的文章列表
/about                     # 关于页面（可选）
/search                    # 搜索页面
```

**核心组件：**
- Header：导航栏
- Footer：版权信息、社交链接
- ArticleCard：文章卡片
- ArticleContent：Markdown 渲染
- TableOfContents：目录导航
- CodeBlock：代码高亮
- SearchBar：搜索框
- TagCloud：标签云
- CommentSection：评论区

#### 3. 评论系统（Giscus）

- 基于 GitHub Discussions
- 无需后端服务器
- 与 GitHub 账号集成

## 数据流设计

### 飞书文档组织结构

```
飞书知识库
├── 技术/                    # 文件夹 = 分类
│   ├── React 入门.md
│   └── TypeScript 实践.md
├── 生活/
│   └── 旅行日记.md
└── ...
```

### 文档元信息标记

每篇飞书文档开头使用 YAML Front Matter：

```yaml
---
title: 文章标题
date: 2026-03-02
tags: [React, 前端, 教程]
description: 文章简介
cover: 封面图片URL
---
```

### 同步流程

1. **检查更新**
   - 调用飞书 API 获取文档列表
   - 对比本地 `sync-state.json` 记录的文档修改时间
   - 识别新增/修改的文档

2. **下载内容**
   - 获取文档的 Markdown 内容
   - 解析 Front Matter 元信息
   - 提取文档中的图片链接

3. **处理图片**
   - 下载飞书图片到本地
   - 上传到 `/public/images/YYYY/MM/` 目录（按年月组织）
   - 替换 Markdown 中的图片链接为 jsDelivr CDN 链接

4. **保存文章**
   - 按分类保存到 `/content/posts/{分类}/{文章slug}.md`
   - 更新 `sync-state.json` 记录

5. **提交和触发构建**
   - Git commit 并 push
   - Vercel 自动检测到更新并重新构建

### 文章存储位置

```
GitHub 仓库
├── content/
│   └── posts/           # 文章 Markdown 文件
│       ├── 技术/
│       │   ├── react-hooks.md
│       │   └── typescript-best-practices.md
│       └── 生活/
│           └── travel-diary.md
├── public/
│   └── images/          # 文章图片
│       ├── 2026/
│       │   └── 03/
│       │       ├── cover-1.jpg
│       │       └── img-1.png
│       └── ...
└── sync-state.json      # 同步状态记录
```

### 文章 Markdown 文件示例

```markdown
---
title: React Hooks 最佳实践
date: 2026-03-02
category: 技术
tags: [React, Hooks, 前端]
description: 深入理解 React Hooks 的使用技巧
cover: https://cdn.jsdelivr.net/gh/username/repo/public/images/2026/03/cover.jpg
---

文章正文内容...

![示例图片](https://cdn.jsdelivr.net/gh/username/repo/public/images/2026/03/example.jpg)
```

## 飞书 API 集成

### 飞书开放平台配置

1. **创建应用**
   - 登录飞书开放平台（open.feishu.cn）
   - 创建企业自建应用
   - 获取 App ID 和 App Secret

2. **权限申请**
   - 云文档权限：`docx:document:readonly`（读取文档）
   - 云空间权限：`drive:drive:readonly`（访问云空间）

3. **获取访问令牌**
   - 使用 App ID 和 App Secret 获取 tenant_access_token
   - Token 有效期 2 小时，需要缓存和刷新

### API 调用流程

**1. 获取文档列表**
```
GET /open-apis/drive/v1/files
- 遍历指定文件夹
- 获取文档的 token、标题、修改时间
```

**2. 获取文档内容**
```
GET /open-apis/docx/v1/documents/{document_id}/raw_content
- 返回 Markdown 格式内容
- 包含图片的临时链接
```

**3. 下载图片**
```
GET /open-apis/drive/v1/medias/{file_token}/download
- 下载图片二进制数据
- 保存到本地
```

### GitHub Actions 配置

**环境变量（GitHub Secrets）：**
```
FEISHU_APP_ID          # 飞书应用 ID
FEISHU_APP_SECRET      # 飞书应用密钥
FEISHU_FOLDER_TOKEN    # 飞书知识库文件夹 token
GITHUB_TOKEN           # GitHub 访问令牌（自动提供）
```

**工作流文件：`.github/workflows/sync-feishu.yml`**
```yaml
name: 同步飞书文档

on:
  workflow_dispatch:  # 手动触发
    inputs:
      sync_all:
        description: '是否同步所有文档（否则只同步有更新的）'
        required: false
        default: 'false'
        type: choice
        options:
          - 'true'
          - 'false'

jobs:
  sync:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npm install
      - run: npm run sync
        env:
          FEISHU_APP_ID: ${{ secrets.FEISHU_APP_ID }}
          FEISHU_APP_SECRET: ${{ secrets.FEISHU_APP_SECRET }}
          FEISHU_FOLDER_TOKEN: ${{ secrets.FEISHU_FOLDER_TOKEN }}
      - run: |
          git config user.name "GitHub Actions"
          git config user.email "actions@github.com"
          git add .
          git commit -m "sync: 同步飞书文档" || exit 0
          git push
```

### 错误处理

- API 调用失败：重试 3 次，指数退避
- 图片下载失败：记录日志，跳过该图片
- 同步失败：在 Actions 日志中查看详细错误

## 前端实现细节

### Markdown 渲染

**使用的库：**
- `react-markdown`：核心渲染库
- `remark-gfm`：支持 GitHub 风格 Markdown
- `rehype-highlight`：代码高亮
- `remark-math` + `rehype-katex`：数学公式支持（可选）

**自定义组件：**
- 代码块：添加复制按钮、语言标签
- 图片：使用 Next.js Image 组件优化
- 链接：外部链接添加 `target="_blank"`
- 标题：自动生成锚点链接

### 搜索功能

**实现方案：**
- 构建时生成搜索索引 JSON 文件
- 使用 FlexSearch 进行客户端全文搜索
- 搜索范围：标题、标签、内容摘要

**索引文件结构：**
```json
{
  "posts": [
    {
      "id": "react-hooks",
      "title": "React Hooks 最佳实践",
      "description": "深入理解 React Hooks 的使用技巧",
      "tags": ["React", "Hooks", "前端"],
      "category": "技术",
      "date": "2026-03-02",
      "slug": "react-hooks"
    }
  ]
}
```

### 响应式设计

- 移动端优先设计
- TailwindCSS 断点：sm (640px)、md (768px)、lg (1024px)、xl (1280px)
- 暗色模式支持（可选）

### 性能优化

- 图片懒加载：Next.js Image 组件
- 路由预加载：Next.js Link 组件
- 代码分割：动态导入非关键组件
- 静态生成：所有页面在构建时生成
- CDN 加速：Vercel Edge Network + jsDelivr

## 部署配置

### 目录结构

```
blog/
├── .github/
│   └── workflows/
│       └── sync-feishu.yml       # 同步工作流
├── content/
│   └── posts/                    # 文章存储
│       ├── 技术/
│       └── 生活/
├── public/
│   └── images/                   # 图片存储
│       └── 2026/
├── scripts/
│   ├── sync-feishu.ts            # 同步脚本
│   └── utils/                    # 工具函数
├── src/
│   ├── app/                      # Next.js App Router
│   ├── components/               # React 组件
│   ├── lib/                      # 工具库
│   └── styles/                   # 样式文件
├── sync-state.json               # 同步状态
├── package.json
├── tsconfig.json
├── tailwind.config.ts
└── next.config.js
```

### Vercel 部署

**配置：**
- 连接 GitHub 仓库
- 框架预设：Next.js
- 构建命令：`npm run build`
- 输出目录：`.next`
- Node.js 版本：20.x
- 自动部署：main 分支有更新时自动触发

**环境变量（Vercel）：**
```
NEXT_PUBLIC_SITE_URL        # 网站 URL
NEXT_PUBLIC_GISCUS_REPO     # Giscus 评论仓库
NEXT_PUBLIC_GISCUS_REPO_ID  # Giscus 仓库 ID
NEXT_PUBLIC_GISCUS_CATEGORY # Giscus 分类
NEXT_PUBLIC_GISCUS_CATEGORY_ID
```

### 域名配置（可选）

1. 在 Vercel 项目设置中添加自定义域名
2. 配置 DNS 记录：
   - A 记录或 CNAME 记录指向 Vercel
3. Vercel 自动配置 HTTPS 证书

## 开发流程

### 本地开发

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 同步飞书文档（测试）
npm run sync

# 全量同步
npm run sync:all

# 构建生产版本
npm run build

# 预览生产版本
npm run start
```

### 发布文章流程

1. 在飞书文档中写作并完成文章
2. 在文章开头添加 Front Matter 元信息
3. 打开 GitHub 仓库 → Actions 标签
4. 选择 "同步飞书文档" workflow
5. 点击 "Run workflow" 按钮
6. 等待同步完成（1-2 分钟）
7. Vercel 自动检测到更新并重新构建（2-5 分钟）
8. 访问博客查看新文章

## 监控和维护

### 日志查看

- **GitHub Actions 日志**：查看同步过程和错误信息
- **Vercel 部署日志**：查看构建过程和部署状态

### 备份策略

- Git 仓库本身就是完整备份
- 所有文章和图片都有版本控制
- 可以随时回滚到历史版本
- 建议定期导出飞书文档作为额外备份

### 成本估算

- **Vercel**：免费版（每月 100GB 带宽，足够个人博客使用）
- **GitHub**：免费（仓库和 Actions）
- **jsDelivr CDN**：免费
- **飞书开放平台**：免费
- **总成本**：0 元

## 技术优势

1. **完全免费**：所有服务都使用免费方案
2. **性能优异**：静态生成 + CDN，访问速度极快
3. **SEO 友好**：服务端渲染，搜索引擎友好
4. **易于维护**：无需服务器和数据库
5. **版本控制**：所有内容都有 Git 版本管理
6. **灵活扩展**：可以随时添加新功能
7. **写作体验**：使用飞书的优秀编辑器

## 潜在风险和解决方案

### 风险 1：飞书 API 限流

**解决方案：**
- 实现请求限流和重试机制
- 缓存 access_token
- 避免频繁同步

### 风险 2：GitHub 仓库大小限制

**解决方案：**
- 图片压缩优化
- 定期清理旧图片
- 考虑使用 Git LFS（如需要）

### 风险 3：Vercel 构建次数限制

**解决方案：**
- 手动触发同步，避免频繁构建
- 免费版每月 100 次构建足够使用

### 风险 4：jsDelivr CDN 访问问题

**解决方案：**
- 备用方案：使用 GitHub raw 链接
- 或使用其他免费 CDN（如 Cloudflare）

## 后续优化方向

1. **性能优化**
   - 实现增量构建
   - 添加 Service Worker 离线支持
   - 图片格式优化（WebP）

2. **功能增强**
   - RSS 订阅
   - 站点地图自动生成
   - 阅读时长估算
   - 文章浏览统计

3. **用户体验**
   - 暗色模式
   - 字体大小调节
   - 阅读进度条
   - 相关文章推荐

4. **自动化**
   - 飞书机器人触发同步
   - 自动生成文章摘要
   - 图片自动压缩

## 总结

本设计方案采用静态生成 + 手动同步的方式，充分利用免费服务，实现了一个功能完善、性能优异的个人博客系统。通过飞书文档作为写作平台，解决了在线编辑的问题；通过 GitHub + Vercel，实现了免费且高性能的部署方案。整体架构简单可靠，易于维护和扩展。
