# 飞书同步脚本开发实施计划

> **For Claude:** REQUIRED SUB-SKILL: Use executing-plans to implement this plan task-by-task.

**Goal:** 实现飞书文档同步功能，包括 API 客户端、图片处理、同步主逻辑和 GitHub Actions 工作流

**Architecture:** 使用飞书开放平台 API 获取文档内容，通过图片处理器下载并转换图片链接为 CDN 地址，同步脚本负责协调整个流程并维护同步状态

**Tech Stack:** TypeScript, 飞书开放平台 API, axios, crypto, GitHub Actions

---

## Task 1: 创建飞书 API 客户端

**Files:**
- Create: `scripts/feishu-client.ts`

**Step 1: 创建 FeishuClient 类基础结构**

```typescript
import axios, { AxiosInstance } from 'axios';

interface TokenCache {
  token: string;
  expiresAt: number;
}

export class FeishuClient {
  private appId: string;
  private appSecret: string;
  private tokenCache: TokenCache | null = null;
  private axiosInstance: AxiosInstance;

  constructor(appId: string, appSecret: string) {
    this.appId = appId;
    this.appSecret = appSecret;
    this.axiosInstance = axios.create({
      baseURL: 'https://open.feishu.cn/open-api',
      timeout: 30000,
    });
  }

  /**
   * 获取 access token（带缓存和自动刷新）
   */
  async getAccessToken(): Promise<string> {
    // 检查缓存是否有效（提前 1 分钟刷新）
    if (this.tokenCache && this.tokenCache.expiresAt > Date.now() + 60000) {
      return this.tokenCache.token;
    }

    // 获取新 token
    const response = await this.axiosInstance.post('/auth/v3/tenant_access_token/internal', {
      app_id: this.appId,
      app_secret: this.appSecret,
    });

    if (response.data.code !== 0) {
      throw new Error(`Failed to get access token: ${response.data.msg}`);
    }

    const token = response.data.tenant_access_token;
    const expiresIn = response.data.expire; // 秒数

    // 缓存 token
    this.tokenCache = {
      token,
      expiresAt: Date.now() + expiresIn * 1000,
    };

    return token;
  }
}
```

**Step 2: 实现获取文件列表方法**

```typescript
  /**
   * 获取文件夹下的文件列表（支持分页）
   */
  async listFiles(folderToken: string): Promise<any[]> {
    const token = await this.getAccessToken();
    const allFiles: any[] = [];
    let pageToken: string | undefined;

    do {
      const response = await this.axiosInstance.get('/drive/v1/files', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: {
          folder_token: folderToken,
          page_size: 200,
          page_token: pageToken,
        },
      });

      if (response.data.code !== 0) {
        throw new Error(`Failed to list files: ${response.data.msg}`);
      }

      allFiles.push(...response.data.data.files);
      pageToken = response.data.data.next_page_token;
    } while (pageToken);

    return allFiles;
  }
```

**Step 3: 实现获取文档内容方法**

```typescript
  /**
   * 获取文档 Markdown 内容
   */
  async getDocumentContent(documentId: string): Promise<string> {
    const token = await this.getAccessToken();

    const response = await this.axiosInstance.get(`/docx/v1/documents/${documentId}/raw_content`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.data.code !== 0) {
      throw new Error(`Failed to get document content: ${response.data.msg}`);
    }

    return response.data.data.content;
  }
```

**Step 4: 实现下载图片方法**

```typescript
  /**
   * 下载图片二进制数据
   */
  async downloadImage(fileToken: string): Promise<Buffer> {
    const token = await this.getAccessToken();

    const response = await this.axiosInstance.get(`/drive/v1/medias/${fileToken}/download`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      responseType: 'arraybuffer',
    });

    if (response.status !== 200) {
      throw new Error(`Failed to download image: ${response.statusText}`);
    }

    return Buffer.from(response.data);
  }
```

**Step 5: 添加重试机制**

在类的顶部添加重试辅助方法：

```typescript
  /**
   * 带重试的请求包装器
   */
  private async retryRequest<T>(
    fn: () => Promise<T>,
    maxRetries: number = 3,
    delay: number = 1000
  ): Promise<T> {
    let lastError: Error | null = null;

    for (let i = 0; i < maxRetries; i++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error as Error;
        if (i < maxRetries - 1) {
          await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i)));
        }
      }
    }

    throw lastError;
  }
```

