import { getAllPosts, getPostBySlug, getAllCategories, getAllTags } from './lib/posts';

console.log('=== 测试文章读取工具函数 ===\n');

console.log('所有文章:');
console.log(JSON.stringify(getAllPosts(), null, 2));

console.log('\n分类:');
console.log(getAllCategories());

console.log('\n标签:');
console.log(getAllTags());

console.log('\n单篇文章:');
console.log(JSON.stringify(getPostBySlug('test-post', '技术'), null, 2));
