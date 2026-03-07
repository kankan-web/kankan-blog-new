# CLAUDE.md

# 阿娟蛋个人博客系统

基于 Next.js 的个人博客，使用飞书文档写作，通过 GitHub Actions 同步内容。

## 技术栈
- Next.js 16 (App Router) + React 19 + TypeScript 5 + TailwindCSS 4
- 飞书开放平台 API + GitHub Actions + Vercel

## 核心工作流
```
飞书文档 → GitHub Actions 同步 → Git 仓库 → Vercel 部署
```

## 常用命令
```bash
npm run dev        # 开发服务器
npm run build      # 构建生产版本
npm run sync       # 增量同步飞书文档
npm run sync:all   # 全量同步（重新同步所有文档）
```

## 目录结构
```
app/                    # Next.js 页面（首页、文章详情、分类、标签）
content/posts/          # Markdown 文章（按分类组织）
public/images/          # 文章图片（按年月组织 YYYY/MM/）
scripts/                # 飞书同步脚本
src/
  ├── components/       # React 组件
  ├── lib/posts.ts      # 文章读取工具函数
  └── types/            # TypeScript 类型定义
docs/
  ├── specs/            # 阶段性规格说明
  ├── plans/            # 执行计划
  ├── summaries/        # 执行总结
  └── progress.json     # 阶段追踪
```

## 关键设计

**内容同步：** 飞书文档按文件夹分类 → 对比 `sync-state.json` 识别更新 → 下载图片到 `public/images/` → 替换为 jsDelivr CDN 链接 → 保存到 `content/posts/{分类}/{slug}.md`

**静态生成：** 构建时通过 `generateStaticParams` 预生成所有页面，使用 `fs` 读取文章，无需数据库

**图片处理：** 下载飞书图片 → MD5 哈希命名 → 按年月组织 → 生成 CDN 链接

## 环境变量

**GitHub Secrets：** `FEISHU_APP_ID`, `FEISHU_APP_SECRET`, `FEISHU_FOLDER_TOKEN`

**Vercel（Giscus 评论）：** `NEXT_PUBLIC_GISCUS_REPO`, `NEXT_PUBLIC_GISCUS_REPO_ID`, `NEXT_PUBLIC_GISCUS_CATEGORY`, `NEXT_PUBLIC_GISCUS_CATEGORY_ID`

## 文章 Front Matter
```yaml
---
title: 文章标题
date: 2026-03-03
category: 技术
tags: [React, TypeScript]
description: 文章简介
cover: 封面图片URL（可选）
---
```

## 核心工具函数（src/lib/posts.ts）
- `getAllPosts()` - 获取所有文章（按日期倒序）
- `getPostBySlug(slug, category)` - 获取单篇文章
- `getPostsByCategory(category)` / `getPostsByTag(tag)` - 按分类/标签筛选
- `getAllCategories()` / `getAllTags()` - 获取所有分类/标签

---

## Spec Coding 工作流程

采用"规格说明 → 计划 → 执行 → 审核 → 总结"的开发流程。

### 工作流程

1. **用户准备：** 编写 spec 文档到 `docs/specs/`，更新 `docs/progress.json`
2. **AI 生成计划：** 触发指令"开始 phase-X"，使用 `writing-plans` skill 生成计划到 `docs/plans/`
3. **AI 执行计划：** 触发指令"执行计划"，使用 `executing-plans` skill 实施
   - 每完成一个 task 立即进行 git commit
   - 执行完成后更新 spec 文件中的验收标准（勾选 `[x]`）
   - 更新 spec 文件状态为"已完成"
   - 更新 `docs/progress.json` 中的阶段状态和完成时间
4. **用户审核：** Code Review → 功能测试 → 确认验收
5. **AI 生成总结：** 触发指令"生成总结"，生成总结到 `docs/summaries/`

### 快速指令

| 用户指令 | AI 操作 | 使用的 Skill |
|---------|---------|-------------|
| "开始 phase-X" / "生成计划" | 读取 spec，生成 plan | `writing-plans` |
| "执行计划" / "开始实施" | 执行当前 plan | `executing-plans` |
| "生成总结" / "总结本阶段" | 生成 summary 文档 | 无 |
| "进入下一阶段" | 更新 progress.json | 无 |

### progress.json 格式
```json
{
  "currentPhase": "phase-2-sync",
  "lastUpdated": "2026-03-07",
  "phases": {
    "phase-1-foundation": {
      "status": "completed",
      "specFile": "docs/specs/phase-1-foundation.md",
      "planFile": "docs/plans/2026-03-07-phase-1-plan.md",
      "summaryFile": "docs/summaries/2026-03-07-phase-1-summary.md",
      "startedAt": "2026-03-07",
      "completedAt": "2026-03-07"
    }
  }
}
```

**状态：** `pending` | `planning` | `in-progress` | `reviewing` | `completed` | `blocked`

### AI 注意事项

**执行阶段必须做：**
- 每完成一个 task 立即 git commit（不要等到最后批量提交）
- 执行完成后更新 spec 文件中所有验收标准复选框为 `[x]`
- 更新 spec 文件顶部状态为"已完成"
- 更新 `docs/progress.json` 中的 status、completedAt 字段

**不应该：** 自动提交代码、跳过审核、擅自修改范围

**应该：** 严格遵循 spec/plan、在检查点等待确认、详细记录问题、保持代码质量

**文档命名：**
- Spec: `phase-{number}-{name}.md`
- Plan: `phase-{number}-plan.md`
- Summary: `phase-{number}-summary.md` 