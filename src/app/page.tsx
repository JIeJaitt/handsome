import Profile from '@/components/Profile'
import PostSearch from '@/components/PostSearch'
import Sidebar from '@/components/Sidebar'
import Calendar from '@/components/Calendar'
import { getAllPosts } from '@/lib/posts'

export default function Home() {
  const posts = getAllPosts()
  const categories = [...new Set(posts.map(post => post.category))]
  const tags = [...new Set(posts.flatMap(post => post.tags || []))]

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* 左侧个人资料和日历 */}
        <div className="lg:col-span-3">
          <div className="sticky top-8 space-y-8">
            <Profile
              postsCount={posts.length}
              categoriesCount={categories.length}
              tagsCount={tags.length}
            />
            <Calendar />
          </div>
        </div>

        {/* 中间博客列表 */}
        <main className="lg:col-span-6">
          <PostSearch posts={posts} />
        </main>

        {/* 右侧边栏 */}
        <div className="lg:col-span-3">
          <div className="sticky top-8">
            <Sidebar />
          </div>
        </div>
      </div>
    </div>
  )
}
