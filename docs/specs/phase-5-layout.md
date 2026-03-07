# 阶段 5：布局和导航

**阶段编号：** phase-5
**创建日期：** 2026-03-07
**状态：** 待执行
**依赖阶段：** phase-4

---

## 阶段目标

实现全局布局、导航栏、页脚，提供统一的页面结构和导航体验。

---

## 功能需求

### 需求 1：创建 Header 组件

**描述：**
实现顶部导航栏，包含博客名称和主导航菜单。

**涉及文件：**
- 创建：`src/components/Header.tsx`

**验收标准：**
- [ ] Header 组件实现完整
- [ ] 显示博客名称（可点击，跳转首页）
- [ ] 导航菜单包含：首页、分类、标签
- [ ] 导航链接有悬停效果
- [ ] 响应式设计（移动端可考虑汉堡菜单）
- [ ] 固定在页面顶部或随页面滚动

---

### 需求 2：创建 Footer 组件

**描述：**
实现页脚，显示版权信息和其他链接。

**涉及文件：**
- 创建：`src/components/Footer.tsx`

**验收标准：**
- [ ] Footer 组件实现完整
- [ ] 显示版权信息（动态年份）
- [ ] 可选：显示社交链接、RSS 订阅等
- [ ] 样式与整体设计一致
- [ ] 固定在页面底部

---

### 需求 3：更新全局布局

**描述：**
更新 `app/layout.tsx`，集成 Header 和 Footer，提供统一的页面结构。

**涉及文件：**
- 修改：`app/layout.tsx`

**验收标准：**
- [ ] 全局布局包含 Header、主内容区、Footer
- [ ] 使用 Flexbox 或 Grid 布局，确保 Footer 始终在底部
- [ ] 设置全局元数据（title, description）
- [ ] 引入全局样式
- [ ] 设置 HTML lang 属性为 "zh-CN"

---

## 技术要求

### 技术栈
- Next.js 16 App Router：布局系统
- React 19：组件
- TailwindCSS：样式
- Next.js Link：客户端路由

### 技术约束
- 使用 Next.js Link 组件进行导航
- 布局使用 Flexbox 或 Grid，确保 Footer 在底部
- 全局样式在 `app/globals.css` 中定义
- 元数据使用 Next.js Metadata API

### 性能要求
- 导航切换无明显延迟
- 布局不应导致页面抖动

---

## 实施注意事项

1. **Header 设计：**
   - 简洁现代的设计
   - 导航链接使用 Next.js Link 组件
   - 当前页面的导航项可以高亮显示（可选）
   - 移动端可以使用汉堡菜单（可选，简单项目可以直接显示）

2. **Footer 设计：**
   - 显示版权信息：`© {new Date().getFullYear()} 博客名称`
   - 可以添加社交链接、GitHub、邮箱等
   - 样式简洁，不抢主内容的风头

3. **全局布局：**
   - 使用 `min-h-screen` 确保页面至少占满视口高度
   - 使用 Flexbox 布局：`flex flex-col min-h-screen`
   - 主内容区使用 `flex-1` 占据剩余空间
   - Header 和 Footer 高度固定或自适应

4. **元数据配置：**
   - 设置默认的 title 和 description
   - 可以在各个页面中覆盖元数据

---

## 风险点

| 风险 | 影响 | 应对方案 |
|------|------|----------|
| Footer 不在底部 | 中 | 使用 Flexbox 布局，确保正确的结构 |
| 导航链接不工作 | 高 | 使用 Next.js Link 组件，测试路由 |
| 移动端导航体验差 | 中 | 简化导航或实现汉堡菜单 |

---

## 验收标准

### 功能验收
- [ ] Header 正常显示，导航链接可点击
- [ ] Footer 正常显示，固定在底部
- [ ] 全局布局结构正确
- [ ] 所有页面都应用了统一的布局
- [ ] 元数据正确设置

### 代码质量
- [ ] 组件代码清晰，职责单一
- [ ] 无 TypeScript 类型错误
- [ ] 无 ESLint 警告
- [ ] 样式使用 TailwindCSS 工具类

### 用户体验
- [ ] 导航切换流畅
- [ ] 布局在不同屏幕尺寸下正常
- [ ] Footer 始终在页面底部
- [ ] 无明显的布局抖动

### 测试验证
- [ ] 测试所有导航链接
- [ ] 测试不同屏幕尺寸
- [ ] 测试页面内容较少时 Footer 的位置

---

## 参考资料

- [Next.js Layout 文档](https://nextjs.org/docs/app/building-your-application/routing/pages-and-layouts)
- [Next.js Metadata 文档](https://nextjs.org/docs/app/building-your-application/optimizing/metadata)
- [TailwindCSS Flexbox 文档](https://tailwindcss.com/docs/flex)
