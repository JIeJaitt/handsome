import { getAllPostIds, getPostData } from '@/lib/posts'
import { Metadata } from 'next'
import Link from 'next/link';

type BlogPostParams = {
    params: {
        slug: string
    }
}

export async function generateMetadata(
    { params }: BlogPostParams
): Promise<Metadata> {
    const post = await getPostData(params.slug)
    return {
        title: post.title,
        description: post.summary,
    }
}

export async function generateStaticParams() {
    const paths = getAllPostIds()
    return paths
}

export default async function BlogPost({ params }: BlogPostParams) {
    const post = await getPostData(params.slug)

    return (
        <article className="max-w-4xl mx-auto px-4 py-12">
            <header className="text-center mb-12">
                <h1 className="text-4xl md:text-5xl font-bold mb-4">{post.title}</h1>
                <div className="text-sm text-gray-500 dark:text-gray-400 space-y-2 md:space-y-0 md:flex md:items-center md:justify-center md:gap-6">
                    <time className="flex items-center justify-center gap-2">
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        {new Date(post.date).toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </time>
                    <Link 
                        href={`/blog/category/${encodeURIComponent(post.category)}`} 
                        className="flex items-center justify-center gap-2 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
                    >
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 19a2 2 0 01-2-2V7a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1M5 19h14a2 2 0 002-2v-5a2 2 0 00-2-2H5a2 2 0 00-2 2v5a2 2 0 002 2z" />
                        </svg>
                        {post.category}
                    </Link>
                </div>
            </header>

            <div 
                className="prose prose-lg dark:prose-invert mx-auto break-words"
                dangerouslySetInnerHTML={{ __html: post.content }} 
            />

            {post.tags && post.tags.length > 0 && (
                <footer className="mt-12 pt-8 border-t dark:border-gray-700">
                    <div className="flex flex-wrap gap-2">
                        {post.tags.map(tag => (
                            <Link 
                                key={tag} 
                                href={`/blog/tag/${encodeURIComponent(tag)}`}
                                className="bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full text-sm hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                            >
                                # {tag}
                            </Link>
                        ))}
                    </div>
                </footer>
            )}
        </article>
    )
}
