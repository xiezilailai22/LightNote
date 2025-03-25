"use client"

import { useState } from 'react'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ExternalLink, TagIcon, Edit, Trash2, ChevronDown, ChevronUp } from 'lucide-react'
import { format } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import { prisma } from '@/lib/db'
import { Button } from '@/components/ui/button'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { EditNoteDialog } from '@/components/edit-note-dialog'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'

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
  // 新增：跟踪标签展开状态
  const [expandedTags, setExpandedTags] = useState<Record<string, boolean>>({})

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

  // 新增：切换标签展开状态
  const toggleTagsExpanded = (noteId: string) => {
    setExpandedTags(prev => ({
      ...prev,
      [noteId]: !prev[noteId]
    }))
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
            <CardHeader className="pb-2 pt-3 px-4 flex-shrink-0 h-[72px] border-b">
              <div className="flex justify-between items-center w-full">
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
            <CardContent className="flex-grow overflow-hidden py-3 px-4">
              <p className="text-sm h-full overflow-hidden">{note.content}</p>
            </CardContent>
            
            {/* 底部容器：标签，固定高度，可展开 */}
            <CardFooter className={cn(
              "flex-col border-t pt-3 pb-3 px-4 mt-auto w-full flex-shrink-0 transition-all duration-200",
              expandedTags[note.id] ? "max-h-[120px] overflow-y-auto" : "h-[48px]"
            )}>
              <div className="flex items-start w-full">
                <TagIcon size={14} className="text-muted-foreground mr-2 flex-shrink-0 mt-0.5" />
                
                {note.tags.length === 0 ? (
                  <span className="text-xs text-muted-foreground">暂无标签</span>
                ) : (
                  <div className="flex justify-between items-start w-full">
                    {/* 显示标签，收起时仅显示4个标签，展开时显示全部 */}
                    <div className="flex flex-wrap gap-2 flex-grow" style={{ maxHeight: expandedTags[note.id] ? 'unset' : '24px', overflow: 'hidden' }}>
                      {(expandedTags[note.id] 
                        ? note.tags 
                        : note.tags.slice(0, 4)
                      ).map((tag) => (
                        <Badge key={tag.id} variant="outline" className="text-xs">
                          {tag.name}
                        </Badge>
                      ))}
                    </div>

                    {/* 显示展开/收起按钮，只在标签数量>4时显示 */}
                    {note.tags.length > 4 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 ml-1 flex-shrink-0"
                        onClick={() => toggleTagsExpanded(note.id)}
                        title={expandedTags[note.id] ? "收起" : "展开"}
                      >
                        {expandedTags[note.id] ? (
                          <ChevronUp size={14} />
                        ) : (
                          <ChevronDown size={14} />
                        )}
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </CardFooter>

            {/* 删除确认对话框 */}
            <AlertDialog open={openDeleteDialog === note.id} onOpenChange={(isOpen: boolean) => {
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
            onOpenChange={(isOpen: boolean) => {
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