然后修改所有方法使用 retryRequest 包装。

**Step 6: Commit**

```bash
git add scripts/feishu-client.ts
git commit -m "feat: 实现飞书 API 客户端"
```

---

## Task 2: 实现图片处理工具

**Files:**
- Create: `scripts/image-processor.ts`

**Step 1: 创建 ImageProcessor 类基础结构**

```typescript
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import { FeishuClient } from './feishu-client';

export class ImageProcessor {
  private feishuClient: FeishuClient;
  private githubRepo: string;

  constructor(feishuClient: FeishuClient, githubRepo: string) {
    this.feishuClient = feishuClient;
    this.githubRepo = githubRepo;
  }

  /**
   * 从飞书图片 URL 提取 file token
   */
  private extractFileToken(url: string): string | null {
    const match = url.match(/file_token=([^&]+)/);
    return match ? match[1] : null;
  }

  /**
   * 检测图片格式
   */
  private detectImageExtension(buffer: Buffer): string {
    // JPEG
    if (buffer[0] === 0xFF && buffer[1] === 0xD8 && buffer[2] === 0xFF) {
      return 'jpg';
    }
    // PNG
    if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4E && buffer[3] === 0x47) {
      return 'png';
    }
    // GIF
    if (buffer[0] === 0x47 && buffer[1] === 0x49 && buffer[2] === 0x46) {
      return 'gif';
    }
    // WebP
    if (buffer[8] === 0x57 && buffer[9] === 0x45 && buffer[10] === 0x42 && buffer[11] === 0x50) {
      return 'webp';
    }
    return 'jpg'; // 默认
  }
}
```

**Step 2: 实现下载并保存图片方法**

```typescript
  /**
   * 下载图片并保存到本地
   */
  private async downloadAndSaveImage(fileToken: string): Promise<string> {
    // 下载图片
    const imageBuffer = await this.feishuClient.downloadImage(fileToken);

    // 计算 MD5 哈希
    const hash = crypto.createHash('md5').update(imageBuffer).digest('hex');

    // 检测图片格式
    const ext = this.detectImageExtension(imageBuffer);

    // 按年月组织目录
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const dirPath = path.join(process.cwd(), 'public', 'images', String(year), month);

    // 确保目录存在
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }

    // 保存图片
    const filename = `${hash}.${ext}`;
    const filePath = path.join(dirPath, filename);

    // 如果文件已存在，跳过
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, imageBuffer);
    }

    // 返回相对路径
    return `${year}/${month}/${filename}`;
  }
```

**Step 3: 实现处理 Markdown 中的图片方法**

```typescript
  /**
   * 处理 Markdown 中的飞书图片
   */
  async processImages(markdown: string): Promise<string> {
    // 匹配 Markdown 图片语法
    const imageRegex = /!\[([^\]]*)\]\(([^)]+)\)/g;
    let result = markdown;
    const matches = [...markdown.matchAll(imageRegex)];

    for (const match of matches) {
      const [fullMatch, alt, url] = match;

      // 检查是否是飞书图片
      if (!url.includes('feishu.cn') && !url.includes('larksuite.com')) {
        continue;
      }

      try {
        // 提取 file token
        const fileToken = this.extractFileToken(url);
        if (!fileToken) {
          console.warn(`无法提取 file token: ${url}`);
          continue;
        }

        // 下载并保存图片
        const relativePath = await this.downloadAndSaveImage(fileToken);

        // 生成 CDN 链接
        const cdnUrl = `https://cdn.jsdelivr.net/gh/${this.githubRepo}/public/images/${relativePath}`;

        // 替换链接
        result = result.replace(fullMatch, `![${alt}](${cdnUrl})`);

        console.log(`✓ 图片处理成功: ${relativePath}`);
      } catch (error) {
        console.error(`✗ 图片处理失败: ${url}`, error);
        // 继续处理其他图片
      }
    }

    return result;
  }
