import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { remark } from 'remark'
import gfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'
import remarkRehype from 'remark-rehype'
import rehypeStringify from 'rehype-stringify'

const postsDirectory = path.join(process.cwd(), 'src/content/posts')

export interface Post {
    slug: string
    title: string
    date: string
    category: string
    summary: string
    tags: string[]
}

export interface PostData extends Post {
    content: string
}

export function getAllPosts(): Post[] {
    const fileNames = fs.readdirSync(postsDirectory)
    const allPostsData = fileNames
        .filter((fileName) => fileName.endsWith('.md'))
        .map((fileName) => {
            const slug = fileName.replace(/\.md$/, '')
            const fullPath = path.join(postsDirectory, fileName)
            const fileContents = fs.readFileSync(fullPath, 'utf8')
            const matterResult = matter(fileContents)

            return {
                slug,
                ...(matterResult.data as { 
                    title: string; 
                    date: string; 
                    category: string; 
                    summary: string; 
                    tags: string[];
                }),
            }
        })

    return allPostsData.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function getAllPostIds() {
    return getAllPosts().map((post) => {
        return {
            params: {
                slug: post.slug,
            },
        }
    })
}

export async function getPostData(slug: string): Promise<PostData> {
    // 1. 校验slug有效性
    if (!slug || typeof slug !== 'string' || slug.includes('..')) {
        throw new Error(`Invalid slug: ${slug}`);
    }

    // 2. 构造合法路径
    const fullPath = path.join(postsDirectory, `${slug}.md`);

    // 3. 检查文件是否存在
    if (!fs.existsSync(fullPath)) {
        throw new Error(`Post not found: ${slug}.md`);
    }

    try {
        // 4. 读取并解析Markdown
        const fileContents = fs.readFileSync(fullPath, 'utf8');
        const matterResult = matter(fileContents);

        // 5. 处理Markdown内容（支持GFM + 语法高亮）
        const processedContent = await remark()
            .use(gfm)
            .use(remarkRehype)
            .use(rehypeHighlight)
            .use(rehypeStringify)
            .process(matterResult.content);

        return {
            slug,
            content: processedContent.toString(),
            ...(matterResult.data as Post),
        };
    } catch (error) {
        console.error(`Error parsing post ${slug}:`, error);
        throw error;
    }
}
