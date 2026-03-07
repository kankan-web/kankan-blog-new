# 阶段 3：飞书同步脚本开发

**阶段编号：** phase-3
**创建日期：** 2026-03-07
**状态：** 待执行
**依赖阶段：** phase-2

---

## 阶段目标

实现飞书文档同步功能，包括 API 客户端、图片处理、同步主逻辑和 GitHub Actions 工作流。

---

## 功能需求

### 需求 1：创建飞书 API 客户端

**描述：**
实现飞书开放平台 API 客户端，支持认证、获取文档列表、获取文档内容、下载图片。

**涉及文件：**
- 创建：`scripts/feishu-client.ts`

**验收标准：**
- [ ] `FeishuClient` 类实现完整
- [ ] `getAccessToken()` 方法：自动获取和刷新 access token
- [ ] `listFiles()` 方法：获取文件夹下的文件列表（支持分页）
- [ ] `getDocumentContent()` 方法：获取文档 Markdown 内容
- [ ] `downloadImage()` 方法：下载图片二进制数据
- [ ] Token 缓存机制正常工作
- [ ] 错误处理完善

---

### 需求 2：实现图片处理工具

**描述：**
实现图片下载、保存和 CDN 链接生成功能，自动处理文档中的飞书图片。

**涉及文件：**
- 创建：`scripts/image-processor.ts`

**验收标准：**
- [ ] `ImageProcessor` 类实现完整
- [ ] `processImages()` 方法：识别并处理 Markdown 中的飞书图片
- [ ] `extractFileToken()` 方法：从 URL 提取 file token
- [ ] `downloadAndSaveImage()` 方法：下载图片并保存到本地
- [ ] `detectImageExtension()` 方法：自动检测图片格式
- [ ] 图片按年月组织（`YYYY/MM/`）
- [ ] 图片按 MD5 哈希命名（避免重复）
- [ ] 生成 jsDelivr CDN 链接

---

### 需求 3：实现同步主逻辑

**描述：**
实现同步脚本主逻辑，遍历飞书文件夹，检查更新，下载内容，处理图片，保存文章。

**涉及文件：**
- 创建：`scripts/sync-feishu.ts`
- 修改：`package.json`（添加 sync 脚本）

**验收标准：**
- [ ] 主函数实现完整
- [ ] 读取环境变量（FEISHU_APP_ID, FEISHU_APP_SECRET, FEISHU_FOLDER_TOKEN）
- [ ] 遍历飞书文件夹，获取分类和文档
- [ ] 对比 `sync-state.json`，识别新增/修改的文档
- [ ] 下载文档内容，处理图片
- [ ] 解析 Front Matter，补充缺失字段
- [ ] 生成 slug，保存文章到对应分类目录
- [ ] 更新 `sync-state.json`
- [ ] 输出同步日志
- [ ] npm 脚本配置正确（`npm run sync`, `npm run sync:all`）

---

### 需求 4：创建 GitHub Actions 工作流

**描述：**
创建 GitHub Actions 工作流，支持手动触发同步，自动提交更改。

**涉及文件：**
- 创建：`.github/workflows/sync-feishu.yml`

**验收标准：**
- [ ] 工作流文件创建成功
- [ ] 支持手动触发（`workflow_dispatch`）
- [ ] 支持选择全量同步或增量同步
- [ ] 正确配置环境变量（从 GitHub Secrets 读取）
- [ ] 自动安装依赖
- [ ] 执行同步脚本
- [ ] 自动提交更改到 Git
- [ ] 使用 `[skip ci]` 避免循环触发

---

## 技术要求

### 技术栈
- TypeScript：脚本语言
- 飞书开放平台 API：文档同步
- axios：HTTP 请求
- crypto：MD5 哈希
- GitHub Actions：CI/CD

### 技术约束
- 飞书 API 需要 tenant_access_token 认证
- Token 有效期 2 小时，需要缓存和刷新
- 图片下载需要处理二进制数据
- 同步状态记录在 `sync-state.json`
- 文章保存路径：`content/posts/{分类}/{slug}.md`
- 图片保存路径：`public/images/{YYYY}/{MM}/{hash}.{ext}`
- CDN 链接格式：`https://cdn.jsdelivr.net/gh/{owner}/{repo}/public/images/{path}`

### 性能要求
- 单篇文档同步时间 < 10 秒
- 图片下载并发数 <= 5
- API 请求失败重试 3 次

---

## 实施注意事项

1. **飞书 API 认证：**
   - 使用 App ID 和 App Secret 获取 tenant_access_token
   - Token 缓存在内存中，过期前 1 分钟刷新
   - 所有 API 请求需要在 Header 中携带 Token

2. **图片处理：**
   - 识别 Markdown 中的飞书图片链接（包含 `feishu.cn` 或 `larksuite.com`）
   - 从 URL 中提取 `file_token` 参数
   - 下载图片并计算 MD5 哈希
   - 检测图片格式（JPEG, PNG, GIF, WebP）
   - 按年月组织目录，避免单个目录文件过多

3. **同步逻辑：**
   - 先获取根文件夹下的所有文件夹（作为分类）
   - 遍历每个分类文件夹，获取文档列表
   - 对比 `sync-state.json` 中的 `modifiedTime`
   - 只同步有更新的文档（增量同步）
   - 全量同步时删除 `sync-state.json`

4. **错误处理：**
   - API 调用失败：重试 3 次，指数退避
   - 图片下载失败：记录日志，跳过该图片
   - Front Matter 缺失：自动补充默认值
   - 文件写入失败：抛出错误，终止同步

5. **GitHub Actions：**
   - 使用 `ubuntu-latest` 运行环境
   - Node.js 版本 20
   - 使用 `npm ci` 安装依赖（更快更可靠）
   - Git 提交时配置用户名和邮箱
   - 使用 `|| exit 0` 避免无更改时失败

---

## 风险点

| 风险 | 影响 | 应对方案 |
|------|------|----------|
| 飞书 API 限流 | 高 | 实现请求限流和重试机制 |
| 图片下载失败 | 中 | 记录日志，跳过失败的图片 |
| Token 过期 | 中 | 实现自动刷新机制 |
| 网络不稳定 | 中 | 重试机制，指数退避 |
| GitHub Actions 超时 | 低 | 优化同步逻辑，减少不必要的操作 |

---

## 验收标准

### 功能验收
- [ ] 飞书 API 客户端正常工作
- [ ] 可以获取文档列表和内容
- [ ] 图片下载和处理正常
- [ ] 同步脚本可以正常运行
- [ ] GitHub Actions 工作流可以手动触发
- [ ] 同步后文章和图片正确保存
- [ ] `sync-state.json` 正确更新

### 代码质量
- [ ] 代码符合 TypeScript 规范
- [ ] 错误处理完善
- [ ] 日志输出清晰
- [ ] 无 ESLint 警告

### 测试验证
- [ ] 本地测试同步功能
- [ ] 测试增量同步和全量同步
- [ ] 测试 GitHub Actions 工作流
- [ ] 验证图片 CDN 链接可访问

---

## 参考资料

- [飞书开放平台文档](https://open.feishu.cn/document)
- [GitHub Actions 文档](https://docs.github.com/en/actions)
- [jsDelivr CDN 文档](https://www.jsdelivr.com/)
