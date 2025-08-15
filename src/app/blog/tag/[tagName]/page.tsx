import { getAllPosts } from '@/lib/posts';
import Link from 'next/link';

export async function generateStaticParams() {
    const posts = getAllPosts();
    const allTags = posts.flatMap(p => p.tags || []);
    const uniqueTags = [...new Set(allTags)];
    return uniqueTags.map(tag => ({
      tagName: encodeURIComponent(tag),
    }));
  }

export default function TagPage({ params }: { params: { tagName: string } }) {
    const decodedTagName = decodeURIComponent(params.tagName);
    const posts = getAllPosts().filter(post => post.tags && post.tags.includes(decodedTagName));

    return (
        <div className="container mx-auto px-4 py-8 max-w-3xl">
            <Link href="/blog" className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 mb-4 inline-block">
                &larr; 返回博客
            </Link>
            <h1 className="text-3xl font-bold mb-8 border-b pb-4">
                标签: {decodedTagName}
            </h1>
            {posts.length > 0 ? (
                <div className="space-y-8">
                    {posts.map(post => (
                        <article key={post.slug}>
                            <h2 className="text-2xl font-bold mb-2">
                                <Link href={`/blog/${post.slug}`} className="hover:underline">
                                    {post.title}
                                </Link>
                            </h2>
                            <p className="text-gray-600 dark:text-gray-400 mb-2">
                                {new Date(post.date).toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' })}
                            </p>
                            <p className="text-gray-700 dark:text-gray-300">{post.summary}</p>
                        </article>
                    ))}
                </div>
            ) : (
                <p>该标签下暂无文章。</p>
            )}
        </div>
    );
}