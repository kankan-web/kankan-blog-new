import * as fs from 'fs';
import * as path from 'path';
import type { Post, PostMetadata } from '../types/post';

const matter = require('gray-matter');

const POSTS_DIR = path.join(process.cwd(), 'content/posts');

/**
 * 获取所有文章（按日期倒序）
 */
export function getAllPosts(): PostMetadata[] {
  try {
    // 检查目录是否存在
    if (!fs.existsSync(POSTS_DIR)) {
      return [];
    }

    const posts: PostMetadata[] = [];
    const categories = fs.readdirSync(POSTS_DIR);

    for (const category of categories) {
      const categoryPath = path.join(POSTS_DIR, category);

      // 跳过非目录文件
      if (!fs.statSync(categoryPath).isDirectory()) {
        continue;
      }

      const files = fs.readdirSync(categoryPath);

      for (const file of files) {
        if (!file.endsWith('.md')) {
          continue;
        }

        const slug = file.replace(/\.md$/, '');
        const filePath = path.join(categoryPath, file);
        const fileContent = fs.readFileSync(filePath, 'utf-8');
        const { data, content } = matter(fileContent);

        // 生成摘要（前 200 字符）
        const excerpt = content.slice(0, 200).trim() + (content.length > 200 ? '...' : '');

        posts.push({
          slug,
          title: data.title,
          date: data.date,
          category: data.category,
          tags: data.tags || [],
          description: data.description,
          cover: data.cover,
          excerpt,
        });
      }
    }

    // 按日期倒序排序
    return posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  } catch (error) {
    console.error('Error reading posts:', error);
    return [];
  }
}

/**
 * 根据 slug 和分类获取单篇文章
 */
export function getPostBySlug(slug: string, category: string): Post | null {
  try {
    const filePath = path.join(POSTS_DIR, category, `${slug}.md`);

    if (!fs.existsSync(filePath)) {
      return null;
    }

    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const { data, content } = matter(fileContent);

    // 生成摘要
    const excerpt = content.slice(0, 200).trim() + (content.length > 200 ? '...' : '');

    return {
      slug,
      title: data.title,
      date: data.date,
      category: data.category,
      tags: data.tags || [],
      description: data.description,
      cover: data.cover,
      content,
      excerpt,
    };
  } catch (error) {
    console.error(`Error reading post ${slug}:`, error);
    return null;
  }
}

/**
 * 获取指定分类的所有文章
 */
export function getPostsByCategory(category: string): PostMetadata[] {
  const allPosts = getAllPosts();
  return allPosts.filter(post => post.category === category);
}

/**
 * 获取包含指定标签的所有文章
 */
export function getPostsByTag(tag: string): PostMetadata[] {
  const allPosts = getAllPosts();
  return allPosts.filter(post => post.tags.includes(tag));
}

/**
 * 获取所有分类
 */
export function getAllCategories(): string[] {
  try {
    if (!fs.existsSync(POSTS_DIR)) {
      return [];
    }

    const items = fs.readdirSync(POSTS_DIR);
    const categories = items.filter(item => {
      const itemPath = path.join(POSTS_DIR, item);
      return fs.statSync(itemPath).isDirectory();
    });

    return categories.sort();
  } catch (error) {
    console.error('Error reading categories:', error);
    return [];
  }
}

/**
 * 获取所有标签
 */
export function getAllTags(): string[] {
  const allPosts = getAllPosts();
  const tagsSet = new Set<string>();

  allPosts.forEach(post => {
    post.tags.forEach(tag => tagsSet.add(tag));
  });

  return Array.from(tagsSet).sort();
}
