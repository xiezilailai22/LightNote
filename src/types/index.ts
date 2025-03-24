import { Prisma } from '@prisma/client'

// 预定义一些常用的Prisma类型
export type NoteWithTags = Prisma.NoteGetPayload<{
  include: { tags: true }
}>

export type TagWithNotes = Prisma.TagGetPayload<{
  include: { notes: true }
}>

// 浏览器扩展保存的内容格式
export interface SaveNoteData {
  content: string
  sourceUrl: string
  sourceTitle?: string
  tags?: string[]
} 