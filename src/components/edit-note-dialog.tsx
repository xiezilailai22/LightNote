"use client"

import * as React from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { TagInput } from "@/components/ui/tag-input"

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

interface EditNoteDialogProps {
  note: NoteWithTags
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function EditNoteDialog({
  note,
  open,
  onOpenChange,
  onSuccess
}: EditNoteDialogProps) {
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [sourceUrl, setSourceUrl] = React.useState(note.sourceUrl)
  const [sourceTitle, setSourceTitle] = React.useState(note.sourceTitle || "")
  const [content, setContent] = React.useState(note.content)
  const [tags, setTags] = React.useState<string[]>(note.tags.map(tag => tag.name))
  const [errors, setErrors] = React.useState<Record<string, string>>({})

  // 当对话框打开时重置表单
  React.useEffect(() => {
    if (open) {
      setSourceUrl(note.sourceUrl)
      setSourceTitle(note.sourceTitle || "")
      setContent(note.content)
      setTags(note.tags.map(tag => tag.name))
      setErrors({})
    }
  }, [open, note])

  // 表单验证
  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    
    if (!sourceUrl.trim()) {
      newErrors.sourceUrl = "原文链接不能为空"
    } else if (!/^https?:\/\/.+/.test(sourceUrl)) {
      newErrors.sourceUrl = "请输入有效的URL"
    }
    
    if (!sourceTitle.trim()) {
      newErrors.sourceTitle = "原文标题不能为空"
    }
    
    if (!content.trim()) {
      newErrors.content = "内容不能为空"
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // 提交表单
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm() || isSubmitting) {
      return
    }
    
    try {
      setIsSubmitting(true)
      
      const response = await fetch(`/api/notes/${note.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          sourceUrl,
          sourceTitle,
          content,
          tags
        })
      })
      
      if (!response.ok) {
        throw new Error("更新笔记失败")
      }
      
      onSuccess?.()
    } catch (error) {
      console.error("更新笔记出错:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>编辑笔记</DialogTitle>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="sourceUrl">原文链接</Label>
              <Input
                id="sourceUrl"
                value={sourceUrl}
                onChange={(e) => setSourceUrl(e.target.value)}
                placeholder="https://example.com"
                required
              />
              {errors.sourceUrl && (
                <p className="text-sm text-destructive">{errors.sourceUrl}</p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="sourceTitle">原文标题</Label>
              <Input
                id="sourceTitle"
                value={sourceTitle}
                onChange={(e) => setSourceTitle(e.target.value)}
                placeholder="原文标题"
                required
              />
              {errors.sourceTitle && (
                <p className="text-sm text-destructive">{errors.sourceTitle}</p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="content">内容</Label>
              <Textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="笔记内容"
                rows={6}
                required
              />
              {errors.content && (
                <p className="text-sm text-destructive">{errors.content}</p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="tags">标签</Label>
              <TagInput
                id="tags"
                tags={tags}
                setTags={setTags}
                placeholder="输入标签，按回车或逗号添加"
                maxTags={10}
                maxLength={20}
              />
              <p className="text-xs text-muted-foreground">
                最多添加10个标签，每个标签最长20个字符
              </p>
            </div>
          </div>
          
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              取消
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "保存中..." : "保存"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
} 