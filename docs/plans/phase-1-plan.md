# Phase 1: 项目初始化和基础配置 - 实施计划

> **For Claude:** REQUIRED SUB-SKILL: Use executing-plans to implement this plan task-by-task.

**目标：** 搭建 Next.js 项目基础架构，配置开发环境，创建目录结构，安装核心依赖

**架构方案：** 使用 Next.js 14+ App Router + TypeScript 5 + TailwindCSS 4，采用静态生成方式，内容存储在 `content/posts/` 目录，图片存储在 `public/images/`

**技术栈：** Next.js 14+, React 19, TypeScript 5, TailwindCSS 4, react-markdown, gray-matter, flexsearch

---

## Task 1: 验证现有项目状态

**Files:**
- Read: `package.json`
- Read: `next.config.js` or `next.config.mjs`
- Read: `tsconfig.json`
- Read: `tailwind.config.ts` or `tailwind.config.js`

**Step 1: 检查项目是否已初始化**

运行命令检查现有文件：
```bash
ls -la package.json next.config.* tsconfig.json tailwind.config.* 2>/dev/null || echo "项目未初始化"
```

预期：如果文件存在，说明项目已部分初始化；如果不存在，需要完整初始化

**Step 2: 检查 Next.js 版本**

```bash
grep '"next"' package.json || echo "Next.js 未安装"
```

预期：显示 Next.js 版本号或提示未安装

**Step 3: 记录当前状态**

根据检查结果决定后续步骤：
- 如果项目已存在：跳过初始化，直接进入配置清理
- 如果项目不存在：执行完整初始化流程

---

## Task 2: 清理现有默认内容（如果项目已存在）

**Files:**
- Modify: `app/page.tsx`
- Modify: `app/layout.tsx`
- Modify: `app/globals.css`

**Step 1: 清理首页内容**

修改 `app/page.tsx` 为最简结构：

```typescript
export default function Home() {
  return (
    <main className="min-h-screen p-8">
      <h1 className="text-4xl font-bold">阿娟蛋的博客</h1>
      <p className="mt-4 text-gray-600">正在建设中...</p>
    </main>
  )
}
```

**Step 2: 清理全局布局**

修改 `app/layout.tsx`，保留必要的元数据：

```typescript
import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: '阿娟蛋的博客',
  description: '个人技术博客',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  )
}
```

**Step 3: 清理全局样式**

修改 `app/globals.css`，保留 Tailwind 指令：

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

**Step 4: 验证清理结果**

```bash
npm run dev
```

预期：开发服务器启动成功，访问 http://localhost:3000 显示简洁页面

**Step 5: 提交清理**

```bash
git add app/page.tsx app/layout.tsx app/globals.css
git commit -m "chore: 清理默认模板内容"
```

---

## Task 3: 创建项目目录结构

**Files:**
- Create: `content/posts/.gitkeep`
- Create: `public/images/.gitkeep`
- Create: `scripts/.gitkeep`
- Create: `src/components/.gitkeep`
- Create: `src/lib/.gitkeep`
- Create: `src/types/.gitkeep`
- Create: `docs/specs/.gitkeep`
- Create: `docs/plans/.gitkeep`
- Create: `docs/summaries/.gitkeep`

**Step 1: 创建内容和资源目录**

```bash
mkdir -p content/posts public/images
touch content/posts/.gitkeep public/images/.gitkeep
```

**Step 2: 创建源码目录**

```bash
mkdir -p scripts src/components src/lib src/types
touch scripts/.gitkeep src/components/.gitkeep src/lib/.gitkeep src/types/.gitkeep
```

**Step 3: 创建文档目录**

```bash
mkdir -p docs/specs docs/plans docs/summaries
touch docs/specs/.gitkeep docs/plans/.gitkeep docs/summaries/.gitkeep
```

**Step 4: 验证目录结构**

```bash
tree -L 2 -a content/ public/ scripts/ src/ docs/ || ls -R content/ public/ scripts/ src/ docs/
```

预期：所有目录和 .gitkeep 文件创建成功

**Step 5: 提交目录结构**

```bash
git add content/ public/images/ scripts/ src/ docs/
git commit -m "chore: 创建项目目录结构"
```

---

## Task 4: 初始化同步状态文件

**Files:**
- Create: `sync-state.json`

**Step 1: 创建 sync-state.json**

```json
{
  "lastSyncTime": null,
  "documents": {}
}
```

**Step 2: 验证 JSON 格式**

```bash
cat sync-state.json | python3 -m json.tool
```

预期：JSON 格式正确，无语法错误

**Step 3: 提交同步状态文件**

```bash
git add sync-state.json
git commit -m "chore: 初始化同步状态文件"
```

