import Link from 'next/link'
import { getAllPosts } from '@/lib/posts'

interface SidebarProps {
    title: string
    children: React.ReactNode
}

function SidebarSection({ title, children }: SidebarProps) {
    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h3 className="text-lg font-bold mb-4">{title}</h3>
            {children}
        </div>
    )
}

export default function Sidebar() {
    const posts = getAllPosts()
    const categories = [...new Set(posts.map(post => post.category))]
    const tags = [...new Set(posts.flatMap(post => post.tags || []))];

    return (
        <aside className="space-y-6">
            <SidebarSection title="最新文章">
                <ul className="space-y-3">
                    {posts.slice(0, 5).map((post) => (
                        <li key={post.slug}>
                            <Link href={`/blog/${post.slug}`}>
                                <div className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors duration-200">
                                    {post.title}
                                </div>
                            </Link>
                        </li>
                    ))}
                </ul>
            </SidebarSection>

            <SidebarSection title="分类">
                <div className="flex flex-wrap gap-2">
                    {categories.map((category) => (
                        <Link key={category} href={`/blog/category/${category}`}>
                            <span className="block bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full text-sm hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200">
                                {category}
                            </span>
                        </Link>
                    ))}
                </div>
            </SidebarSection>

            <SidebarSection title="标签">
                <div className="flex flex-wrap gap-2">
                    {tags.map((tag) => (
                        <Link key={tag} href={`/blog/tag/${tag}`}>
                            <span className="block bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full text-sm hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200">
                                {tag}
                            </span>
                        </Link>
                    ))}
                </div>
            </SidebarSection>
        </aside>
    )
} 