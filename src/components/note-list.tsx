"use client"

import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ExternalLink, TagIcon } from 'lucide-react'
import { format } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import { prisma } from '@/lib/db'

// 使用Prisma类型定义笔记和标签的接口
interface NoteWithTags {
  id: string
  content: string
  sourceUrl: string
  sourceTitle: string | null
  createdAt: Date
  updatedAt: Date
  folderId: string | null
  tags: {
    id: string
    name: string
    color: string | null
    createdAt: Date
  }[]
}

interface NoteListProps {
  notes: NoteWithTags[]
}

export default function NoteList({ notes }: NoteListProps) {
  return (
    <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 auto-rows-fr">
      {notes.length === 0 ? (
        <p className="text-muted-foreground col-span-full text-center py-10">
          还没有保存任何笔记。使用浏览器插件开始保存内容吧！
        </p>
      ) : (
        notes.map((note) => (
          <Card key={note.id} className="flex flex-col h-[calc(33vh-2rem)] min-h-[200px]">
            <CardHeader className="pb-2 space-y-2">
              {/* 第一排：日期、时间 */}
              <time 
                dateTime={note.createdAt.toISOString()} 
                className="text-xs text-muted-foreground"
              >
                {format(note.createdAt, 'yyyy年MM月dd日 HH:mm', { locale: zhCN })}
              </time>

              {/* 第二排：原文地址 */}
              <a 
                href={note.sourceUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary hover:underline flex items-center gap-1 text-sm truncate"
                title={note.sourceTitle || note.sourceUrl}
              >
                <ExternalLink size={14} />
                <span className="truncate">{note.sourceTitle || '原文链接'}</span>
              </a>
            </CardHeader>
            
            {/* 正文：占满剩余空间，超出部分省略 */}
            <CardContent className="flex-grow overflow-hidden">
              <p className="line-clamp-[8] text-sm">{note.content}</p>
            </CardContent>
            
            {/* 最后一排：标签，无标签时显示"暂无标签" */}
            <CardFooter className="flex flex-wrap gap-2 border-t pt-3 mt-auto">
              <TagIcon size={14} className="text-muted-foreground" />
              {note.tags.length > 0 ? (
                note.tags.map((tag) => (
                  <Badge key={tag.id} variant="outline" className="text-xs">
                    {tag.name}
                  </Badge>
                ))
              ) : (
                <span className="text-xs text-muted-foreground">暂无标签</span>
              )}
            </CardFooter>
          </Card>
        ))
      )}
    </div>
  )
} 