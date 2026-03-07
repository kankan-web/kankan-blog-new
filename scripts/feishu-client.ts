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
    });
  }

  /**
   * 获取文件夹下的文件列表（支持分页）
   */
  async listFiles(folderToken: string): Promise<any[]> {
    return this.retryRequest(async () => {
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
    });
  }

  /**
   * 获取文档 Markdown 内容
   */
  async getDocumentContent(documentId: string): Promise<string> {
    return this.retryRequest(async () => {
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
    });
  }

  /**
   * 下载图片二进制数据
   */
  async downloadImage(fileToken: string): Promise<Buffer> {
    return this.retryRequest(async () => {
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
    });
  }
}
