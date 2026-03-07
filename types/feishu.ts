/**
 * 飞书文档接口
 */
export interface FeishuDocument {
  document_id: string;// 文档唯一标识
  title: string;// 标题
  modified_time: number;// 修改时间
  url: string;// 链接
}

/**
 * 飞书文件夹接口
 */
export interface FeishuFolder {
  folder_token: string;// 文件夹唯一标识
  name: string;// 名称
}

/**
 * 同步状态接口
 */
export interface SyncState {
  lastSyncTime: string;// 最后一次同步时间
  documents: Record<string, {
    title: string;// 标题
    modifiedTime: number;// 修改时间
    localPath: string;// 本地路径
  }>;
}
