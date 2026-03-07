# 阶段 2：类型定义和工具函数

**阶段编号：** phase-2
**创建日期：** 2026-03-07
**状态：** 已完成
**依赖阶段：** phase-1

---

## 阶段目标

定义核心 TypeScript 类型，实现文章读取工具函数，为后续开发提供类型安全和数据访问基础。

---

## 功能需求

### 需求 1：定义核心类型

**描述：**
创建文章相关和飞书相关的 TypeScript 类型定义，确保类型安全。

**涉及文件：**
- 创建：`src/types/post.ts`
- 创建：`src/types/feishu.ts`

**验收标准：**
- [x] `PostFrontMatter` 接口定义完整
- [x] `Post` 接口定义完整
- [x] `PostMetadata` 接口定义完整
- [x] `FeishuDocument` 接口定义完整
- [x] `FeishuFolder` 接口定义完整
- [x] `SyncState` 接口定义完整
- [x] 所有类型导出正确

---

### 需求 2：实现文章读取工具函数

**描述：**
实现从文件系统读取文章的工具函数，支持按分类、标签筛选，获取所有分类和标签。

**涉及文件：**
- 创建：`src/lib/posts.ts`

**验收标准：**
- [x] `getAllPosts()` 函数实现完整，返回所有文章（按日期倒序）
- [x] `getPostBySlug()` 函数实现完整，根据 slug 和分类获取单篇文章
- [x] `getPostsByCategory()` 函数实现完整，按分类筛选文章
- [x] `getPostsByTag()` 函数实现完整，按标签筛选文章
- [x] `getAllCategories()` 函数实现完整，获取所有分类
- [x] `getAllTags()` 函数实现完整，获取所有标签
- [x] 所有函数都有正确的类型注解
- [x] 错误处理完善（文件不存在、格式错误等）

---

## 技术要求

### 技术栈
- TypeScript：类型定义
- Node.js fs 模块：文件系统操作
- gray-matter：解析 Front Matter

### 技术约束
- 所有函数必须有明确的类型注解
- 使用 `process.cwd()` 获取项目根目录
- 文章路径：`content/posts/{分类}/{slug}.md`
- Front Matter 必须包含：title, date, category, tags, description

### 性能要求
- `getAllPosts()` 执行时间 < 100ms（假设 50 篇文章）
- 文件读取使用同步方式（构建时执行，无需异步）

---

## 实施注意事项

1. **类型定义：**
   - `PostFrontMatter` 是 Front Matter 的结构
   - `Post` 继承 `PostFrontMatter`，增加 slug、content、excerpt
   - `PostMetadata` 用于列表展示，不包含完整 content

2. **文章读取逻辑：**
   - 遍历 `content/posts/` 下的所有分类文件夹
   - 读取每个分类下的 `.md` 文件
   - 使用 `gray-matter` 解析 Front Matter 和内容
   - 自动生成 excerpt（前 200 字符）

3. **错误处理：**
   - 文件不存在返回 `null`
   - 目录不存在返回空数组
   - Front Matter 格式错误应该抛出明确的错误信息

4. **排序规则：**
   - 文章按日期倒序排列（最新的在前）
   - 分类和标签按字母顺序排列

---

## 风险点

| 风险 | 影响 | 应对方案 |
|------|------|----------|
| Front Matter 格式不一致 | 高 | 严格验证格式，提供清晰的错误信息 |
| 文件路径错误 | 中 | 使用 `path.join()` 拼接路径，避免硬编码 |
| 性能问题（文章过多） | 低 | 当前规模小，暂不优化；未来可考虑缓存 |

---

## 验收标准

### 功能验收
- [x] 所有类型定义正确，无 TypeScript 错误
- [x] 所有工具函数实现完整，逻辑正确
- [x] 可以正确读取测试文章（需要创建测试数据）
- [x] 错误处理完善，不会崩溃

### 代码质量
- [x] 代码符合 TypeScript 规范
- [x] 函数命名清晰，职责单一
- [x] 无 ESLint 警告
- [x] 有必要的代码注释

### 测试验证
- [x] 创建测试文章验证功能
- [x] 测试各种边界情况（空目录、格式错误等）

---

## 参考资料

- [gray-matter 文档](https://github.com/jonschlinkert/gray-matter)
- [Node.js fs 模块文档](https://nodejs.org/api/fs.html)
- [TypeScript 接口文档](https://www.typescriptlang.org/docs/handbook/interfaces.html)
