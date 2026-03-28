# 博客系统配置清单

**创建日期：** 2026-03-03
**状态：** 待配置

本文档记录了在开始实施博客系统之前需要完成的配置和决策事项。

---

## 1. 个人信息配置

### 1.1 基本信息
- [x] **博客名称**：阿娟蛋
- [x] **个人简介**：前端开发者，专注 Web 和 AI 技术
- [x] **作者名称**：阿娟蛋
- [x] **联系邮箱**：2728360489@qq.com

### 1.2 社交链接（可选）
- [ ] GitHub：[_____________](https://github.com/kankan-web)
- [ ] Twitter：https://x.com/kankan2112022
- [ ] 微信公众号：______无_______
- [ ] 其他：_____________

### 1.3 网站元信息
- [ ] **网站描述**（SEO）：__web/AI/coding___________
- [ ] **关键词**：_______web/AI/coding________
- [ ] **网站图标**（favicon）：是否需要？路径：______暂时不用_______

### 1.4 关于页面
- [ ] 是否需要"关于"页面？需要
- [ ] 如果需要，内容草稿：___自定义__________

---

## 2. 飞书开放平台配置（机器人推送方案）

### 2.1 创建机器人应用
- [ ] 登录飞书开放平台：https://open.feishu.cn
- [ ] 创建企业自建应用（需启用「机器人」能力）
- [ ] 记录 **App ID**：cli_a92f639db63a5bcb
- [ ] 记录 **App Secret**：（存储在安全位置，不提交到代码仓库）

### 2.2 权限配置
需要申请以下权限：
- [ ] `im:message` - 接收消息（机器人被 @ 时触发）
- [ ] `im:message:send_as_bot` - 以机器人身份发送消息/卡片
- [ ] `docx:document:readonly` - 读取文档内容
- [ ] `drive:drive:readonly` - 访问云空间（下载图片）

### 2.3 事件订阅配置
- [ ] 订阅 `im.message.receive_v1` 事件（接收用户消息）
- [ ] 配置回调地址（机器人后端服务 URL）
- [ ] 订阅卡片交互回调（用户点击「确认同步」按钮）

### 2.4 GitHub Token 配置
- [ ] 创建 GitHub Personal Access Token（需 `repo` 权限）
- [ ] 配置到机器人后端服务的环境变量中

### 2.5 测试验证
- [ ] 在飞书对话框中 @机器人 发送一篇文档链接
- [ ] 确认机器人回复交互卡片
- [ ] 确认点击「确认同步」后文章正确提交到 GitHub 仓库

---

## 3. GitHub 仓库配置

### 3.1 仓库信息
- [x] 仓库是否已创建？是
- [x] **仓库名称**：kankan-web/kankan-blog-new
- [x] 仓库可见性：公开（Public）

### 3.2 GitHub Secrets 配置
在仓库的 Settings → Secrets and variables → Actions 中添加：
- [x] `FEISHU_APP_ID`：cli_a92f639db63a5bcb
- [x] `FEISHU_APP_SECRET`：43KZDoxt85RORNmvMyzeIbUFEoi0L1Tm
- [x] `FEISHU_FOLDER_TOKEN`：RvxrwcMCMikeGxkMQaMcHasNnxb

### 3.3 GitHub Discussions 配置（用于评论）
- [x] 在仓库中启用 Discussions 功能
  - Settings → General → Features → Discussions ✓
- [x] 创建评论分类（建议名称：Announcements 或 Comments）
- [x] 记录分类名称：Comments

### 3.4 Giscus 配置
- [x] 访问 https://giscus.app/zh-CN
- [x] 输入仓库名称，获取配置信息
- [x] 记录 **Repo ID**：R_kgDORbecnA
- [x] 记录 **Category ID**：DIC_kwDORbecnM4C3mlf

---

## 4. Vercel 部署配置

### 4.1 连接仓库
- [ ] 登录 Vercel：https://vercel.com（已有账号）
- [ ] 导入 GitHub 仓库（稍后部署）
- [ ] 选择框架预设：Next.js

### 4.2 环境变量配置
在 Vercel 项目设置中添加以下环境变量（部署时配置）：
- [ ] `NEXT_PUBLIC_SITE_URL`：使用 Vercel 提供的域名
- [ ] `NEXT_PUBLIC_GISCUS_REPO`：kankan-web/kankan-blog-new
- [ ] `NEXT_PUBLIC_GISCUS_REPO_ID`：R_kgDORbecnA
- [ ] `NEXT_PUBLIC_GISCUS_CATEGORY`：Comments
- [ ] `NEXT_PUBLIC_GISCUS_CATEGORY_ID`：DIC_kwDORbecnM4C3mlf

### 4.3 自定义域名（可选）
- [ ] 是否使用自定义域名？
- [ ] 如果是，域名：_____________
- [ ] DNS 配置：
  - [ ] 添加 A 记录或 CNAME 记录指向 Vercel
  - [ ] 等待 DNS 生效
  - [ ] Vercel 自动配置 HTTPS 证书

---

## 5. 视觉设计配置

### 5.1 配色方案
- [x] **浅色模式**：
  - 背景：#F9F4E1（米黄色）
  - 侧边栏：#2B2620（深棕色）
  - 文字：#3A352E（深棕色）
  - 点缀：#7E8C6A（橄榄绿）
- [x] **深色模式**：
  - 背景：#2B2620（深棕色）
  - 侧边栏：#1A1612（更深的棕黑色）
  - 文字：#E8E2CF（米白色）
  - 点缀：#8FA07C（浅橄榄绿）
- [x] **暗色模式**：第一版实现，自动跟随系统 + 手动切换

### 5.2 字体选择
- [x] 使用默认字体（Geist Sans）

### 5.3 Logo 和图标
- [x] 使用头像作为标识
- [ ] 头像文件：public/avatar.jpg（后续添加）

---

## 6. 功能确认

### 6.1 第一版必须实现的功能
- [x] 首页（个人介绍页）
- [x] 文章列表页（搜索 + 分类筛选）
- [x] 文章详情页
- [x] 关于页面
- [x] 响应式设计（桌面 + 移动端）
- [x] 暗色模式支持
- [x] 文章目录导航（TOC）
- [x] 阅读进度条
- [x] 回到顶部按钮
- [x] 代码块复制按钮
- [x] 上一篇/下一篇导航
- [x] 阅读时长估算
- [x] 评论系统（Giscus）
- [x] 全站搜索
- [x] Markdown 渲染和代码高亮

### 6.2 不需要的功能
- [x] 文章分享按钮
- [x] 文章浏览次数统计
- [x] 独立的分类页面
- [x] 独立的标签页面
- [x] 多语言支持

### 6.3 后续可以添加的功能
- [ ] RSS 订阅
- [ ] 站点地图（Sitemap）
- [ ] 相关文章推荐
- [ ] PWA 支持

---

## 7. 本地开发环境

### 7.1 环境变量文件
创建 `.env.local` 文件（不提交到 Git）：
```env
# 飞书配置
FEISHU_APP_ID=your_app_id
FEISHU_APP_SECRET=your_app_secret
FEISHU_FOLDER_TOKEN=your_folder_token

# Giscus 配置
NEXT_PUBLIC_GISCUS_REPO=username/repo
NEXT_PUBLIC_GISCUS_REPO_ID=your_repo_id
NEXT_PUBLIC_GISCUS_CATEGORY=Announcements
NEXT_PUBLIC_GISCUS_CATEGORY_ID=your_category_id

# 网站配置
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### 7.2 开发工具
- [ ] Node.js 版本：20.x 或更高
- [ ] 包管理器：npm、yarn 或 pnpm
- [ ] 代码编辑器：VS Code（推荐）

---

## 8. 设计规范文档

- [x] 已创建完整的设计规范文档：`docs/design-specs.md`
- [x] 包含所有设计决策和实现细节
- [x] 包含配色方案、布局设计、组件规范
- [x] 包含文案内容和关于页面草稿

## 9. 执行方式选择

请选择实施计划的执行方式：

### 方式 1：当前会话逐步执行
- 在当前会话中逐个任务执行
- 任务间进行代码审查
- 可以随时调整和优化
- 适合：希望参与每个步骤的决策

### 方式 2：使用 executing-plans 技能批量执行
- 在新会话中使用专门的执行技能
- 批量执行，设置检查点
- 更快速，但灵活性较低
- 适合：信任计划，希望快速完成

**你的选择**：□ 方式 1  □ 方式 2

---

## 9. 配置完成检查

在开始实施之前，请确认以下事项：

- [ ] 所有必需的配置信息已填写
- [ ] 飞书应用已创建并获得权限
- [ ] GitHub 仓库已创建
- [ ] GitHub Secrets 已配置
- [ ] Giscus 已配置（如果需要评论功能）
- [ ] 本地开发环境已准备好
- [ ] 已选择执行方式

---

## 10. 下一步行动

配置完成后，请告知 Claude：

1. "配置已完成，可以开始实施"
2. 或者："我选择方式 X 来执行实施计划"

Claude 将根据你的选择开始执行实施计划。

---

## 附录：常见问题

### Q1: 如何获取飞书文件夹 Token？
A: 在浏览器中打开飞书云文档文件夹，URL 中 `fldcn` 后面的字符串就是 Folder Token。

### Q2: Giscus 配置在哪里获取？
A: 访问 https://giscus.app/zh-CN，输入仓库信息后会自动生成配置。

### Q3: 是否必须使用自定义域名？
A: 不是必须的，Vercel 会提供免费的 `.vercel.app` 域名。

### Q4: 如何测试飞书同步功能？
A: 配置完成后，可以在本地运行 `npm run sync` 测试同步功能。

### Q5: 评论系统可以不用吗？
A: 可以，评论系统是可选的。如果不需要，可以跳过相关配置和实施步骤。
