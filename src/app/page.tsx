import NoteList from '@/components/note-list'
import { prisma } from '@/lib/db'

export default async function Home() {
  // 从数据库获取笔记列表（按创建时间倒序）
  const notes = await prisma.note.findMany({
    include: {
      tags: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  })

  return (
    <div className="container py-6 md:py-10">
      <header className="mb-8">
        <h1 className="text-3xl font-bold">LightNote</h1>
        <p className="text-muted-foreground mt-2">轻量化的网页内容收藏工具</p>
      </header>
      
      <NoteList notes={notes} />
    </div>
  )
} 