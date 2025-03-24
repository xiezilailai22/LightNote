"use client"

import { useState } from 'react'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ExternalLink, TagIcon, Edit, Trash2 } from 'lucide-react'
import { format } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import { prisma } from '@/lib/db'
import { Button } from '@/components/ui/button'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { EditNoteDialog } from '@/components/edit-note-dialog'
import { useRouter } from 'next/navigation'

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
  const router = useRouter()
  const [openDeleteDialog, setOpenDeleteDialog] = useState<string | null>(null)
  const [openEditDialog, setOpenEditDialog] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  // 处理删除笔记
  const handleDelete = async (noteId: string) => {
    if (deleting) return
    
    try {
      setDeleting(true)
      const response = await fetch(`/api/notes/${noteId}`, {
        method: 'DELETE',
      })
      
      if (!response.ok) {
        throw new Error('删除笔记失败')
      }
      
      // 刷新页面数据
      router.refresh()
      setOpenDeleteDialog(null)
    } catch (error) {
      console.error('删除笔记出错:', error)
    } finally {
      setDeleting(false)
    }
  }

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
              <div className="flex justify-between items-start">
                {/* 第一排：日期、时间 */}
                <time 
                  dateTime={note.createdAt.toISOString()} 
                  className="text-xs text-muted-foreground"
                >
                  {format(note.createdAt, 'yyyy年MM月dd日 HH:mm', { locale: zhCN })}
                </time>

                {/* 操作按钮组 */}
                <div className="flex gap-1">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-7 w-7" 
                    onClick={() => setOpenEditDialog(note.id)}
                    title="编辑"
                  >
                    <Edit size={14} />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-7 w-7 text-destructive" 
                    onClick={() => setOpenDeleteDialog(note.id)}
                    title="删除"
                  >
                    <Trash2 size={14} />
                  </Button>
                </div>
              </div>

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

            {/* 删除确认对话框 */}
            <AlertDialog open={openDeleteDialog === note.id} onOpenChange={(isOpen) => {
              if (!isOpen) setOpenDeleteDialog(null)
            }}>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>确认删除</AlertDialogTitle>
                  <AlertDialogDescription>
                    你确定要删除这条笔记吗？此操作不可恢复。
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel disabled={deleting}>取消</AlertDialogCancel>
                  <AlertDialogAction 
                    onClick={() => handleDelete(note.id)} 
                    disabled={deleting}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    {deleting ? '删除中...' : '确认删除'}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </Card>
        ))
      )}

      {/* 编辑笔记对话框 */}
      {notes.map((note) => (
        openEditDialog === note.id && (
          <EditNoteDialog 
            key={`edit-${note.id}`}
            note={note}
            open={openEditDialog === note.id}
            onOpenChange={(isOpen) => {
              if (!isOpen) setOpenEditDialog(null)
            }}
            onSuccess={() => {
              setOpenEditDialog(null)
              router.refresh()
            }}
          />
        )
      ))}
    </div>
  )
} 