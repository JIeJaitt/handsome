import { getAllPostIds, getPostData } from '@/lib/posts'
import { Metadata } from 'next'

export async function generateMetadata({
    params
}: {
    params: { slug: string }
}): Promise<Metadata> {
    const post = await getPostData(params.slug)
    return {
        title: post.title,
        description: post.excerpt,
    }
}

export async function generateStaticParams() {
    const paths = getAllPostIds()
    return paths
}

export default async function BlogPost({
    params
}: {
    params: { slug: string }
}) {
    const { slug } = params
    const post = await getPostData(slug)

    return (
        <article className="max-w-4xl mx-auto px-4 py-8">
            <header className="mb-8">
                <h1 className="text-3xl font-bold mb-4">{post.title}</h1>
                <div className="flex items-center gap-4 text-sm text-gray-500">
                    <time>{post.date}</time>
                    <span className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                        {post.category}
                    </span>
                </div>
            </header>

            <div
                className="prose dark:prose-invert max-w-none"
                dangerouslySetInnerHTML={{ __html: post.content }}
            />
        </article>
    )
} 