```

**Step 4: Commit**

```bash
git add scripts/image-processor.ts
git commit -m "feat: 实现图片处理工具"
```

---

## Task 3: 实现同步主逻辑

**Files:**
- Create: `scripts/sync-feishu.ts`

**Step 1: 创建同步脚本基础结构**

```typescript
import * as fs from 'fs';
import * as path from 'path';
import matter from 'gray-matter';
import { FeishuClient } from './feishu-client';
import { ImageProcessor } from './image-processor';
import { SyncState } from '../types/feishu';

// 读取环境变量
const FEISHU_APP_ID = process.env.FEISHU_APP_ID!;
const FEISHU_APP_SECRET = process.env.FEISHU_APP_SECRET!;
const FEISHU_FOLDER_TOKEN = process.env.FEISHU_FOLDER_TOKEN!;
const GITHUB_REPO = process.env.GITHUB_REPO || 'username/repo';

// 同步状态文件路径
const SYNC_STATE_PATH = path.join(process.cwd(), 'sync-state.json');

/**
 * 读取同步状态
 */
function loadSyncState(): SyncState {
  if (fs.existsSync(SYNC_STATE_PATH)) {
    const content = fs.readFileSync(SYNC_STATE_PATH, 'utf-8');
    return JSON.parse(content);
  }
  return {
    lastSyncTime: new Date().toISOString(),
    documents: {},
  };
}

/**
 * 保存同步状态
 */
function saveSyncState(state: SyncState): void {
  fs.writeFileSync(SYNC_STATE_PATH, JSON.stringify(state, null, 2));
}

/**
 * 生成 slug
 */
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}
```

**Step 2: 实现主同步函数**

```typescript
/**
 * 主同步函数
 */
async function syncFeishu() {
  console.log('🚀 开始同步飞书文档...\n');

  // 检查环境变量
  if (!FEISHU_APP_ID || !FEISHU_APP_SECRET || !FEISHU_FOLDER_TOKEN) {
    throw new Error('缺少必要的环境变量');
  }

  // 初始化客户端
  const feishuClient = new FeishuClient(FEISHU_APP_ID, FEISHU_APP_SECRET);
  const imageProcessor = new ImageProcessor(feishuClient, GITHUB_REPO);

  // 读取同步状态
  const syncState = loadSyncState();
  let syncCount = 0;

  try {
    // 获取根文件夹下的所有文件夹（作为分类）
    console.log('📂 获取分类列表...');
    const rootFiles = await feishuClient.listFiles(FEISHU_FOLDER_TOKEN);
    const categories = rootFiles.filter(file => file.type === 'folder');

    console.log(`找到 ${categories.length} 个分类\n`);

    // 遍历每个分类
    for (const category of categories) {
      const categoryName = category.name;
      console.log(`\n📁 处理分类: ${categoryName}`);

      // 获取分类下的文档列表
      const documents = await feishuClient.listFiles(category.token);
      const docFiles = documents.filter(file => file.type === 'docx');

      console.log(`  找到 ${docFiles.length} 篇文档`);

      // 遍历每篇文档
      for (const doc of docFiles) {
        const documentId = doc.token;
        const title = doc.name;
        const modifiedTime = doc.modified_time;

        // 检查是否需要同步
        const cachedDoc = syncState.documents[documentId];
        if (cachedDoc && cachedDoc.modifiedTime >= modifiedTime) {
          console.log(`  ⏭️  跳过: ${title} (无更新)`);
          continue;
        }

        console.log(`  📄 同步: ${title}`);

        try {
          // 获取文档内容
          const content = await feishuClient.getDocumentContent(documentId);

          // 处理图片
          const processedContent = await imageProcessor.processImages(content);

          // 解析 Front Matter
          const { data: frontMatter, content: markdownContent } = matter(processedContent);

          // 补充缺失字段
          if (!frontMatter.title) frontMatter.title = title;
          if (!frontMatter.date) frontMatter.date = new Date().toISOString().split('T')[0];
          if (!frontMatter.category) frontMatter.category = categoryName;
          if (!frontMatter.tags) frontMatter.tags = [];
          if (!frontMatter.description) {
            // 提取前 100 个字符作为描述
            frontMatter.description = markdownContent.slice(0, 100).replace(/\n/g, ' ').trim();
          }

          // 生成 slug
          const slug = generateSlug(frontMatter.title);

          // 保存文章
          const categoryDir = path.join(process.cwd(), 'content', 'posts', categoryName);
          if (!fs.existsSync(categoryDir)) {
            fs.mkdirSync(categoryDir, { recursive: true });
          }

          const filePath = path.join(categoryDir, `${slug}.md`);
          const fileContent = matter.stringify(markdownContent, frontMatter);
          fs.writeFileSync(filePath, fileContent);

          // 更新同步状态
          syncState.documents[documentId] = {
            title,
            modifiedTime,
            localPath: filePath,
          };

          syncCount++;
          console.log(`  ✓ 保存成功: ${filePath}`);
        } catch (error) {
          console.error(`  ✗ 同步失败: ${title}`, error);
        }
      }
    }

    // 保存同步状态
    syncState.lastSyncTime = new Date().toISOString();
    saveSyncState(syncState);

    console.log(`\n✅ 同步完成！共同步 ${syncCount} 篇文档`);
  } catch (error) {
    console.error('\n❌ 同步失败:', error);
    process.exit(1);
  }
}

