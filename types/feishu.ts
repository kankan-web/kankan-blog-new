/**
 * 飞书知识库节点类型
 */
export type WikiNodeType = 'origin' | 'doc' | 'sheet' | 'mindnote' | 'bitable' | 'file' | 'docx';

/**
 * 飞书知识库节点接口
 */
export interface WikiNode {
  space_id: string; // 知识库 ID
  node_token: string; // 节点 token
  obj_token: string; // 对应文档的 token
  obj_type: WikiNodeType; // 节点类型
  parent_node_token: string; // 父节点 token
  node_type: string; // 节点类型（doc/docx）
  origin_node_token: string; // 原始节点 token
  origin_space_id: string; // 原始知识库 ID
  has_child: boolean; // 是否有子节点
  title: string; // 节点标题
  obj_create_time: string; // 文档创建时间
  obj_edit_time: string; // 文档编辑时间
  node_create_time: string; // 节点创建时间
}

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
    modifiedTime: string;// 修改时间（ISO 字符串）
    localPath: string;// 本地路径
  }>;
}
