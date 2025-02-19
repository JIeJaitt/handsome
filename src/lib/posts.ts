import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { remark } from 'remark'
import html from 'remark-html'

const postsDirectory = path.join(process.cwd(), 'src/content/posts')

export interface PostData {
    id: string
    title: string
    date: string
    category: string
    excerpt: string
    content: string
}

export function getAllPostIds() {
    const fileNames = fs.readdirSync(postsDirectory)
    return fileNames.map((fileName) => {
        return {
            params: {
                slug: fileName.replace(/\.md$/, ''),
            },
        }
    })
}

export async function getPostData(slug: string): Promise<PostData> {
    const fullPath = path.join(postsDirectory, `${slug}.md`)
    const fileContents = fs.readFileSync(fullPath, 'utf8')

    // 使用 gray-matter 解析 markdown 文件的元数据
    const matterResult = matter(fileContents)

    // 使用 remark 将 markdown 转换为 HTML
    const processedContent = await remark()
        .use(html)
        .process(matterResult.content)
    const content = processedContent.toString()

    return {
        id: slug,
        content,
        ...(matterResult.data as { title: string; date: string; category: string; excerpt: string })
    }
}

export function getAllPosts() {
    const fileNames = fs.readdirSync(postsDirectory)
    const allPostsData = fileNames.map((fileName) => {
        const id = fileName.replace(/\.md$/, '')
        const fullPath = path.join(postsDirectory, fileName)
        const fileContents = fs.readFileSync(fullPath, 'utf8')
        const matterResult = matter(fileContents)

        return {
            id,
            ...(matterResult.data as { title: string; date: string; category: string; excerpt: string })
        }
    })

    return allPostsData.sort((a, b) => (a.date < b.date ? 1 : -1))
} 