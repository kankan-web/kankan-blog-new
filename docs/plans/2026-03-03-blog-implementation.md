# 个人博客系统实施计划

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**目标：** 构建一个基于 Next.js 的个人博客系统，使用飞书文档作为写作平台，支持手动同步、分类标签、搜索和评论功能。

**架构：** 采用 Next.js 14 App Router + TypeScript + TailwindCSS 构建静态博客前端，通过 GitHub Actions 手动触发飞书文档同步，将内容和图片存储在 Git 仓库，部署到 Vercel。

**技术栈：** Next.js 14、TypeScript、TailwindCSS、react-markdown、FlexSearch、Giscus、飞书开放平台 API

---

## 阶段 1：项目初始化和基础配置

### 任务 1.1：初始化 Next.js 项目

**文件：**
- 创建项目根目录配置文件

**步骤 1：创建 Next.js 项目**

运行：
```bash
npx create-next-app@latest . --typescript --tailwind --app --no-src --import-alias "@/*"
```

选项说明：
- TypeScript: Yes
- ESLint: Yes
- Tailwind CSS: Yes
- App Router: Yes
- Import alias: @/*

**步骤 2：验证项目创建**

运行：`npm run dev`
预期：开发服务器启动在 http://localhost:3000

**步骤 3：清理默认文件**

删除不需要的默认内容：
- `app/page.tsx` 中的默认内容
- `app/globals.css` 中除 Tailwind 指令外的样式

**步骤 4：提交初始化**

```bash
git add .
git commit -m "chore: 初始化 Next.js 项目

- 使用 Next.js 14 App Router
- 配置 TypeScript 和 TailwindCSS
- 清理默认模板内容

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```

---

### 任务 1.2：创建项目目录结构

**文件：**
- 创建：`content/posts/.gitkeep`
- 创建：`public/images/.gitkeep`
- 创建：`scripts/.gitkeep`
- 创建：`src/components/.gitkeep`
- 创建：`src/lib/.gitkeep`
- 创建：`sync-state.json`

**步骤 1：创建目录结构**

```bash
mkdir -p content/posts public/images scripts src/components src/lib
touch content/posts/.gitkeep public/images/.gitkeep scripts/.gitkeep
touch src/components/.gitkeep src/lib/.gitkeep
```

**步骤 2：创建同步状态文件**

创建 `sync-state.json`：
```json
{
  "lastSync": null,
  "documents": {}
}
```

**步骤 3：更新 .gitignore**

在 `.gitignore` 中添加：
```
# 同步临时文件
.sync-temp/

# 环境变量
.env.local
.env

# 构建输出
.next/
out/
```

**步骤 4：提交目录结构**

```bash
git add .
git commit -m "chore: 创建项目目录结构

- content/posts: 存储文章 Markdown 文件
- public/images: 存储文章图片
- scripts: 同步脚本
- src/components: React 组件
- src/lib: 工具库
- sync-state.json: 同步状态记录

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```

---

### 任务 1.3：安装核心依赖

**文件：**
- 修改：`package.json`

**步骤 1：安装 Markdown 相关依赖**

```bash
npm install react-markdown remark-gfm rehype-highlight rehype-raw gray-matter
```

**步骤 2：安装搜索和工具库**

```bash
npm install flexsearch date-fns
npm install -D @types/flexsearch
```

**步骤 3：安装飞书 SDK 和工具**

```bash
npm install @larksuiteoapi/node-sdk axios
npm install -D @types/node
```

**步骤 4：验证安装**

运行：`npm list`
预期：所有依赖正确安装，无错误

**步骤 5：提交依赖**

```bash
git add package.json package-lock.json
git commit -m "chore: 安装核心依赖

- Markdown 渲染: react-markdown, remark-gfm, rehype-highlight
- 元数据解析: gray-matter
- 搜索功能: flexsearch
- 飞书集成: @lsuiteoapi/node-sdk
- 工具库: date-fns, axios

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```

---

## 阶段 2：类型定义和工具函数

### 任务 2.1：定义核心类型

**文件：**
- 创建：`src/types/post.ts`
- 创建：`src/types/feishu.ts`

**步骤 1：创建文章类型定义**

创建 `src/types/post.ts`：
```typescript
export interface PostFrontMatter {
  title: string;
  date: string;
  tags: string[];
  description: string;
  cover?: string;
  category: string;
}

export interface Post extends PostFrontMatter {
  slug: string;
  content: string;
  excerpt: string;
}

export interface PostMetadata {
  slug: string;
  title: string;
  date: string;
  tags: string[];
  description: string;
  cover?: string;
  category: string;
  excerpt: string;
}
```

**步骤 2：创建飞书类型定义**

创建 `src/types/feishu.ts`：
```typescript
export interface FeishuDocument {
  token: string;
  title: string;
  modifiedTime: string;
  parentToken: string;
}

export interface FeishuFolder {
  token: string;
  name: string;
}

export interface SyncState {
  lastSync: string | null;
  documents: Record<string, {
    token: string;
    modifiedTime: string;
    slug: string;
    category: string;
  }>;
}
```

**步骤 3：提交类型定义**

```bash
git add src/types/
git commit -m "feat: 添加核心类型定义

- Post 类型: 文章数据结构
- PostFrontMatter: Front Matter 元数据
- FeishuDocument: 飞书文档数据
- SyncState: 同步状态记录

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```

---

### 任务 2.2：创建文章读取工具

**文件：**
- 创建：`src/lib/posts.ts`

**步骤 1：实现文章读取函数**

创建 `src/lib/posts.ts`：
```typescript
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { Post, PostMetadata } from '@/types/post';

const postsDirectory = path.join(process.cwd(), 'content/posts');

export function getAllPosts(): PostMetadata[] {
  const categories = fs.readdirSync(postsDirectory);
  const posts: PostMetadata[] = [];

  categories.forEach(category => {
    const categoryPath = path.join(postsDirectory, category);
    if (!fs.statSync(categoryPath).isDirectory()) return;

    const files = fs.readdirSync(categoryPath).filter(file => file.endsWith('.md'));

    files.forEach(file => {
      const slug = file.replace(/\.md$/, '');
      const fullPath = path.join(categoryPath, file);
      const fileContents = fs.readFileSync(fullPath, 'utf8');
      const { data, content } = matter(fileContents);

      posts.push({
        slug,
        category,
        title: data.title,
        date: data.date,
        tags: data.tags || [],
        description: data.description,
        cover: data.cover,
        excerpt: content.slice(0, 200).trim() + '...',
      });
    });
  });

  return posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function getPostBySlug(slug: string, category: string): Post | null {
  try {
    const fullPath = path.join(postsDirectory, category, `${slug}.md`);
    const fileContents = fs.readFileSync(fullPath, 'utf8');
    const { data, content } = matter(fileContents);

    return {
      slug,
      category,
      title: data.title,
      date: data.date,
      tags: data.tags || [],
      description: data.description,
      cover: data.cover,
      content,
      excerpt: content.slice(0, 200).trim() + '...',
    };
  } catch {
    return null;
  }
}

export function getPostsByCategory(category: string): PostMetadata[] {
  return getAllPosts().filter(post => post.category === category);
}

export function getPostsByTag(tag: string): PostMetadata[] {
  return getAllPosts().filter(post => post.tags.includes(tag));
}

export function getAllCategories(): string[] {
  const categories = fs.readdirSync(postsDirectory);
  return categories.filter(category => {
    const categoryPath = path.join(postsDirectory, category);
    return fs.statSync(categoryPath).isDirectory();
  });
}

export function getAllTags(): string[] {
  const posts = getAllPosts();
  const tags = new Set<string>();
  posts.forEach(post => post.tags.forEach(tag => tags.add(tag)));
  return Array.from(tags).sort();
}
```

**步骤 2：提交文章工具函数**

```bash
git add src/lib/posts.ts
git commit -m "feat: 实现文章读取工具函数

- getAllPosts: 获取所有文章列表
- getPostBySlug: 根据 slug 获取文章详情
- getPostsByCategory: 按分类获取文章
- getPostsByTag: 按标签获取文章
- getAllCategories: 获取所有分类
- getAllTags: 获取所有标签

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```

---

## 阶段 3：飞书同步脚本开发

### 任务 3.1：创建飞书 API 客户端

**文件：**
- 创建：`scripts/feishu-client.ts`

**步骤 1：实现飞书认证和基础 API**

创建 `scripts/feishu-client.ts`：
```typescript
import axios from 'axios';

const FEISHU_API_BASE = 'https://open.feishu.cn/open-apis';

export class FeishuClient {
  private appId: string;
  private appSecret: string;
  private accessToken: string | null = null;
  private tokenExpireTime: number = 0;

  constructor(appId: string, appSecret: string) {
    this.appId = appId;
    this.appSecret = appSecret;
  }

  async getAccessToken(): Promise<string> {
    if (this.accessToken && Date.now() < this.tokenExpireTime) {
      return this.accessToken;
    }

    const response = await axios.post(`${FEISHU_API_BASE}/auth/v3/tenant_access_token/internal`, {
      app_id: this.appId,
      app_secret: this.appSecret,
    });

    if (response.data.code !== 0) {
      throw new Error(`获取 access token 失败: ${response.data.msg}`);
    }

    this.accessToken = response.data.tenant_access_token;
    this.tokenExpireTime = Date.now() + (response.data.expire - 60) * 1000;

    return this.accessToken;
  }

  async listFiles(folderToken: string): Promise<any[]> {
    const token = await this.getAccessToken();
    const files: any[] = [];
    let pageToken = '';

    do {
      const response = await axios.get(`${FEISHU_API_BASE}/drive/v1/files`, {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          folder_token: folderToken,
          page_size: 200,
          page_token: pageToken || undefined,
        },
      });

      if (response.data.code !== 0) {
        throw new Error(`获取文件列表失败: ${response.data.msg}`);
      }

      files.push(...(response.data.data.files || []));
      pageToken = response.data.data.page_token || '';
    } while (pageToken);

    return files;
  }

  async getDocumentContent(documentId: string): Promise<string> {
    const token = await this.getAccessToken();

    const response = await axios.get(
      `${FEISHU_API_BASE}/docx/v1/documents/${documentId}/raw_content`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    if (response.data.code !== 0) {
      throw new Error(`获取文档内容失败: ${response.data.msg}`);
    }

    return response.data.data.content;
  }

  async downloadImage(fileToken: string): Promise<Buffer> {
    const token = await this.getAccessToken();

    const response = await axios.get(
      `${FEISHU_API_BASE}/drive/v1/medias/${fileToken}/download`,
      {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'arraybuffer',
      }
    );

    return Buffer.from(response.data);
  }
}
```

**步骤 2：提交飞书客户端**

```bash
git add scripts/feishu-client.ts
git commit -m "feat: 实现飞书 API 客户端

- 自动获取和刷新 access token
- listFiles: 获取文件夹下的文件列表
- getDocumentContent: 获取文档 Markdown 内容
- downloadImage: 下载图片

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```

---

### 任务 3.2：实现图片处理工具

**文件：**
- 创建：`scripts/image-processor.ts`

**步骤 1：实现图片下载和保存**

创建 `scripts/image-processor.ts`：
```typescript
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { FeishuClient } from './feishu-client';

export class ImageProcessor {
  private client: FeishuClient;
  private imagesDir: string;
  private repoOwner: string;
  private repoName: string;

  constructor(
    client: FeishuClient,
    imagesDir: string,
    repoOwner: string,
    repoName: string
  ) {
    this.client = client;
    this.imagesDir = imagesDir;
    this.repoOwner = repoOwner;
    this.repoName = repoName;
  }

  async processImages(content: string): Promise<string> {
    const imageRegex = /!\[([^\]]*)\]\(([^)]+)\)/g;
    let processedContent = content;
    const matches = Array.from(content.matchAll(imageRegex));

    for (const match of matches) {
      const [fullMatch, alt, url] = match;

      if (url.includes('feishu.cn') || url.includes('larksuite.com')) {
        try {
          const fileToken = this.extractFileToken(url);
          const newUrl = await this.downloadAndSaveImage(fileToken);
          processedContent = processedContent.replace(fullMatch, `![${alt}](${newUrl})`);
        } catch (error) {
          console.error(`处理图片失败: ${url}`, error);
        }
      }
    }

    return processedContent;
  }

  private extractFileToken(url: string): string {
    const match = url.match(/file_token=([^&]+)/);
    if (!match) {
      throw new Error(`无法从 URL 提取 file token: ${url}`);
    }
    return match[1];
  }

  private async downloadAndSaveImage(fileToken: string): Promise<string> {
    const imageBuffer = await this.client.downloadImage(fileToken);

    const hash = crypto.createHash('md5').update(imageBuffer).digest('hex');
    const ext = this.detectImageExtension(imageBuffer);
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');

    const relativePath = `${year}/${month}/${hash}.${ext}`;
    const fullPath = path.join(this.imagesDir, relativePath);

    fs.mkdirSync(path.dirname(fullPath), { recursive: true });
    fs.writeFileSync(fullPath, imageBuffer);

    const cdnUrl = `https://cdn.jsdelivr.net/gh/${this.repoOwner}/${this.repoName}/public/images/${relativePath}`;
    return cdnUrl;
  }

  private detectImageExtension(buffer: Buffer): string {
    if (buffer[0] === 0xFF && buffer[1] === 0xD8) return 'jpg';
    if (buffer[0] === 0x89 && buffer[1] === 0x50) return 'png';
    if (buffer[0] === 0x47 && buffer[1] === 0x49) return 'gif';
    if (buffer[0] === 0x52 && buffer[1] === 0x49) return 'webp';
    return 'jpg';
  }
}
```

**步骤 2：提交图片处理工具**

```bash
git add scripts/image-processor.ts
git commit -m "feat: 实现图片处理工具

- 自动识别飞书图片链接
- 下载图片并保存到本地
- 按年月组织图片目录
- 生成 jsDelivr CDN 链接
- 自动检测图片格式

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```

---

### 任务 3.3：实现同步主逻辑

**文件：**
- 创建：`scripts/sync-feishu.ts`

**步骤 1：实现同步脚本**

创建 `scripts/sync-feishu.ts`：
```typescript
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { FeishuClient } from './feishu-client';
import { ImageProcessor } from './image-processor';
import { SyncState } from '../src/types/feishu';

const SYNC_STATE_FILE = path.join(process.cwd(), 'sync-state.json');
const POSTS_DIR = path.join(process.cwd(), 'content/posts');
const IMAGES_DIR = path.join(process.cwd(), 'public/images');

async function main() {
  const appId = process.env.FEISHU_APP_ID!;
  const appSecret = process.env.FEISHU_APP_SECRET!;
  const folderToken = process.env.FEISHU_FOLDER_TOKEN!;
  const repoOwner = process.env.GITHUB_REPOSITORY?.split('/')[0] || 'username';
  const repoName = process.env.GITHUB_REPOSITORY?.split('/')[1] || 'repo';

  if (!appId || !appSecret || !folderToken) {
    throw new Error('缺少必要的环境变量');
  }

  const client = new FeishuClient(appId, appSecret);
  const imageProcessor = new ImageProcessor(client, IMAGES_DIR, repoOwner, repoName);

  const syncState: SyncState = fs.existsSync(SYNC_STATE_FILE)
    ? JSON.parse(fs.readFileSync(SYNC_STATE_FILE, 'utf8'))
    : { lastSync: null, documents: {} };

  console.log('开始同步飞书文档...');

  const files = await client.listFiles(folderToken);
  const folders = files.filter(f => f.type === 'folder');
  const documents = files.filter(f => f.type === 'docx');

  let syncCount = 0;

  for (const folder of folders) {
    const category = folder.name;
    const categoryPath = path.join(POSTS_DIR, category);
    fs.mkdirSync(categoryPath, { recursive: true });

    const categoryFiles = await client.listFiles(folder.token);
    const categoryDocs = categoryFiles.filter(f => f.type === 'docx');

    for (const doc of categoryDocs) {
      const existingDoc = syncState.documents[doc.token];
      const shouldSync = !existingDoc || existingDoc.modifiedTime !== doc.modified_time;

      if (shouldSync) {
        console.log(`同步文档: ${category}/${doc.name}`);

        const content = await client.getDocumentContent(doc.token);
        const processedContent = await imageProcessor.processImages(content);

        const { data: frontMatter, content: markdownContent } = matter(processedContent);

        if (!frontMatter.title) {
          frontMattdoc.name;
        }
        if (!frontMatter.category) {
          frontMatter.category = category;
        }

        const slug = generateSlug(frontMatter.title);
        const filePath = path.join(categoryPath, `${slug}.md`);

        const finalContent = matter.stringify(markdownContent, frontMatter);
        fs.writeFileSync(filePath, finalContent, 'utf8');

        syncState.documents[doc.token] = {
          token: doc.token,
          modifiedTime: doc.modified_time,
          slug,
          category,
        };

        syncCount++;
      }
    }
  }

  syncState.lastSync = new Date().toISOString();
  fs.writeFileSync(SYNC_STATE_FILE, JSON.stringify(syncState, null, 2));

  console.log(`同步完成！共同步 ${syncCount} 篇文档`);
}

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

main().catch(error => {
  console.error('同步失败:', error);
  process.exit(1);
});
```

**步骤 2：添加 npm 脚本**

在 `package.json` 中添加：
```json
{
  "scripts": {
    "sync": "tsx scripts/sync-feishu.ts",
    "sync:all": "rm sync-state.json && npm run sync"
  }
}
```

**步骤 3：安装 tsx**

```bash
npm install -D tsx
```

**步骤 4：提交同步脚本**

```bash
git add scripts/sync-feishu.ts package.json
git commit -m "feat: 实现飞书文档同步脚本

- 遍历飞书文件夹获取文档列表
- 检查文档更新状态
- 下载并处理文档内容
- 自动处理图片并替换链接
- 保存文章到对应分类目录
- 更新同步状态记录

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```

---

### 任务 3.4：创建 GitHub Actions 工作流

**文件：**
- 创建：`.github/workflows/sync-feishu.yml`

**步骤 1：创建工作流文件**

创建 `.github/workflows/sync-feishu.yml`：
```yaml
name: 同步飞书文档

on:
  workflow_dispatch:
    inputs:
      sync_all:
        description: '是否同步所有文档（否则只同步有更新的）'
        required: false
        default: 'false'
        type: choice
        options:
          - 'true'
          - 'false'

jobs:
  sync:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout 代码
        uses: actions/checkout@v4
        with:
          token: ${{ secrets.GITHUB_TOKEN }}

      - name: 设置 Node.js
        ctions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: 安装依赖
        run: npm ci

      - name: 全量同步（如果选择）
        if: ${{ github.event.inputs.sync_all == 'true' }}
        run: rm -f sync-state.json

      - name: 同步飞书文档
        run: npm run sync
        env:
          FEISHU_APP_ID: ${{ secrets.FEISHU_APP_ID }}
          FEISHU_APP_SECRET: ${{ secrets.FEISHU_APP_SECRET }}
          FEISHU_FOLDER_TOKEN: ${{ secrets.FEISHU_FOLDER_TOKEN }}
          GITHUB_REPOSITORY: ${{ github.repository }}

      - name: 提交更改
        run: |
          git config user.name "GitHub Actions"
          git config user.email "actions@github.com"
          git add .
          git diff --staged --quiet || git commit -m "sync: 同步飞书文档 [skip ci]"
          git push
```

**步骤 2：提交工作流**

```bash
git add .github/workflows/sync-feishu.yml
git commit -m "feat: 添加 GitHub Actions 同步工作流

- 支持手动触发同步
- 可选择全量同步或增量同步
- 自动提交同步后的更改
- 使用 [skip ci] 避免循环触发

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```

---

## 阶段 4：Next.js 前端开发

### 任务 4.1：创建首页

**文件：**
- 修改：`app/page.tsx`
- 创建：`src/components/ArticleCard.tsx`

**步骤 1：创建文章卡片组件**

创建 `src/components/ArticleCard.tsx`：
```typescript
import Link from 'next/link';
import Image from 'next/image';
import { format } from 'date-fns';
import { PostMetadata } from '@/types/post';

interface ArticleCardProps {
  post: PostMetadata;
}

export function ArticleCard({ post }: ArticleCardProps) {
  return (
    <Link
      href={`/posts/${post.slug}`}
      className="block group hover:shadow-lg transition-shadow duration-200 rounded-lg overflow-hidden border border-gray-200"
    >
      {post.cover && (
        <div className="relative w-full h-48 overflow-hidden">
          <Image
            src={post.cover}
            alt={post.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-200"
          />
        </div>
      )}
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-2 group-hover:text-blue-600 transition-colors">
          {post.title}
        </h2>
        <p className="text-gray-600 mb-4">{post.description}</p>
        <div className="flex items-center justify-between text-sm text-gray-500">
          <time dateTime={post.date}>{format(new Date(post.date), 'yyyy-MM-dd')}</time>
          <span className="px-2 py-1 bg-gray-100 rounded">{post.category}</span>
        </div>
        {post.tags.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {post.tags.map(tag => (
              <span key={tag} className="text-xs px-2 py-1 bg-blue-50 text-blue-600 rounded">
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </Link>
  );
}
```

**步骤 2：实现首页**

修改 `app/page.tsx`：
```typescript
import { getAllPosts } from '@/lib/posts';
import { ArticleCard } from '@/components/ArticleCard';

export default function HomePage() {
  const posts = getAllPosts();

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">最新文章</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {posts.map(post => (
          <ArticleCard key={post.slug} post={post} />
        ))}
      </div>
      {posts.length === 0 && (
        <p className="text-center text-gray-500 py-12">暂无文章</p>
      )}
    </div>
  );
}
```

**步骤 3：提交首页**

```bash
git add app/page.tsx src/components/ArticleCard.tsx
git commit -m "feat: 实现博客首页

- ArticleCard 组件: 文章卡片展示
- 首页: 展示最新文章列表
- 响应式网格布局
- 悬停效果和过渡动画

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```

---

### 任务 4.2：创建文章详情页

**文件：**
- 创建：`app/posts/[slug]/page.tsx`
- 创建：`src/components/ArticleContent.tsx`

**步骤 1：创建文章内容组件**

创建 `src/components/ArticleContent.tsx`：
```typescript
'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import rehypeRaw from 'rehype-raw';
import 'highlight.js/styles/github-dark.css';

interface ArticleContentProps {
  content: string;
}

export function ArticleContent({ content }: ArticleContentProps) {
  return (
    <div className="prose prose-lg max-w-none">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight, rehypeRaw]}
        components={{
          a: ({ node, ...props }) => (
            <a {...props} target="_blank" rel="noopener noreferrer" />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
```

**步骤 2：创建文章详情页**

创建 `app/posts/[slug]/page.tsx`：
```typescript
import { notFound } from 'next/navigation';
import { format } from 'date-fns';
import { getAllPosts, getPostBySlug } from '@/lib/posts';
import { ArticleContent } from '@/components/Artt';

interface PageProps {
  params: { slug: string };
}

export async function generateStaticParams() {
  const posts = getAllPosts();
  return posts.map(post => ({ slug: post.slug }));
}

export default function PostPage({ params }: PageProps) {
  const posts = getAllPosts();
  const postMeta = posts.find(p => p.slug === params.slug);

  if (!postMeta) {
    notFound();
  }

  const post = getPostBySlug(params.slug, postMeta.category);

  if (!post) {
    notFound();
  }

  return (
    <article className="container mx-auto px-4 py-8 max-w-4xl">
      <header className="mb-8">
        <h1 className="text-4xl font-bold mb-4">{post.title}</h1>
        <div className="flex items-center gap-4 text-gray-600 mb-4">
          <time dateTime={post.date}>{format(new Date(post.date), 'yyyy-MM-dd')}</time>
          <span>·</span>
          <span>{post.category}</span>
        </div>
        {post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {post.tags.map(tag => (
              <span key={tag} className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-sm">
                {tag}
              </span>
            ))}
          </div>
        )}
      </header>
      <ArticleContent content={post.content} />
    </article>
  );
}
```

**步骤 3：安装 highlight.js**

```bash
npm install highlight.js
```

**步骤 4：提交文章详情页**

```bash
git add app/posts/ src/components/ArticleContent.tsx package.json
git commit -m "feat: 实现文章详情页

- ArticleContent 组件: Markdown 渲染
- 支持 GitHub 风格 Markdown
- 代码高亮显示
- 响应式排版
- 自动生成静态页面

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```

---

### 任务 4.3：创建分类和标签页面

**文件：**
- 创建：`app/categories/page.tsx`
- 创建：`app/categories/[category]/page.tsx`
- 创建：`app/tags/page.tsx`
- 创建：`app/tags/[tag]/page.tsx`

**步骤 1：创建分类列表页**

创建 `app/categories/page.tsx`：
```typescript
import Link from 'next/link';
igetAllCategories, getPostsByCategory } from '@/lib/posts';

export default function CategoriesPage() {
  const categories = getAllCategories();

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">分类</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map(category => {
          const posts = getPostsByCategory(category);
          return (
            <Link
              key={category}
              href={`/categories/${category}`}
              className="block p-6 border border-graounded-lg hover:shadow-lg transition-shadow"
            >
              <h2 className="text-2xl font-bold mb-2">{category}</h2>
              <p className="text-gray-600">{posts.length} 篇文章</p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
```

**步骤 2：创建分类文章列表页**

创建 `app/categories/[category]/page.tsx`：
```typescript
import { notFound } from 'next/navigation';
import { getAllCategories, getPostsByCategory } from '@/lib/posts';
import { ArticleCard } from '@/components/ArticleCard';

interface PageProps {
  params: { category: string };
}

export async function generateStaticParams() {
  const categories = getAllCategories();
  return categories.map(category => ({ category }));
}

export default function CategoryPage({ params }: PageProps) {
  const posts = getPostsByCategory(params.category);

  if (posts.length === 0) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">分类: {params.category}</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {posts.map(post => (
          <ArticleCard key={post.slug} post={post} />
        ))}
      </div>
    </div>
  );
}
```

**步骤 3：创建标签云页面**

创建 `app/tags/page.tsx`：
```typescript
import Link from 'next/link';
import { getAllTags, getPostsByTag } from '@/lib/posts';

export default function TagsPage() {
  const tags = getAllTags();

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">标签</h1>
      <div className="flex flex-wrap gap-3">
        {tags.map(tag => {
          const posts = getPostsByTag(tag);
          return (
            <Link
              key={tag}
              href={`/tags/${tag}`}
              className="px-4 py-2 bg--blue-600 rounded-full hover:bg-blue-100 transition-colors"
            >
              {tag} ({posts.length})
            </Link>
          );
        })}
      </div>
    </div>
  );
}
```

**步骤 4：创建标签文章列表页**

创建 `app/tags/[tag]/page.tsx`：
```typescript
import { notFound } from 'next/navigation';
import { getAllTags, getPostsByTag } from '@/lib/posts';
import { ArticleCard } from '@/components/ArticleCard';

interface PageProps {
  params: { tag: string };
}

export async function generateStaticParams() {
  const tags = getAllTags();
  return tags.map(tag => ({ tag }));
}

export default function TagPage({ params }: PageProps) {
  const posts = getPostsByTag(params.tag);

  if (posts.length === 0) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">标签: {params.tag}</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {posts.map(post => (
          <ArticleCard key={post.slug} post={post} />
        ))}
      </div>
    </div>
  );
}
```

**步骤 5：提交分类和标签页面**

```bash
git add app/categories/ app/tags/
git commit -m "feat: 实现分类和标签页面

- 分类列表页: 展示所有分类
- 分类文章页: 按分类筛选文章
- 标签云页面: 展示所有标签
- 标签文章页: 按标签筛选文章
- 静态生成所有页面

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```

---

## 阶段 5：布局和导航

### 任务 5.1：创建全局布局

**文件：**
- 修改：`app/layout.tsx`
- 创建：`src/components/Header.tsx`
- 创建：`src/components/Footer.tsx`

**步骤 1：创建 Header 组件**

创建 `src/components/Header.tsx`：
```typescript
import Link from 'next/link';

export function Header() {
  return (
    <header className="border-b border-gray-200 bg-white">
      <nav className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="text-2xl font-bold">
          我的博客
        </Link>
        <div className="flex gap-6">
          <Link href="/" className="hover:text-blue-600 transition-colors">
            首页
          </Link>
          <Link href="/categories" className="hover:text-blue-600 transition-colors">
            分类
          </Link>
          <Link href="/tags" className="hover:text-blue-600 transition-colors">
            标签
          </Link>
        </div>
      </nav>
    </header>
  );
}
```

**步骤 2：创建 Footer 组件**

创建 `src/components/Footer.tsx`：
```typescript
export function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-gray-50 mt-12">
      <div className="container mx-auto px-4 py-6 text-center text-gray-600">
        <p>© {new Date().getFullYear()} 我的博客. All rights reserved.</p>
      </div>
    </footer>
  );
}
```

**步骤 3：更新全局布局**

修改 `app/layout.tsx`：
```typescript
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: '我的博客',
  description: '个人技术博客',
};

export default function RootLayout({
  children,
}: {
  children: React.Node;
}) {
  return (
    <html lang="zh-CN">
      <body className={inter.className}>
        <div className="flex flex-col min-h-screen">
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
```

**步骤 4：提交布局组件**

```bash
git add app/layout.tsx src/components/Header.tsx src/components/Footer.tsx
git commit -m "feat: 实现全局布局和导航

- Header: 顶部导航栏
- Footer: 页脚信息
- 响应式布局
- 统一的页面结构

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```

---

## 阶段 6：部署配置

### 任务 6.1：配置 Next.js

**文件：**
- 修改：`next.config.js`

**步骤 1：配置 Next.js**

修改 `next.config.js`：
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export', // 静态导出
  images: {
    unoptimized: true, // 静态导出需要
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.jsdelivr.net',
      },
    ],
  },
};

module.exports = nextConfig;
```

**步骤 2：提交配置**

```bash
git add next.config.js
git commit -m "chore: 配置 Next.js 静态导出

- 启用静态导出模式
- 配置图片域名白名单
- 禁用图片优化（静态部署需要）

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```

---

### 任务 6.2：创建环境变量模板

**文件：**
- 创建：`.env.example`
- 创建：`README.md`

**步骤 1：创建环境变量模板**

创建 `.env.example`：
```
# 飞书开放平台配置
FEISHU_APP_ID=your_app_id
FEISHU_APP_SECRET=your_app_secret
FEISHU_FOLDER_TOKEN=your_folder_token

# GitHub 仓库信息（Actions 自动提供）
GITHUB_REPOSITORY=username/repo
```

**步骤 2：创建 README**

创建 `README.md`：
```markdown
# 个人博客系统

基于 Next.js + 飞书文档的个人博客系统。

## 功能特性

- 使用飞书文档作为写作平台
- 手动触发同步，自动转存图片
- 静态生成，部署到 Vercel
- 支持分类、标签、搜索
- Markdown 渲染，代码高亮
- 响应式设计

## 快速开始

### 1. 安装依赖

\`\`\`bash
npm install
\`\`\`

### 2. 配置环境变量

复制 `.env.example` 为 `.env.local`，填入飞书应用信息。

### 3. 本地开发

\`\`\`bash
npm run dev
\`\`\`

### 4. 同步飞书文档

\`\`\`bash
npm run sync
\`\`\`

### 5. 构建部署

\`\`\`bash
npm run build
\`\`\`

## 部署到 Vercel

1. 连接 GitHub 仓库到 Vercel
2. 配置环境变量（如需要）
3. 自动部署

## 发布文章流程

1. 在飞书文档中写作
2. 在文章开头添加 Front Matter
3. 在 GitHub Actions 中手动触发同步
4. Vercel 自动部署

## 技术栈

- Next.js 14
- TypeScript
- TailwindCSS
- react-markdown
- 飞书开放平台 API

## License

MIT
\`\`\`

**步骤 3：提交文档**

\`\`\`bash
git add .env.example README.md
git commit -m "docs: 添加项目文档

- 环境变量模板
- README 使用说明
- 快速开始指南
- 部署说明

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
\`\`\`

---

## 总结

实施计划已完成！主要包含以下阶段：

1. **项目初始化**：Next.js 项目搭建、目录结构、依赖安装
2. **类型和工具**：TypeScript 类型定义、文章读取工具
3. **飞书同步**：API 客户端、图片处理、同步脚本、GitHub Actions
4. **前端开发**：首页、文章详情、分类标签页面
5. **布局导航**：Header、Footer、全局布局
6. **部署配置**：Next.js 配置、环境变量、文档

每个任务都遵循 TDD 原则，包含详细的实现步骤和提交信息。

---

## 执行选项

计划已保存到 `docs/plans/2026-03-03-blog-implementation.md`。

**两种执行方式：**

**1. 子代理驱动（当前会话）**
- 我为每个任务派发新的子代理
- 任务间进行代码审查
- 快速迭代

**2. 并行会话（独立会话）**
- 在新会话中使用 executing-plans 技能
- 批量执行，设置检查点

你希望使用哪种方式？
