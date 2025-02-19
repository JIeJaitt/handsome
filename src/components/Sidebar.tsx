import { getAllPosts } from '@/lib/posts'

interface SidebarProps {
    title: string
    children: React.ReactNode
}

function SidebarSection({ title, children }: SidebarProps) {
    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
            <h3 className="text-lg font-bold mb-4">{title}</h3>
            {children}
        </div>
    )
}

export default function Sidebar() {
    const posts = getAllPosts()
    const categories = [...new Set(posts.map(post => post.category))]
    const tags = ['React', 'Next.js', 'TypeScript', 'TailwindCSS'] // 后续可以从文章中提取

    return (
        <aside>
            <SidebarSection title="最新文章">
                <ul className="space-y-3">
                    {posts.slice(0, 3).map((post) => (
                        <li
                            key={post.id}
                            className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                        >
                            {post.title}
                        </li>
                    ))}
                </ul>
            </SidebarSection>

            <SidebarSection title="分类">
                <div className="flex flex-wrap gap-2">
                    {categories.map((category, index) => (
                        <span
                            key={index}
                            className="bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full text-sm"
                        >
                            {category}
                        </span>
                    ))}
                </div>
            </SidebarSection>

            <SidebarSection title="标签">
                <div className="flex flex-wrap gap-2">
                    {tags.map((tag, index) => (
                        <span
                            key={index}
                            className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-sm"
                        >
                            {tag}
                        </span>
                    ))}
                </div>
            </SidebarSection>
        </aside>
    )
} 