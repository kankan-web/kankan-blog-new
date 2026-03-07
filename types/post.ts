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
  slug: string;
  content: string;
  excerpt: string;
}

/**
 * 文章元数据接口（用于列表展示，不包含完整内容）
 */
export interface PostMetadata extends PostFrontMatter {
  slug: string;
  excerpt: string;
}
