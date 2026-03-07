/**
 * 文章 Front Matter 接口
 */
export interface PostFrontMatter {
  title: string;
  date: string;
  category: string;
  tags: string[];
  description: string;
  cover?: string;
}

/**
 * 完整文章接口（包含内容）
 */
export interface Post extends PostFrontMatter {
  slug: string;// 文章唯一标识
  content: string;// 内容
  excerpt: string;// 摘要
}

/**
 * 文章元数据接口（用于列表展示，不包含完整内容）
 */
export interface PostMetadata extends PostFrontMatter {
  slug: string;// 文章唯一标识
  excerpt: string;// 摘要
}
