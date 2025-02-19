import Image from 'next/image'
import Link from 'next/link'

interface BlogCardProps {
    title: string
    excerpt: string
    date: string
    category: string
    imageUrl: string
    slug: string
}

export default function BlogCard({
    title,
    excerpt,
    date,
    category,
    imageUrl,
    slug,
}: BlogCardProps) {
    return (
        <Link href={`/blog/${slug}`} className="block">
            <article className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
                <div className="relative w-full" style={{ height: '240px' }}>
                    <Image
                        src={imageUrl}
                        alt={title}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                </div>
                <div className="p-6">
                    <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mb-4">
                        <time>{date}</time>
                        <span className="bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full">
                            {category}
                        </span>
                    </div>
                    <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white line-clamp-2">
                        {title}
                    </h2>
                    <p className="text-gray-600 dark:text-gray-300 line-clamp-3">
                        {excerpt}
                    </p>
                </div>
            </article>
        </Link>
    )
} 