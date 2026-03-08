import * as fs from 'fs';
import * as path from 'path';
import matter from 'gray-matter';
import { FeishuClient } from './feishu-client.js';
import { ImageProcessor } from './image-processor.js';
import { SyncState, WikiNode } from '../types/feishu.js';
import 'dotenv/config';

// 读取环境变量
const FEISHU_APP_ID = process.env.FEISHU_APP_ID!;
const FEISHU_APP_SECRET = process.env.FEISHU_APP_SECRET!;
const FEISHU_SPACE_ID = process.env.FEISHU_SPACE_ID!;
const GITHUB_REPO = process.env.GITHUB_REPO || 'username/repo';

// 同步状态文件路径
const SYNC_STATE_PATH = path.join(process.cwd(), 'sync-state.json');

// 同步计数器
let syncCount = 0;

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
 * 递归处理知识库节点
 */
async function processNodes(
  nodes: WikiNode[],
  feishuClient: FeishuClient,
  imageProcessor: ImageProcessor,
  syncState: SyncState,
  category: string
): Promise<void> {
  for (const node of nodes) {
    const { node_token, obj_token, obj_type, title, has_child, obj_edit_time, space_id } = node;

    // 如果是文档节点，进行同步
    if (obj_type === 'docx' || obj_type === 'doc') {
      const documentId = obj_token;
      const modifiedTime = obj_edit_time;

      // 确定分类（使用父节点标题或默认分类）
      const docCategory = category || '未分类';

      // 检查是否需要同步
      const cachedDoc = syncState.documents[documentId];
      if (cachedDoc && cachedDoc.modifiedTime >= modifiedTime) {
        console.log(`  ⏭️  跳过: ${title} (无更新)`);
        continue;
      }

      console.log(`  📄 同步: ${title} [${docCategory}]`);

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
        if (!frontMatter.category) frontMatter.category = docCategory;
        if (!frontMatter.tags) frontMatter.tags = [];
        if (!frontMatter.description) {
          // 提取前 100 个字符作为描述
          frontMatter.description = markdownContent.slice(0, 100).replace(/\n/g, ' ').trim();
        }

        // 生成 slug
        const slug = generateSlug(frontMatter.title);

        // 保存文章
        const categoryDir = path.join(process.cwd(), 'content', 'posts', docCategory);
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

    // 如果有子节点，递归处理（使用当前节点标题作为分类）
    if (has_child) {
      console.log(`\n📁 处理分类: ${title}`);
      const childNodes = await feishuClient.listWikiNodes(space_id, node_token);
      await processNodes(childNodes, feishuClient, imageProcessor, syncState, title);
    }
  }
}

/**
 * 主同步函数
 */
async function syncFeishu() {
  console.log('🚀 开始同步飞书知识库...\n');

  // 检查环境变量
  if (!FEISHU_APP_ID || !FEISHU_APP_SECRET || !FEISHU_SPACE_ID) {
    throw new Error('缺少必要的环境变量: FEISHU_APP_ID, FEISHU_APP_SECRET, FEISHU_SPACE_ID');
  }

  // 初始化客户端
  const feishuClient = new FeishuClient(FEISHU_APP_ID, FEISHU_APP_SECRET);
  const imageProcessor = new ImageProcessor(feishuClient, GITHUB_REPO);

  // 读取同步状态
  const syncState = loadSyncState();

  try {
    // 获取知识库根节点列表
    console.log('📂 获取知识库节点列表...');
    const rootNodes = await feishuClient.listWikiNodes(FEISHU_SPACE_ID);
    console.log(`找到 ${rootNodes.length} 个根节点\n`);

    // 递归处理所有节点
    await processNodes(rootNodes, feishuClient, imageProcessor, syncState, '');

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