---

## Task 5: 配置 .gitignore

**Files:**
- Modify: `.gitignore`

**Step 1: 添加博客特定的忽略规则**

在 `.gitignore` 末尾添加：

```
# 飞书同步临时文件
.feishu-temp/
sync-state.json

# 环境变量
.env
.env.local
.env.*.local

# 构建输出
.next/
out/
build/
dist/

# 依赖
node_modules/

# 日志
*.log
npm-debug.log*

# 操作系统
.DS_Store
Thumbs.db

# IDE
.vscode/
.idea/
*.swp
*.swo
```

**Step 2: 验证 .gitignore**

```bash
cat .gitignore
```

预期：包含所有必要的忽略规则

**Step 3: 提交 .gitignore**

```bash
git add .gitignore
git commit -m "chore: 配置 .gitignore"
```

---

## Task 6: 安装 Markdown 相关依赖

**Files:**
- Modify: `package.json`

**Step 1: 安装 Markdown 渲染库**

```bash
npm install react-markdown remark-gfm rehype-highlight rehype-raw gray-matter
```

**Step 2: 验证安装**

```bash
npm list react-markdown remark-gfm rehype-highlight rehype-raw gray-matter
```

预期：所有包安装成功，无错误

**Step 3: 提交依赖更新**

```bash
git add package.json package-lock.json
git commit -m "chore: 安装 Markdown 渲染依赖"
```

---

## Task 7: 安装搜索和工具库

**Files:**
- Modify: `package.json`

**Step 1: 安装搜索和日期库**

```bash
npm install flexsearch date-fns
```

**Step 2: 验证安装**

```bash
npm list flexsearch date-fns
```

预期：所有包安装成功，无错误

**Step 3: 提交依赖更新**

```bash
git add package.json package-lock.json
git commit -m "chore: 安装搜索和工具库依赖"
```

---

## Task 8: 安装飞书 SDK

**Files:**
- Modify: `package.json`

**Step 1: 安装飞书相关依赖**

```bash
npm install @larksuiteoapi/node-sdk axios
```

**Step 2: 验证安装**

```bash
npm list @larksuiteoapi/node-sdk axios
```

预期：所有包安装成功，无错误

**Step 3: 提交依赖更新**

```bash
git add package.json package-lock.json
git commit -m "chore: 安装飞书 SDK 依赖"
```

---

## Task 9: 验证项目配置

**Files:**
- Read: `tsconfig.json`
- Read: `next.config.js` or `next.config.mjs`

**Step 1: 检查 TypeScript 配置**

验证 `tsconfig.json` 中的路径别名：

```bash
grep -A 5 '"paths"' tsconfig.json
```

预期：包含 `"@/*": ["./*"]` 或类似配置

**Step 2: 检查 Next.js 配置**

```bash
cat next.config.*
```

预期：配置文件存在且格式正确

**Step 3: 运行类型检查**

```bash
npx tsc --noEmit
```

预期：无 TypeScript 类型错误

**Step 4: 运行 ESLint**

```bash
npm run lint
```

预期：无 ESLint 错误或警告

---

## Task 10: 最终验证和测试

**Step 1: 清理并重新安装依赖**

```bash
rm -rf node_modules package-lock.json
npm install
```

预期：依赖安装成功，无冲突

**Step 2: 启动开发服务器**

```bash
npm run dev
```

预期：服务器在 5 秒内启动成功

**Step 3: 验证页面访问**

在浏览器访问 http://localhost:3000

预期：显示"阿娟蛋的博客"页面，无控制台错误

**Step 4: 构建生产版本**

```bash
npm run build
```

预期：构建成功，无错误

**Step 5: 创建最终提交**

```bash
git add -A
git commit -m "chore: 完成 Phase 1 项目初始化"
```

---

## 检查点

在以下步骤后暂停，等待确认：

1. Task 2 完成后 - 确认清理后的页面符合预期
2. Task 5 完成后 - 确认 .gitignore 配置正确
3. Task 10 完成后 - 确认所有功能正常，准备进入下一阶段

---

## 回滚方案

如果出现问题：

1. **依赖安装失败：** 删除 `node_modules` 和 `package-lock.json`，重新运行 `npm install`
2. **配置错误：** 使用 `git checkout -- <file>` 恢复配置文件
3. **完全回滚：** 使用 `git reset --hard HEAD~N` 回退到之前的提交

---

## 预期产出

- ✅ Next.js 项目完整初始化
- ✅ 目录结构创建完成
- ✅ 所有核心依赖安装成功
- ✅ 开发服务器可正常启动
- ✅ 构建流程验证通过
- ✅ Git 提交历史清晰
