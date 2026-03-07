# 阶段 4：Next.js 前端开发

**阶段编号：** phase-4
**创建日期：** 2026-03-07
**状态：** 待执行
**依赖阶段：** phase-2

---

## 阶段目标

实现博客前端页面，包括首页、文章详情页、分类页、标签页，以及相关的 React 组件。

---

## 功能需求

### 需求 1：创建首页

**描述：**
实现博客首页，展示最新文章列表，使用网格布局。

**涉及文件：**
- 修改：`app/page.tsx`
- 创建：`src/components/ArticleCard.tsx`

**验收标准：**
- [ ] 首页展示所有文章（按日期倒序）
- [ ] 使用响应式网格布局（桌面 3 列，平板 2 列，手机 1 列）
- [ ] `ArticleCard` 组件实现完整
- [ ] 文章卡片包含：封面图、标题、描述、日期、分类、标签
- [ ] 悬停效果和过渡动画
- [ ] 无文章时显示提示信息

---

### 需求 2：创建文章详情页

**描述：**
实现文章详情页，支持 Markdown 渲染、代码高亮、静态生成。

**涉及文件：**
- 创建：`app/posts/[slug]/page.tsx`
- 创建：`src/components/ArticleContent.tsx`

**验收标准：**
- [ ] 文章详情页正常显示
- [ ] Markdown 渲染正确（支持 GFM）
- [ ] 代码高亮正常工作
- [ ] 文章头部显示：标题、日期、分类、标签
- [ ] 使用 `generateStaticParams` 预生成所有文章页面
- [ ] 文章不存在时显示 404 页面
- [ ] 外部链接自动添加 `target="_blank"`

---

### 需求 3：创建分类和标签页面

**描述：**
实现分类列表页、分类文章列表页、标签云页面、标签文章列表页。

**涉及文件：**
- 创建：`app/categories/page.tsx`
- 创建：`app/categories/[category]/page.tsx`
- 创建：`app/tags/page.tsx`
- 创建：`app/tags/[tag]/page.tsx`

**验收标准：**
- [ ] 分类列表页展示所有分类及文章数量
- [ ] 分类文章列表页展示该分类下的所有文章
- [ ] 标签云页面展示所有标签及文章数量
- [ ] 标签文章列表页展示该标签下的所有文章
- [ ] 所有页面使用 `generateStaticParams` 静态生成
- [ ] 分类/标签不存在时显示 404 页面
- [ ] 响应式布局

---

## 技术要求

### 技术栈
- Next.js 14 App Router：页面路由
- React 19：UI 组件
- react-markdown：Markdown 渲染
- remark-gfm：GitHub 风格 Markdown
- rehype-highlight：代码高亮
- highlight.js：代码高亮样式
- date-fns：日期格式化

### 技术约束
- 所有页面必须使用静态生成（SSG）
- 使用 `generateStaticParams` 预生成动态路由
- 图片使用 Next.js Image 组件
- 使用 `@/lib/posts` 中的工具函数获取数据
- 不使用客户端数据获取（no `useEffect` for data fetching）

### 性能要求
- 首页加载时间 < 2 秒
- 文章详情页加载时间 < 1 秒
- 所有页面 Lighthouse 性能分数 > 90

---

## 实施注意事项

1. **首页实现：**
   - 使用 `getAllPosts()` 获取所有文章
   - 网格布局使用 TailwindCSS 的 grid 类
   - 文章卡片可点击，跳转到详情页

2. **文章详情页：**
   - 使用 `getPostBySlug()` 获取文章内容
   - Markdown 渲染使用 `react-markdown`
   - 代码高亮使用 `rehype-highlight`
   - 需要导入 highlight.js 样式（`github-dark.css`）

3. **分类和标签页：**
   - 分类列表页使用 `getAllCategories()`
   - 标签云页面使用 `getAllTags()`
   - 文章列表页复用 `ArticleCard` 组件

4. **静态生成：**
   - 文章详情页需要同时返回 slug 和 category
   - 分类页面需要返回所有分类名称
   - 标签页面需要返回所有标签名称

5. **样式设计：**
   - 使用 TailwindCSS 工具类
   - 保持简洁现代的设计风格
   - 响应式设计，支持移动端

---

## 风险点

| 风险 | 影响 | 应对方案 |
|------|------|----------|
| Markdown 渲染问题 | 高 | 测试各种 Markdown 语法，确保兼容性 |
| 代码高亮样式冲突 | 中 | 使用 CSS 模块或明确的样式作用域 |
| 静态生成失败 | 高 | 确保所有数据在构建时可用 |
| 图片加载慢 | 中 | 使用 Next.js Image 组件优化 |

---

## 验收标准

### 功能验收
- [ ] 首页正常显示文章列表
- [ ] 文章详情页正常显示内容
- [ ] 分类和标签页面正常工作
- [ ] 所有链接可点击，跳转正确
- [ ] Markdown 渲染正确
- [ ] 代码高亮正常

### 代码质量
- [ ] 代码符合 React 和 Next.js 规范
- [ ] 组件职责单一，可复用
- [ ] 无 TypeScript 类型错误
- [ ] 无 ESLint 警告

### 用户体验
- [ ] 页面加载速度快
- [ ] 响应式设计良好
- [ ] 悬停效果流畅
- [ ] 无明显的布局抖动

### 测试验证
- [ ] 本地运行 `npm run dev` 测试
- [ ] 运行 `npm run build` 测试静态生成
- [ ] 测试各种屏幕尺寸
- [ ] 测试不同的 Markdown 内容

---

## 参考资料

- [Next.js App Router 文档](https://nextjs.org/docs/app)
- [react-markdown 文档](https://github.com/remarkjs/react-markdown)
- [highlight.js 文档](https://highlightjs.org/)
- [TailwindCSS 文档](https://tailwindcss.com/docs)
