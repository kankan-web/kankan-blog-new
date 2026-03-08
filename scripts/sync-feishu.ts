import * as fs from 'fs';
import * as path from 'path';
import matter from 'gray-matter';
import { FeishuClient } from './feishu-client.js';
import { ImageProcessor } from './image-processor.js';
import { SyncState } from '../types/feishu.js';
import 'dotenv/config';

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
            // 提取前 100 个字符作为描��
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
