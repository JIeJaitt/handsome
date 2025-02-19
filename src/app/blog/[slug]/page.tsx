import { getAllPostIds, getPostData } from '@/lib/posts'
import { Metadata } from 'next'

// 定义正确的参数类型
type BlogPostParams = {
    params: Promise<{
        slug: string
    }>
    searchParams?: { [key: string]: string | string[] | undefined }
}

export async function generateMetadata({
    params,
}: BlogPostParams): Promise<Metadata> {
    const resolvedParams = await params
    const post = await getPostData(resolvedParams.slug)
    return {
        title: post.title,
        description: post.excerpt,
    }
}

export async function generateStaticParams() {
    const paths = getAllPostIds()
    return paths
}

// 使用 BlogPostParams 类型
export default async function BlogPost({
    params,
    searchParams,
}: BlogPostParams) {
    const resolvedParams = await params
    const post = await getPostData(resolvedParams.slug)

    return (
        <article className="max-w-4xl mx-auto px-4 py-12">
            <header className="text-center mb-16">
                <h1 className="text-4xl font-bold mb-4">{post.title}</h1>
                <div className="flex items-center justify-center gap-6 text-sm text-gray-500">
                    <time className="flex items-center gap-2">
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        {post.date}
                    </time>
                    <span className="flex items-center gap-2">
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                        </svg>
                        <span className="bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full">
                            {post.category}
                        </span>
                    </span>
                </div>
            </header>

            <div className="prose prose-lg dark:prose-invert mx-auto">
                <div dangerouslySetInnerHTML={{ __html: post.content }} />
            </div>
        </article>
    )
} 