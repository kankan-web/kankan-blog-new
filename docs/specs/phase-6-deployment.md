# 阶段 6：部署配置和文档

**阶段编号：** phase-6
**创建日期：** 2026-03-07
**状态：** 待执行
**依赖阶段：** phase-5

---

## 阶段目标

配置 Next.js 静态导出，创建环境变量模板，编写项目文档，准备部署到 Vercel。

---

## 功能需求

### 需求 1：配置 Next.js 静态导出

**描述：**
配置 Next.js 以支持静态导出，配置图片域名白名单。

**涉及文件：**
- 修改：`next.config.js`

**验收标准：**
- [ ] 启用静态导出模式（`output: 'export'`）
- [ ] 配置图片优化（`images.unoptimized: true`）
- [ ] 配置图片域名白名单（jsDelivr CDN）
- [ ] 运行 `npm run build` 成功生成静态文件
- [ ] 生成的文件在 `out/` 目录

---

### 需求 2：创建环境变量模板

**描述：**
创建 `.env.example` 文件，说明所需的环境变量。

**涉及文件：**
- 创建：`.env.example`

**验收标准：**
- [ ] `.env.example` 文件创建成功
- [ ] 包含飞书相关环境变量说明
- [ ] 包含 GitHub 仓库信息说明
- [ ] 包含注释说明每个变量的用途

---

### 需求 3：编写项目文档

**描述：**
创建或更新 `README.md`，提供项目介绍、快速开始、部署说明等。

**涉及文件：**
- 创建/修改：`README.md`

**验收标准：**
- [ ] README 包含项目介绍
- [ ] README 包含功能特性列表
- [ ] README 包含快速开始指南
- [ ] README 包含同步飞书文档的说明
- [ ] README 包含部署到 Vercel 的说明
- [ ] README 包含发布文章的流程
- [ ] README 包含技术栈说明
- [ ] README 包含 License 信息

---

## 技术要求

### 技术栈
- Next.js 静态导出：生成静态 HTML
- Vercel：部署平台
- GitHub Actions：CI/CD

### 技术约束
- 静态导出不支持某些 Next.js 功能（如 ISR、Server Actions）
- 图片优化需要禁用（静态部署限制）
- 所有页面必须在构建时生成

### 性能要求
- 构建时间 < 2 分钟（假设 50 篇文章）
- 生成的静态文件总大小 < 10MB

---

## 实施注意事项

1. **Next.js 配置：**
   - `output: 'export'` 启用静态导出
   - `images.unoptimized: true` 禁用图片优化（静态部署需要）
   - `images.remotePatterns` 配置 jsDelivr CDN 域名

2. **环境变量：**
   - 飞书相关变量仅在同步脚本中使用
   - GitHub Actions 会自动提供 `GITHUB_REPOSITORY`
   - Vercel 环境变量用于评论系统（Giscus）

3. **README 编写：**
   - 使用 Markdown 格式
   - 包含代码示例和命令
   - 结构清晰，易于阅读
   - 包含必要的链接（文档、仓库等）

4. **部署准备：**
   - 确保 `.gitignore` 正确配置
   - 确保所有敏感信息不在代码中
   - 测试本地构建是否成功

---

## 风险点

| 风险 | 影响 | 应对方案 |
|------|------|----------|
| 静态导出失败 | 高 | 检查是否使用了不支持的功能 |
| 图片加载失败 | 中 | 验证 CDN 链接格式和域名配置 |
| 环境变量泄露 | 高 | 使用 `.env.example`，不提交 `.env` |
| 文档不完整 | 低 | 参考其他项目的 README |

---

## 验收标准

### 功能验收
- [ ] Next.js 配置正确，静态导出成功
- [ ] `.env.example` 文件完整
- [ ] README 文档完整清晰
- [ ] 本地构建成功（`npm run build`）
- [ ] 生成的静态文件可以正常访问

### 代码质量
- [ ] 配置文件格式正确
- [ ] 文档使用正确的 Markdown 语法
- [ ] 无拼写错误

### 部署准备
- [ ] 所有敏感信息已移除
- [ ] `.gitignore` 配置正确
- [ ] 项目可以推送到 GitHub
- [ ] 准备好部署到 Vercel

### 测试验证
- [ ] 运行 `npm run build` 成功
- [ ] 检查 `out/` 目录的文件
- [ ] 本地预览静态文件（可使用 `npx serve out`）

---

## 参考资料

- [Next.js 静态导出文档](https://nextjs.org/docs/app/building-your-application/deploying/static-exports)
- [Vercel 部署文档](https://vercel.com/docs)
- [GitHub Actions 文档](https://docs.github.com/en/actions)
- [Markdown 语法指南](https://www.markdownguide.org/)
