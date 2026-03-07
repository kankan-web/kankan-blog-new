# Phase 2 执行计划：类型定义和工具函数

**计划生成时间：** 2026-03-08
**对应 Spec：** docs/specs/phase-2-types-and-utils.md
**预计执行时间：** 30-45 分钟

---

## 执行概览

本阶段将创建核心 TypeScript 类型定义和文章读取工具函数，为后续开发提供类型安全和数据访问基础。

**关键交付物：**
- `types/post.ts` - 文章相关类型定义
- `types/feishu.ts` - 飞书相关类型定义
- `lib/posts.ts` - 文章读取工具函数

---

## 任务清单

### Task 1: 创建文章类型定义
**文件：** `types/post.ts`
**预计时间：** 10 分钟

**实施步骤：**
1. 创建 `PostFrontMatter` 接口
   - title: string
   - date: string
   - category: string
   - tags: string[]
   - description: string
   - cover?: string (可选)

2. 创建 `Post` 接口（继承 PostFrontMatter）
   - slug: string
   - content: string
   - excerpt: string

3. 创建 `PostMetadata` 接口（用于列表展示）
   - 包含 PostFrontMatter 所有字段
   - 增加 slug: string
   - 增加 excerpt: string
   - 不包含完整 content

**验收标准：**
- [ ] 所有接口定义完整
- [ ] 类型导出正确
- [ ] 无 TypeScript 错误

**提交信息：** `feat: 添加文章类型定义`

---

### Task 2: 创建飞书类型定义
**文件：** `types/feishu.ts`
**预计时间：** 10 分钟

**实施步骤：**
1. 创建 `FeishuDocument` 接口
   - document_id: string
   - title: string
   - modified_time: number
   - url: string

2. 创建 `FeishuFolder` 接口
   - folder_token: string
   - name: string

3. 创建 `SyncState` 接口
   - lastSyncTime: string
   - documents: Record<string, { title: string; modifiedTime: number; localPath: string }>

**验收标准：**
- [ ] 所有接口定义完整
- [ ] 类型导出正确
- [ ] 无 TypeScript 错误

**提交信息：** `feat: 添加飞书类型定义`

---

### Task 3: 实现文章读取工具函数
**文件：** `lib/posts.ts`
**预计时间：** 20 分钟

**实施步骤：**
1. 导入依赖
   ```typescript
   import fs from 'fs';
   import path from 'path';
   import matter from 'gray-matter';
   import type { Post, PostMetadata } from '@/types/post';
   ```

2. 定义常量
   ```typescript
   const POSTS_DIR = path.join(process.cwd(), 'content/posts');
   ```

3. 实现 `getAllPosts()` 函数
   - 遍历 content/posts/ 下所有分类文件夹
   - 读取每个 .md 文件
   - 使用 gray-matter 解析 Front Matter
   - 生成 excerpt（前 200 字符）
   - 按日期倒序排序
   - 返回 PostMetadata[]

4. 实现 `getPostBySlug(slug: string, category: string)` 函数
   - 构建文件路径：`content/posts/{category}/{slug}.md`
   - 读取文件内容
   - 解析 Front Matter 和 content
   - 返回 Post | null

5. 实现 `getPostsByCategory(category: string)` 函数
   - 调用 getAllPosts()
   - 过滤指定分类
   - 返回 PostMetadata[]

6. 实现 `getPostsByTag(tag: string)` 函数
   - 调用 getAllPosts()
   - 过滤包含指定标签的文章
   - 返回 PostMetadata[]

7. 实现 `getAllCategories()` 函数
   - 读取 content/posts/ 目录
   - 返回所有子文件夹名称（按字母排序）
   - 返回 string[]

8. 实现 `getAllTags()` 函数
   - 调用 getAllPosts()
   - 提取所有 tags
   - 去重并按字母排序
   - 返回 string[]

**错误处理：**
- 文件不存在返回 null
- 目录不存在返回空数组
- Front Matter 格式错误抛出明确错误

**验收标准：**
- [ ] 所有函数实现完整
- [ ] 类型注解正确
- [ ] 错误处理完善
- [ ] 无 TypeScript 错误
- [ ] 无 ESLint 警告

**提交信息：** `feat: 实现文章读取工具函数`

---

### Task 4: 创建测试文章验证功能
**文件：** `content/posts/技术/test-post.md`
**预计时间：** 5 分钟

**实施步骤：**
1. 创建测试文章目录结构
   ```bash
   mkdir -p content/posts/技术
   ```

2. 创建测试文章
   ```markdown
   ---
   title: 测试文章
   date: 2026-03-08
   category: 技术
   tags: [TypeScript, Next.js]
   description: 这是一篇测试文章
   ---

   这是测试文章的内容。
   ```

3. 在终端测试工具函数
   ```bash
   node -e "const { getAllPosts } = require('./lib/posts.ts'); console.log(getAllPosts());"
   ```

**验收标准：**
- [ ] 测试文章创建成功
- [ ] 工具函数能正确读取测试文章
- [ ] 无运行时错误

**提交信息：** `test: 添加测试文章验证工具函数`

---

## 执行顺序

1. Task 1: 创建文章类型定义 → commit
2. Task 2: 创建飞书类型定义 → commit
3. Task 3: 实现文章读取工具函数 → commit
4. Task 4: 创建测试文章验证功能 → commit
5. 更新 spec 文件验收标准
6. 更新 progress.json

---

## 技术注意事项

1. **路径处理：**
   - 使用 `path.join()` 拼接路径
   - 使用 `process.cwd()` 获取项目根目录
   - 避免硬编码路径

2. **类型安全：**
   - 所有函数必须有明确的返回类型
   - 使用 TypeScript 严格模式
   - 避免使用 `any` 类型

3. **性能考虑：**
   - 使用同步文件读取（构建时执行）
   - 当前规模小，暂不需要缓存
   - 未来可考虑增量读取

4. **错误处理：**
   - 使用 try-catch 捕获文件读取错误
   - 提供清晰的错误信息
   - 避免程序崩溃

---

## 风险应对

| 风险 | 应对方案 |
|------|----------|
| Front Matter 格式不一致 | 严格验证，提供清晰错误信息 |
| 文件路径错误 | 使用 path.join() 拼接路径 |
| TypeScript 类型错误 | 仔细检查类型定义，确保一致性 |

---

## 完成检查清单

执行完成后，确认以下事项：

- [ ] 所有 Task 已完成并提交
- [ ] 无 TypeScript 编译错误
- [ ] 无 ESLint 警告
- [ ] 测试文章能正确读取
- [ ] spec 文件验收标准已更新（全部勾选）
- [ ] spec 文件状态已更新为"已完成"
- [ ] progress.json 已更新（status: completed, completedAt）

---

## 下一步

完成本阶段后，进入 Phase 3：飞书同步脚本开发。
