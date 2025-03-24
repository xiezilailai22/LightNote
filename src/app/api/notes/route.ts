import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

// 保存笔记的请求体类型
interface SaveNoteData {
  content: string
  sourceUrl: string
  sourceTitle?: string
  tags?: string[]
}

export async function POST(request: Request) {
  try {
    const data: SaveNoteData = await request.json()
    
    // 验证基本必填字段
    if (!data.content || !data.sourceUrl) {
      return NextResponse.json(
        { error: '内容和来源链接是必填项' },
        { status: 400 }
      )
    }

    // 处理标签（如果有）
    let tags = []
    if (data.tags && data.tags.length > 0) {
      // 对每个标签名进行处理（去重、清理）
      const uniqueTags = Array.from(new Set(data.tags.map(tag => tag.trim()).filter(Boolean)))
      
      // 为每个标签创建或查找标签记录
      tags = await Promise.all(
        uniqueTags.map(async (tagName) => {
          // 查找或创建标签
          return await prisma.tag.upsert({
            where: { name: tagName },
            update: {}, // 已存在则不更新
            create: { name: tagName },
          })
        })
      )
    }

    // 创建笔记记录
    const note = await prisma.note.create({
      data: {
        content: data.content,
        sourceUrl: data.sourceUrl,
        sourceTitle: data.sourceTitle,
        tags: {
          connect: tags.map(tag => ({ id: tag.id })),
        },
      },
      include: {
        tags: true,
      },
    })

    return NextResponse.json({ success: true, note })
  } catch (error) {
    console.error('保存笔记失败:', error)
    return NextResponse.json(
      { error: '保存笔记失败，请稍后重试' },
      { status: 500 }
    )
  }
} 