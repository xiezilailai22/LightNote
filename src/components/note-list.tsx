"use client"

import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ExternalLink, TagIcon } from 'lucide-react'
import { format } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import { type Note, type Tag } from '@prisma/client'

interface NoteWithTags extends Note {
  tags: Tag[]
}

interface NoteListProps {
  notes: NoteWithTags[]
}

export default function NoteList({ notes }: NoteListProps) {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {notes.length === 0 ? (
        <p className="text-muted-foreground col-span-full text-center py-10">
          还没有保存任何笔记。使用浏览器插件开始保存内容吧！
        </p>
      ) : (
        notes.map((note) => (
          <Card key={note.id} className="flex flex-col">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start gap-2">
                <time 
                  dateTime={note.createdAt.toISOString()} 
                  className="text-xs text-muted-foreground"
                >
                  {format(note.createdAt, 'yyyy年MM月dd日 HH:mm', { locale: zhCN })}
                </time>

                <a 
                  href={note.sourceUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary hover:underline flex items-center gap-1 text-sm"
                >
                  <ExternalLink size={14} />
                  {note.sourceTitle || '原文链接'}
                </a>
              </div>
            </CardHeader>
            
            <CardContent className="flex-grow">
              <p className="whitespace-pre-wrap break-words">{note.content}</p>
            </CardContent>
            
            {note.tags.length > 0 && (
              <CardFooter className="flex flex-wrap gap-2 border-t pt-3">
                <TagIcon size={14} className="text-muted-foreground" />
                {note.tags.map((tag) => (
                  <Badge key={tag.id} variant="outline" className="text-xs">
                    {tag.name}
                  </Badge>
                ))}
              </CardFooter>
            )}
          </Card>
        ))
      )}
    </div>
  )
} 