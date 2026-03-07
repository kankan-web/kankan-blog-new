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
}
