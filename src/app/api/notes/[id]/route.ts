import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

// 更新笔记
export async function PATCH(
  request: Request, 
  { params }: { params: { id: string } }
) {
  try {
    const noteId = params.id
    const data = await request.json()
    
    // 验证基本必填字段
    if (!data.content || !data.sourceUrl || !data.sourceTitle) {
      return NextResponse.json(
        { error: '内容、来源链接和标题是必填项' },
        { status: 400 }
      )
    }
    
    // 处理标签
    let tags = []
    if (data.tags && Array.isArray(data.tags)) {
      // 过滤和清理标签
      const uniqueTags = [...new Set(
        data.tags
          .map((tag: string) => tag.trim())
          .filter(Boolean)
          .slice(0, 10) // 最多10个标签
          .map((tag: string) => tag.slice(0, 20)) // 每个标签最长20个字符
      )]
      
      // 获取现有标签
      const existingTags = await prisma.tag.findMany({
        where: {
          name: {
            in: uniqueTags,
          },
        },
      })
      
      // 过滤出需要创建的新标签
      const existingTagNames = existingTags.map(tag => tag.name)
      const newTagNames = uniqueTags.filter(tag => !existingTagNames.includes(tag))
      
      // 创建新标签
      const newTags = await Promise.all(
        newTagNames.map(async (tagName) => {
          return await prisma.tag.create({
            data: { name: tagName },
          })
        })
      )
      
      tags = [...existingTags, ...newTags]
    }
    
    // 获取当前笔记的标签
    const currentNote = await prisma.note.findUnique({
      where: { id: noteId },
      include: { tags: true },
    })
    
    if (!currentNote) {
      return NextResponse.json(
        { error: '笔记不存在' },
        { status: 404 }
      )
    }
    
    // 更新笔记
    const updatedNote = await prisma.note.update({
      where: { id: noteId },
      data: {
        content: data.content,
        sourceUrl: data.sourceUrl,
        sourceTitle: data.sourceTitle,
        tags: {
          // 断开所有现有标签连接
          disconnect: currentNote.tags.map(tag => ({ id: tag.id })),
          // 连接新标签
          connect: tags.map(tag => ({ id: tag.id })),
        },
      },
      include: {
        tags: true,
      },
    })
    
    return NextResponse.json({ success: true, note: updatedNote })
  } catch (error) {
    console.error('更新笔记失败:', error)
    return NextResponse.json(
      { error: '更新笔记失败，请稍后重试' },
      { status: 500 }
    )
  }
}

// 删除笔记
export async function DELETE(
  _request: Request, 
  { params }: { params: { id: string } }
) {
  try {
    const noteId = params.id
    
    // 验证笔记是否存在
    const note = await prisma.note.findUnique({
      where: { id: noteId },
    })
    
    if (!note) {
      return NextResponse.json(
        { error: '笔记不存在' },
        { status: 404 }
      )
    }
    
    // 删除笔记
    await prisma.note.delete({
      where: { id: noteId },
    })
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('删除笔记失败:', error)
    return NextResponse.json(
      { error: '删除笔记失败，请稍后重试' },
      { status: 500 }
    )
  }
} 