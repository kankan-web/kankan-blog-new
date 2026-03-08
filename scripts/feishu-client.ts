import axios, { AxiosInstance } from 'axios';
import { WikiNode } from '../types/feishu.js';

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
      baseURL: 'https://open.feishu.cn',
      timeout: 30000,
    });
  }

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

  /**
   * 获取 access token（带缓存和自动刷新）
   */
  async getAccessToken(): Promise<string> {
    // 检查缓存是否有效（提前 1 分钟刷新）
    if (this.tokenCache && this.tokenCache.expiresAt > Date.now() + 60000) {
      return this.tokenCache.token;
    }

    // 获取新 token
    return this.retryRequest(async () => {
      console.log('获取新 token');
      const response = await this.axiosInstance.post('/open-apis/auth/v3/tenant_access_token/internal', {
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
    });
  }

  /**
   * 获取知识库节点列表（支持分页）
   */
  async listWikiNodes(spaceId: string, parentNodeToken?: string): Promise<WikiNode[]> {
    return this.retryRequest(async () => {
      const token = await this.getAccessToken();
      const allNodes: WikiNode[] = [];
      let pageToken: string | undefined;

      do {
        const response = await this.axiosInstance.get(`/open-apis/wiki/v2/spaces/${spaceId}/nodes`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          params: {
            page_size: 50,
            page_token: pageToken,
            parent_node_token: parentNodeToken,
          },
        });

        if (response.data.code !== 0) {
          throw new Error(`Failed to list wiki nodes: ${response.data.msg}`);
        }

        allNodes.push(...(response.data.data.items || []));
        pageToken = response.data.data.page_token;
      } while (pageToken);

      return allNodes;
    });
  }

  /**
   * 获取文档 Markdown 内容
   */
  async getDocumentContent(documentId: string): Promise<string> {
    return this.retryRequest(async () => {
      const token = await this.getAccessToken();

      const response = await this.axiosInstance.get(`/open-apis/docx/v1/documents/${documentId}/raw_content`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data.code !== 0) {
        throw new Error(`Failed to get document content: ${response.data.msg}`);
      }

      return response.data.data.content;
    });
  }

  /**
   * 下载图片二进制数据
   */
  async downloadImage(fileToken: string): Promise<Buffer> {
    return this.retryRequest(async () => {
      const token = await this.getAccessToken();

      const response = await this.axiosInstance.get(`/open-apis/drive/v1/medias/${fileToken}/download`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        responseType: 'arraybuffer',
      });

      if (response.status !== 200) {
        throw new Error(`Failed to download image: ${response.statusText}`);
      }

      return Buffer.from(response.data);
    });
  }
}
