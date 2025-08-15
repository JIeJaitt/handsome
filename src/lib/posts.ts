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
    const fullPath = path.join(postsDirectory, `${slug}.md`)
    const fileContents = fs.readFileSync(fullPath, 'utf8')
    const matterResult = matter(fileContents)

    const processedContent = await remark()
        .use(gfm)
        .use(remarkRehype)
        .use(rehypeHighlight)
        .use(rehypeStringify)
        .process(matterResult.content)

    const content = processedContent.toString()

    return {
        slug,
        content,
        ...(matterResult.data as { 
            title: string; 
            date: string; 
            category: string; 
            summary: string; 
            tags: string[];
        }),
    }
}
