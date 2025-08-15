'use client'

import { useState } from 'react'
import { Post } from '@/lib/posts'
import Search from './Search'
import BlogCard from './BlogCard'

export default function PostSearch({ posts }: { posts: Post[] }) {
  const [query, setQuery] = useState('')

  const filteredPosts = posts.filter(post =>
    post.title.toLowerCase().includes(query.toLowerCase())
  )

  return (
    <div>
      <Search value={query} onChange={setQuery} />
      <div className="grid grid-cols-1 gap-16 mt-8">
        {filteredPosts.map(post => {
          const uniqueKey = post.id || `${post.title}-${post.date}`;
          return (
            <BlogCard
              key={uniqueKey}
              title={post.title}
              excerpt={post.excerpt}
              date={post.date}
              category={post.category}
              imageUrl={`https://picsum.photos/seed/${post.id}/800/400`}
              slug={post.id}
            />
          );
        })}
      </div>
    </div>
  )
}