// 执行同步
syncFeishu();
```

**Step 3: Commit**

```bash
git add scripts/sync-feishu.ts
git commit -m "feat: 实现同步主逻辑"
```

---

## Task 4: 添加 npm 脚本

**Files:**
- Modify: `package.json`

**Step 1: 添加同步脚本**

在 `package.json` 的 `scripts` 字段中添加：

```json
"sync": "tsx scripts/sync-feishu.ts",
"sync:all": "rm -f sync-state.json && tsx scripts/sync-feishu.ts"
```

**Step 2: 安装 tsx 依赖**

```bash
npm install -D tsx
```

**Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "feat: 添加同步脚本命令"
```

---

## Task 5: 创建 GitHub Actions 工作流

**Files:**
- Create: `.github/workflows/sync-feishu.yml`

**Step 1: 创建工作流文件**

```yaml
name: 同步飞书文档

on:
  workflow_dispatch:
    inputs:
      sync_mode:
        description: '同步模式'
        required: true
        default: 'incremental'
        type: choice
        options:
          - incremental
          - full

jobs:
  sync:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Install dependencies
        run: npm ci

      - name: Delete sync state (full sync)
        if: github.event.inputs.sync_mode == 'full'
        run: rm -f sync-state.json

      - name: Sync Feishu documents
        env:
          FEISHU_APP_ID: ${{ secrets.FEISHU_APP_ID }}
          FEISHU_APP_SECRET: ${{ secrets.FEISHU_APP_SECRET }}
          FEISHU_FOLDER_TOKEN: ${{ secrets.FEISHU_FOLDER_TOKEN }}
          GITHUB_REPO: ${{ github.repository }}
        run: npm run sync

      - name: Commit changes
        run: |
          git config --local user.email "github-actions[bot]@users.noreply.github.com"
          git config --local user.name "github-actions[bot]"
          git add -A
          git diff --quiet && git diff --staged --quiet || git commit -m "chore: 同步飞书文档 [skip ci]"
          git push || exit 0
```

**Step 2: 创建 .github/workflows 目录**

```bash
mkdir -p .github/workflows
```

**Step 3: Commit**

```bash
git add .github/workflows/sync-feishu.yml
git commit -m "feat: 添加 GitHub Actions 同步工作流"
```

---

## 验证清单

完成所有任务后，进行以下验证：

1. **代码检查**
   - [ ] 所有 TypeScript 文件无语法错误
   - [ ] 无 ESLint 警告
   - [ ] 类型定义正确

2. **功能测试**
   - [ ] 创建 `.env` 文件配置环境变量
   - [ ] 运行 `npm run sync` 测试增量同步
   - [ ] 运行 `npm run sync:all` 测试全量同步
   - [ ] 检查 `content/posts/` 目录下的文章
   - [ ] 检查 `public/images/` 目录下的图片
   - [ ] 验证图片 CDN 链接可访问

3. **GitHub Actions**
   - [ ] 在 GitHub 仓库设置 Secrets
   - [ ] 手动触发工作流
   - [ ] 检查工作流执行日志
   - [ ] 验证自动提交功能

---

## 注意事项

1. 首次运行前需要配置环境变量
2. 图片下载可能较慢，请耐心等待
3. 如遇到 API 限流，脚本会自动重试
4. 建议先在本地测试，确认无误后再使用 GitHub Actions
