/**
 * 飞书文档接口
 */
export interface FeishuDocument {
  document_id: string;
  title: string;
  modified_time: number;
  url: string;
}

/**
 * 飞书文件夹接口
 */
export interface FeishuFolder {
  folder_token: string;
  name: string;
}

/**
 * 同步状态接口
 */
export interface SyncState {
  lastSyncTime: string;
  documents: Record<string, {
    title: string;
    modifiedTime: number;
    localPath: string;
  }>;
}
